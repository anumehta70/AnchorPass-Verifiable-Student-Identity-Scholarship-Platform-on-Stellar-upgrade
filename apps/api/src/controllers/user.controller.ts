import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { track } from "../lib/monitoring.js";

const createUserSchema = z.object({
  walletAddress: z.string().min(20),
  role: z.enum(["INSTITUTION", "STUDENT", "VERIFIER"]),
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export async function createOrGetUser(req: Request, res: Response) {
  const body = createUserSchema.parse(req.body);

  const user = await prisma.user.upsert({
    where: { walletAddress: body.walletAddress },
    update: { name: body.name, email: body.email },
    create: body,
  });

  if (user.role === "INSTITUTION") {
    await prisma.institution.upsert({
      where: { walletAddress: body.walletAddress },
      update: {},
      create: {
        walletAddress: body.walletAddress,
        name: body.name ?? "Unnamed Institution",
      },
    });
  }

  track("wallet_connected", body.walletAddress, { role: body.role });

  res.status(200).json(user);
}

export async function getUserByWallet(req: Request, res: Response) {
  const { wallet } = req.params;
  const user = await prisma.user.findUnique({ where: { walletAddress: wallet } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user);
}
