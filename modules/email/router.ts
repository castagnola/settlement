import express from "express";
import { EmailController } from "./controller/email.controller";

export const EmailRouter = express.Router();

EmailRouter.use(EmailController);