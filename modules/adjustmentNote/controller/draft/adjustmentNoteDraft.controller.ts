import { Request, Response, Router } from "express";
import { handleResponse, HttpCode } from "vanti-utils/lib";
import { verifytoken } from "../../../../middleware/verifyToken/verifyToken.middleware";
import { validateGetAdjustmentNotesSettlement, validateGetPaginatedResultsParam, validateGetTotalBySocietyParam, validateMarkOrders, validateNewSettlement } from "../../validator/adjustmentNote.validator";
import { AdjustmentNoteDomainDraft, IAdjustmentNoteDomainDraft } from "../../domain";

export const AdjustmentNoteControllerDraft = Router();

AdjustmentNoteControllerDraft.get(
    "/draft/settlement-society/:settlemnetId",
    verifytoken,
    validateGetPaginatedResultsParam,
    async (req: Request, res: Response) => {
        const settlemnetId = req.params.settlemnetId;
        const society = req.query.society as string;
        const page = parseInt(req.query.page as string, 10);
        const limit = parseInt(req.query.limit as string, 10);

        let adjustmentNoteDomain: IAdjustmentNoteDomainDraft = new AdjustmentNoteDomainDraft();
        const { resultPaginated, statusSettlement } = await adjustmentNoteDomain.getPaginatedResults(
            society,
            page,
            limit,
            settlemnetId
        );
        handleResponse(res, 200, { resultPaginated, statusSettlement });
    }
);

AdjustmentNoteControllerDraft.get(
    "/draft/settlement-society-totals/:settlemnetId",
    verifytoken,
    validateGetTotalBySocietyParam,
    async (req: Request, res: Response) => {
        const settlemnetId = req.params.settlemnetId;
        const society = req.query.society as string;
        let adjustmentNoteDomain: IAdjustmentNoteDomainDraft = new AdjustmentNoteDomainDraft();
        const resultTotal = await adjustmentNoteDomain.getTotalBySociety(society, settlemnetId);
        handleResponse(res, 200, { resultTotal });
    }
);

AdjustmentNoteControllerDraft.get(
    "/draft/send-settlement-review/:settlemnetId",
    verifytoken,
    async (req: Request, res: Response) => {
        const settlemnetId = req.params.settlemnetId;
        let adjustmentNoteDomain: IAdjustmentNoteDomainDraft = new AdjustmentNoteDomainDraft();
        const result = await adjustmentNoteDomain.getDetailsSettlement(settlemnetId);
        handleResponse(res, 200, { result });
    }
);

AdjustmentNoteControllerDraft.get(
    "/draft/settlements/",
    verifytoken,
    validateGetAdjustmentNotesSettlement,
    async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10);
        const limit = parseInt(req.query.limit as string, 10);
        const settlementId = req.query.settlementId as string;
        const dateRequest = req.query.dateRequest as string;
        const orderType = (req.query.orderType as string)?.toUpperCase() === "ASC" ? "ASC" : "DESC";
        let fieldOrder: string[] = [];

        if (Array.isArray(req.query.fieldOrder)) {
        fieldOrder = req.query.fieldOrder
            .map(item => typeof item === 'string' ? item : JSON.stringify(item));
        } else if (req.query.fieldOrder) {
        fieldOrder = [typeof req.query.fieldOrder === 'string' ? req.query.fieldOrder : JSON.stringify(req.query.fieldOrder)];
        }

        let adjustmentNoteDomain: IAdjustmentNoteDomainDraft = new AdjustmentNoteDomainDraft();
        const { data } = await adjustmentNoteDomain.getAdjustmentNotesSettlement(
            page,
            limit,
            settlementId,
            dateRequest,
            orderType,
            fieldOrder

        );
        handleResponse(res, 200, data);
    }
);

AdjustmentNoteControllerDraft.post(
    "/draft/mark-orders",
    verifytoken,
    validateMarkOrders,
    async (req: Request, res: Response) => {
        const settlementId = req.query.settlementId as string;
        const { orders, fileName } = req.body;
        const userEmail = req.body.user.email;
        const adjustmentNoteDomain: AdjustmentNoteDomainDraft = new AdjustmentNoteDomainDraft();
        const response = await adjustmentNoteDomain.markOrders(orders, fileName, settlementId);
        log.info('[new-settlement-adjustmentNote] Liquidación %s de nota de ajuste iniciada - correo: %s', response.message, userEmail);

        handleResponse(res, HttpCode.OK, response.message, response.status ? HttpCode.OK : HttpCode.BAD_REQUEST);
    }
);

AdjustmentNoteControllerDraft.get(
    "/draft/v2/new-settlement",
    verifytoken,
    validateNewSettlement,
    async (req: Request, res: Response) => {
        const settlementId = req.query.settlementId as string;
        const { fileName } = req.query;
        const userEmail = req.body.user.email;
        const adjustmentNoteDomain: AdjustmentNoteDomainDraft = new AdjustmentNoteDomainDraft();
        const result = await adjustmentNoteDomain.createNewSettlement(fileName as string, userEmail, settlementId);
        handleResponse(res, HttpCode.OK, result);
    }
);