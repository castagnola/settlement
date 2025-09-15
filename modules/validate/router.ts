import express from "express";
import { ValidateController } from "./controller/validate.controller";

export const ValidateRouter = express.Router();

ValidateRouter.use(ValidateController);