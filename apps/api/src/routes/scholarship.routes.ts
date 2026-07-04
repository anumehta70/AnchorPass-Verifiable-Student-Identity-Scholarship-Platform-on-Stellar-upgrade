import { Router } from "express";
import {
  createScholarship,
  listScholarships,
  assignStudent,
  recordClaim,
} from "../controllers/scholarship.controller.js";

export const scholarshipRouter = Router();

scholarshipRouter.post("/", createScholarship);
scholarshipRouter.get("/", listScholarships);
scholarshipRouter.post("/:id/assign", assignStudent);
scholarshipRouter.post("/:id/claim", recordClaim);
