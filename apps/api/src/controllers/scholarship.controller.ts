import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { track } from "../lib/monitoring.js";

const createScholarshipSchema = z.object({
  contractScholarshipId: z.string(), // BigInt as string over the wire
  transactionHash: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  amount: z.string(), // Decimal as string
  totalSeats: z.number().int().positive(),
  deadline: z.string(), // ISO date
  eligibility: z.string().optional(),
  institutionWallet: z.string().min(20),
});

/**
 * Called AFTER the frontend has already submitted `create_scholarship` to
 * the Soroban contract via Freighter and received a transaction hash back.
 * This persists the off-chain-friendly copy for fast listing/search.
 */
export async function createScholarship(req: Request, res: Response) {
  const body = createScholarshipSchema.parse(req.body);

  const scholarship = await prisma.scholarship.create({
    data: {
      contractScholarshipId: BigInt(body.contractScholarshipId),
      transactionHash: body.transactionHash,
      title: body.title,
      description: body.description,
      amount: body.amount,
      totalSeats: body.totalSeats,
      deadline: new Date(body.deadline),
      eligibility: body.eligibility,
      institutionWallet: body.institutionWallet,
      status: "OPEN",
    },
  });

  track("scholarship_created", body.institutionWallet, {
    scholarshipId: scholarship.id,
    amount: body.amount,
  });

  res.status(201).json(serializeScholarship(scholarship));
}

export async function listScholarships(req: Request, res: Response) {
  const { institutionWallet, studentWallet } = req.query;

  const where: Record<string, unknown> = {};
  if (institutionWallet) where.institutionWallet = String(institutionWallet);

  const scholarships = await prisma.scholarship.findMany({
    where: studentWallet
      ? { assignments: { some: { studentWallet: String(studentWallet) } } }
      : where,
    include: { assignments: true, institution: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(scholarships.map(serializeScholarship));
}

const assignSchema = z.object({
  studentWallet: z.string().min(20),
});

export async function assignStudent(req: Request, res: Response) {
  const { id } = req.params;
  const { studentWallet } = assignSchema.parse(req.body);

  const assignment = await prisma.scholarshipAssignment.create({
    data: { scholarshipId: id, studentWallet },
  });

  track("student_assigned", studentWallet, { scholarshipId: id });

  res.status(201).json(assignment);
}

const claimSchema = z.object({
  studentWallet: z.string().min(20),
  transactionHash: z.string().min(1),
});

export async function recordClaim(req: Request, res: Response) {
  const { id } = req.params;
  const { studentWallet, transactionHash } = claimSchema.parse(req.body);

  const assignment = await prisma.scholarshipAssignment.update({
    where: { scholarshipId_studentWallet: { scholarshipId: id, studentWallet } },
    data: { claimed: true, claimedAt: new Date(), claimTxHash: transactionHash },
  });

  track("scholarship_claimed", studentWallet, { scholarshipId: id, transactionHash });

  res.json(assignment);
}

function serializeScholarship(s: Record<string, unknown>) {
  return {
    ...s,
    contractScholarshipId: String(s.contractScholarshipId),
  };
}
