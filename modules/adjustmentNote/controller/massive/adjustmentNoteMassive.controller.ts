import { Request, Response, Router } from "express";
import { verifytoken } from "../../../../middleware/verifyToken/verifyToken.middleware";
import { handleResponse, HttpCode } from "vanti-utils/lib";
import { AdjustmentNoteDomainMassive } from "../../domain/massive/adjustmentNoteMassive.domain";
import { IAdjustmentNoteDomainMassive } from "../../domain/massive/adjustmentNoteMassive.domain.interface";
import multer from "multer";

export const AdjustmentNoteControllerMassive = Router();

AdjustmentNoteControllerMassive.get(
    "/mass-order/last-upload",
    verifytoken,
    async (req, res) => {
        let adjustmentNoteDomain: IAdjustmentNoteDomainMassive = new AdjustmentNoteDomainMassive();
        const result = await adjustmentNoteDomain.getLastUpload();
        handleResponse(res, 200, { result });
    }
);

AdjustmentNoteControllerMassive.get(
    '/mass-order/orders',
    verifytoken,
    async (req: Request, res: Response) => {
        const adjustmentNoteDomain: IAdjustmentNoteDomainMassive = new AdjustmentNoteDomainMassive();
        const response = await adjustmentNoteDomain.getOrderMassiveFile();
        handleResponse(res, HttpCode.OK, response);
    }
)

AdjustmentNoteControllerMassive.post(
    '/mass-order/save',
    verifytoken,
    multer().single('orders'),
    async (req: Request, res: Response) => {
        const file = req.file.buffer
        const fileName = req.file.originalname;

        const adjustmentNoteDomain: IAdjustmentNoteDomainMassive = new AdjustmentNoteDomainMassive();
        const response = await adjustmentNoteDomain.saveMassiveOrders(file, fileName);
        if (!response.save) {
            handleResponse(res, HttpCode.OK, response, HttpCode.BAD_REQUEST);
        } else {
            handleResponse(res, HttpCode.OK, response);
        }
    }
)