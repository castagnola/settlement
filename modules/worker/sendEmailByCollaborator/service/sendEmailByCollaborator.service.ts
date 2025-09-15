import { Axios, ResponseApi } from "vanti-utils/lib";
import { OrderSettlementReportGeneral } from "../../../order/type/order.type";
import { ISendEmailByCollaboratorService } from "./sendEmailByCollaborator.service.interface";
import { URI_SETTLEMENT_CORE } from "../../../../helpers/constans.type";
import { SettlementEmailType } from "../../sendEmailByCollaborator.Type";

export class SendEmailByCollaboratorService implements ISendEmailByCollaboratorService {

    async getDataToXlsxByCollaborator(settlementId: string, bp: string): Promise<OrderSettlementReportGeneral[]> {
        log.info('[getDataToXlsxByCollaborator] - inicio servicio geneal xlsx')
        const response = await Axios.get<ResponseApi<OrderSettlementReportGeneral[]>>(`${URI_SETTLEMENT_CORE}/order/orders/collaborator/${settlementId}/${bp}`);
        log.info('[getDataToXlsxByCollaborator] - fin servicio geneal xlsx')
        return response.data.data
    }

    async getEmailToSendCollaborator(bp: string): Promise<SettlementEmailType[]> {
        log.info('[getEmailToSendCollaborator] - inicio servicio obtener correos')
        const response = await Axios.get<ResponseApi<SettlementEmailType[]>>(`${URI_SETTLEMENT_CORE}/email/list/collaborator/${bp}`);
        log.info('[getEmailToSendCollaborator] - fin servicio obtener correos')
        return response.data.data
    }
}