import express from "express";
import { AdjustmentNoteControllerDraft } from "./controller/draft/adjustmentNoteDraft.controller";
import { AdjustmentNoteControllerSettlements } from "./controller/settlements/adjustmentNoteSettlements.controller";
import { AdjustmentNoteControllerOrder } from "./controller/orders/adjustmentNoteOrder.controller";
import { AdjustmentNoteControllerMassive } from "./controller/massive/adjustmentNoteMassive.controller";
export const AdjustmentRouter = express.Router();

AdjustmentRouter.use(AdjustmentNoteControllerDraft);
AdjustmentRouter.use(AdjustmentNoteControllerOrder);
AdjustmentRouter.use(AdjustmentNoteControllerSettlements);
AdjustmentRouter.use(AdjustmentNoteControllerMassive);