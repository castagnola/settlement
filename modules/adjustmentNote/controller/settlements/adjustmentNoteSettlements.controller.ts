import { Request, Response, Router } from "express";
import { handleResponse, HttpCode } from "vanti-utils/lib";
import { AdjustmentNoteDomainSettlements, IAdjustmentNoteDomainSettlements } from "../../domain";
import { verifytoken } from "../../../../middleware/verifyToken/verifyToken.middleware";
import multer from "multer"

export const AdjustmentNoteControllerSettlements = Router();

AdjustmentNoteControllerSettlements.get('/settlements',
    verifytoken,
    async (req: Request, res: Response) => {
        let options: any = req.query;
        let emailDomain: IAdjustmentNoteDomainSettlements = new AdjustmentNoteDomainSettlements();
        let response = await emailDomain.getAdjustmentNotes(options);
        handleResponse(res, HttpCode.OK, response);
    }
);

AdjustmentNoteControllerSettlements.post('/new-settlement', multer().single('settlement'), verifytoken,
    async (req: Request, res: Response) => {
        const file = req.file.buffer
        const fileName = req.file.originalname;
        const settlementId = req.query.settlementId as string;
        const userEmail = req.body.user.email;

        const emailDomain: IAdjustmentNoteDomainSettlements = new AdjustmentNoteDomainSettlements();
        const response = await emailDomain.createNewSettlement(file, fileName, userEmail, settlementId);
        log.info('[new-settlement-adjustmentNote] Liquidación %s de nota de ajuste iniciada - correo: %s', response.message, userEmail);

        handleResponse(res, HttpCode.OK, response.message, response.status ? HttpCode.OK : HttpCode.BAD_REQUEST);
    }
);

AdjustmentNoteControllerSettlements.get('/approval-settlement/:settlementId', verifytoken, async (req: Request, res: Response) => {
    const { settlementId } = req.params;
    const settlementDomain: IAdjustmentNoteDomainSettlements = new AdjustmentNoteDomainSettlements();
    log.info('[update-settlement-adjustmentNote] Inicio de proceso - correo: %s', req.body.user.email);
    const response = await settlementDomain.approvalSettlementAdjustmentNote(settlementId);
    handleResponse(res, HttpCode.OK, response);
})