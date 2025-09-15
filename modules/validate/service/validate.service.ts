import { Axios, ResponseApi } from "vanti-utils/lib";
import { IValidateService } from "./index";
import { SettlementBasicData, SettlementListResponse } from "../type/validate.type";
import { URI_SETTLEMENT_CORE } from "../../../helpers/constans.type";


export class ValidateService implements IValidateService {

    /**
     * @see IValidateService.ValidApprovedUserEmail
     */
    async ValidApprovedUserEmail(email: string, settlementId: string): Promise<boolean> {
        const baseURL = `${URI_SETTLEMENT_CORE}/settlements/valid-email-approval/${email}`;
        const params = new URLSearchParams();

        params.append('settlementId', settlementId);

        const urlWithParams = `${baseURL}?${params.toString()}`;
        let { data } = await Axios.get<ResponseApi<boolean>>(urlWithParams);
        return data.data
    }

    /**
     * @see IValidateService.GetSettlementData
     */
    async GetSettlementData(settlementId: string): Promise<SettlementBasicData> {
        const baseURL = `${URI_SETTLEMENT_CORE}/settlements/list`;
        const params = new URLSearchParams();

        params.append('settlementId', settlementId);
        params.append('page', '1');
        params.append('limit', '1');

        const urlWithParams = `${baseURL}?${params.toString()}`;

        const response = await Axios.get<ResponseApi<SettlementListResponse>>(urlWithParams);

        return response.data.data.settlements[0];
    }

}