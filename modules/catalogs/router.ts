import express from "express";
import { CatalogsController } from "./controller/catalogs.controller";

export const CatalogsRouter = express.Router();

CatalogsRouter.use(CatalogsController);