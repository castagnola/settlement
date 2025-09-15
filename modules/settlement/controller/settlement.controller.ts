import { Request, Response, Router } from "express";
import { ISettlementDomainInterface } from "../domain/settlement.interface";
import { SettlementDomain } from "../domain/settlement.domain";
import { handleResponse, HttpCode } from "vanti-utils/lib";
import { GetSettlementViewOptions, ResponseCheckSettlement, SETTLEMENT_ADJUSTMENT_NOTE_VANTILISTO, SETTLEMENT_VANTILISTO, UpdateSettlementState } from "../type/settlement.type";
import { verifytoken } from "../../../middleware/verifyToken/verifyToken.middleware";
import multer from "multer";
import { Status } from "../../../models/settlement/index";
import { validateGetSettlementParam, ValidateUpdateSettlementStatus } from "../validator/settlement.validator";
import { ApprovedStatus } from "src/models/adjustmentNoteSettlement";
import { ApproverDomain } from "../domain/approver/approver.domain";
import { IApproverDomainInterface } from "../domain/approver/approver.interface";

export const SettlementController = Router();

SettlementController.get('/settlements',
    verifytoken,
    validateGetSettlementParam,
    async (req: Request, res: Response) => {
        let options: GetSettlementViewOptions = req.query;
        let settlementDomain: ISettlementDomainInterface = new SettlementDomain();
        let response = await settlementDomain.getSettlements(options);
        handleResponse(res, 200, response);
    })

SettlementController.post('/new-settlement',
    multer().single('settlement'),
    verifytoken,
    async (req: Request, res: Response) => {
        const orderClass: string = req.headers['x-orderclass'] as string || 'ZFM6';
        let ordersDomain: ISettlementDomainInterface = new SettlementDomain();
        let user: string = req.body.user.email;
        let response = await ordersDomain.createNewSettlement(req.file.buffer, orderClass, user);
        log.info('response', response);
        handleResponse(res, 200, response);
    })

SettlementController.put('/update-settlement/:settlementId', async (req: Request, res: Response) => {
    let { settlementId } = req.params;
    const { status } = req.body;
    let settlementDomain: ISettlementDomainInterface = new SettlementDomain();
    let response = await settlementDomain.updateSettlement(settlementId, status);
    handleResponse(res, 200, response);
})

SettlementController.get('/check-settlement/:settlementId', verifytoken, async (req: Request, res: Response) => {
    const { settlementId } = req.params;
    const settlementDomain: ISettlementDomainInterface = new SettlementDomain();
    const response: ResponseCheckSettlement = await settlementDomain.checkSettlemnt(settlementId)

    if(response.status == Status.PROCESING) {
        handleResponse(res, 202, response.status)
    } else {
        handleResponse(res, 200, response.validate)
    }
})

SettlementController.get('/approval-settlement/:settlementId', verifytoken, async (req: Request, res: Response) => {
    const { settlementId } = req.params;
    const settlementDomain: ISettlementDomainInterface = new SettlementDomain();
    const response = await settlementDomain.approvalSettlement(settlementId);

    handleResponse(res, 200, response);
})

SettlementController.get('/email-report', verifytoken, async (req: Request, res: Response) => {
    const settlementDomain: ISettlementDomainInterface = new SettlementDomain();
    const response: string = await settlementDomain.getEmailReport();

    handleResponse(res, HttpCode.OK, response);
})

SettlementController.put(
    "/approver-review/:settlementId",
    ValidateUpdateSettlementStatus,
    verifytoken,
    async (req: Request, res: Response) => {
        const settlementId: string = String(req.params.settlementId);
        const updateData: UpdateSettlementState = req.body as UpdateSettlementState;
        const settlementDomain: ISettlementDomainInterface = new SettlementDomain();
        const approverDomain:IApproverDomainInterface = new ApproverDomain();
        const splitSettlementId = settlementId.split("-")[0];
        const userEmail = req.body.user.email;
        updateData.user = userEmail;

        switch (splitSettlementId) {
            case SETTLEMENT_VANTILISTO: {
                const { status, data } = await settlementDomain.UpdateSettlementStatus(settlementId, updateData);
                handleResponse(res, HttpCode.OK, data, status);
                break;
            }
            case SETTLEMENT_ADJUSTMENT_NOTE_VANTILISTO: {
                const adjustmentNoteStatus = updateData.status as unknown as ApprovedStatus;
                const message = updateData.message;
                const responseAdjustmentNote = await approverDomain.updateApproverStatus(settlementId, adjustmentNoteStatus, userEmail, message);
                log.info('[update-settlement-adjustment-note-vantilisto] la liquidación %s fue aprobada por: %s', settlementId, updateData.user);
                const { status: adjStatus, data: adjData } = responseAdjustmentNote;
                handleResponse(res, HttpCode.OK, adjData, adjStatus);
                break;
            }
            default:{
                throw new Error("Invalid settlementId");
            }
        }
    }
);

SettlementController.get('/email-collaborators/:settlementId', async (req: Request, res: Response) => {
    const settlementId: string = String(req.params.settlementId);

    const settlementDomain: ISettlementDomainInterface = new SettlementDomain();
    const response = await settlementDomain.UploadRabbitApproveSettlement(settlementId);

    handleResponse(res, HttpCode.OK, response);
})