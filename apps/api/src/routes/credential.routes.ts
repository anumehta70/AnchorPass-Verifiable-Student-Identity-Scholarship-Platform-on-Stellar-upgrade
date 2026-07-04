import { Router } from "express";
import {
  prepareCredentialMetadata,
  finalizeCredential,
  getCredential,
  listCredentialsForStudent,
  revokeCredential,
} from "../controllers/credential.controller.js";

export const credentialRouter = Router();

credentialRouter.post("/prepare", prepareCredentialMetadata);
credentialRouter.post("/", finalizeCredential);
credentialRouter.get("/:id", getCredential);
credentialRouter.get("/student/:wallet", listCredentialsForStudent);
credentialRouter.post("/:id/revoke", revokeCredential);
