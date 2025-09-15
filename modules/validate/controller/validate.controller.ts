import { Request, Response, Router } from "express";
import { verifytoken, verifyTokenApproval } from "../../../middleware/verifyToken/verifyToken.middleware";
import { handleResponse, HttpCode } from "vanti-utils/lib";
import { IValidateDomain, ValidateDomain } from "../domain";

export const ValidateController = Router();

ValidateController.get('/email-approval/:settlementId', verifytoken, async (req: Request, res: Response) => {
    const validateDomain: IValidateDomain = new ValidateDomain();
    const settlementId: string = String(req.params.settlementId);
    const response = await validateDomain.validEmailApprove(req.body.userEmail, settlementId);
    
    const validateResponse = response.valid ? HttpCode.OK : HttpCode.UNAUTHORIZED
    
    handleResponse(res, HttpCode.OK, response.date, validateResponse);
})

ValidateController.get('/approval-token', verifyTokenApproval, async (req: Request, res: Response) => {
    handleResponse(res, HttpCode.OK, 'SUCCESS');
})