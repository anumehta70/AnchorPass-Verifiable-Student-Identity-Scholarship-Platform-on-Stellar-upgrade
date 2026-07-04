import { Router } from "express";
import { createOrGetUser, getUserByWallet } from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.post("/", createOrGetUser);
userRouter.get("/:wallet", getUserByWallet);
