import { IValidateService, ValidateService } from "../service";
import { ValidateEmailResponse } from "../type/validate.type";
import { IValidateDomain } from "./index";

export class ValidateDomain implements IValidateDomain {

    async validEmailApprove(email: string, settlementId: string): Promise<ValidateEmailResponse> {
		const validateService: IValidateService = new ValidateService();

        const validateBoolean = await validateService.ValidApprovedUserEmail(email, settlementId);
        const response: ValidateEmailResponse = {
            valid: validateBoolean,
            date: 'SUCCESS'
        }
        const settlementType = settlementId.split('-')[0]
        if(validateBoolean) {
            let settlementData;
            if(settlementType == '01'){
                settlementData = await validateService.GetSettlementData(settlementId);
                response.date = settlementData.creationDate
            } else {
                log.info(`No se encontro tipo de liquidacion ${settlementType}`);
                response.date = new Date().toDateString();
            }
        }
		return response;
	}

}