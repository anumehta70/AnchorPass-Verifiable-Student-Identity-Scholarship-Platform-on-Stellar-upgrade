import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { pinCertificateMetadata } from "../services/ipfs.service.js";
import { generateVerificationQr, buildVerificationUrl } from "../services/qr.service.js";
import { track } from "../lib/monitoring.js";

const prepareSchema = z.object({
  studentWallet: z.string().min(20),
  institutionWallet: z.string().min(20),
  institutionName: z.string().min(1),
  credentialTitle: z.string().min(1),
  scholarshipId: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Step 1 of credential issuance: pin metadata to IPFS and return the CID.
 * The frontend then takes this CID and calls `issue_credential` on the
 * Soroban contract directly via Freighter (backend never signs).
 */
export async function prepareCredentialMetadata(req: Request, res: Response) {
  const body = prepareSchema.parse(req.body);

  const { cid, url } = await pinCertificateMetadata({
    credentialTitle: body.credentialTitle,
    studentWallet: body.studentWallet,
    institutionName: body.institutionName,
    institutionWallet: body.institutionWallet,
    issuedAt: new Date().toISOString(),
    scholarshipId: body.scholarshipId,
    description: body.description,
  });

  res.json({ ipfsHash: cid, ipfsUrl: url });
}

const finalizeSchema = z.object({
  contractCredentialId: z.string(),
  transactionHash: z.string().min(1),
  title: z.string().min(1),
  studentWallet: z.string().min(20),
  institutionWallet: z.string().min(20),
  ipfsHash: z.string().min(1),
});

/**
 * Step 2: after the on-chain `issue_credential` tx confirms, persist the
 * record for fast dashboard queries and generate the QR code.
 */
export async function finalizeCredential(req: Request, res: Response) {
  const body = finalizeSchema.parse(req.body);

  const credential = await prisma.credential.create({
    data: {
      contractCredentialId: BigInt(body.contractCredentialId),
      transactionHash: body.transactionHash,
      title: body.title,
      studentWallet: body.studentWallet,
      institutionWallet: body.institutionWallet,
      ipfsHash: body.ipfsHash,
      status: "VALID",
    },
  });

  track("credential_issued", body.institutionWallet, {
    credentialId: credential.id,
    studentWallet: body.studentWallet,
  });

  const qrCode = await generateVerificationQr(credential.id);

  res.status(201).json({
    ...serializeCredential(credential),
    verificationUrl: buildVerificationUrl(credential.id),
    qrCode,
  });
}

export async function getCredential(req: Request, res: Response) {
  const { id } = req.params;

  const credential = await prisma.credential.findUnique({
    where: { id },
    include: { institution: true },
  });

  if (!credential) {
    return res.status(404).json({ error: "Credential not found" });
  }

  track("credential_verified", req.ip ?? "anonymous", { credentialId: id });

  res.json({
    ...serializeCredential(credential),
    verificationUrl: buildVerificationUrl(id),
  });
}

export async function listCredentialsForStudent(req: Request, res: Response) {
  const { wallet } = req.params;
  const credentials = await prisma.credential.findMany({
    where: { studentWallet: wallet },
    include: { institution: true },
    orderBy: { issuedAt: "desc" },
  });
  res.json(credentials.map(serializeCredential));
}

const revokeSchema = z.object({
  transactionHash: z.string().min(1),
});

export async function revokeCredential(req: Request, res: Response) {
  const { id } = req.params;
  const { transactionHash } = revokeSchema.parse(req.body);

  const credential = await prisma.credential.update({
    where: { id },
    data: { status: "REVOKED", revokedAt: new Date(), transactionHash },
  });

  track("credential_revoked", credential.institutionWallet, { credentialId: id });

  res.json(serializeCredential(credential));
}

function serializeCredential(c: Record<string, unknown>) {
  return { ...c, contractCredentialId: String(c.contractCredentialId) };
}
