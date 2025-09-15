import express from "express";
import { OrdersController } from "./controller/order.controller";

export const OrdersRouter = express.Router();

OrdersRouter.use(OrdersController);