import { Request, Response, Router } from "express";
import { handleResponse, HttpCode } from "vanti-utils/lib";
import { AdjustmentNoteDomainOrders, IAdjustmentNoteDomainOrders } from "../../domain";
import { verifytoken } from "../../../../middleware/verifyToken/verifyToken.middleware";

export const AdjustmentNoteControllerOrder = Router();

AdjustmentNoteControllerOrder.get(
    "/orders",
    verifytoken,
    async (req: Request, res: Response) => {
        let emailDomain: IAdjustmentNoteDomainOrders = new AdjustmentNoteDomainOrders();
        const settlementId = req.query.settlementId as string | undefined;
        emailDomain.getOrdersToNewSettlement(settlementId);
        const response = await emailDomain.getCountAdjustmentNotesToNewSettlement(settlementId);
        handleResponse(res, HttpCode.OK, response)
    }
);