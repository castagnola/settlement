import { OrderSettlementReportGeneral } from "../../../order/type/order.type";
import { SettlementEmailType } from "../../sendEmailByCollaborator.Type";

export interface ISendEmailByCollaboratorService {

    getDataToXlsxByCollaborator(settlementId: string, bp: string):Promise<OrderSettlementReportGeneral[]>

    getEmailToSendCollaborator(bp: string): Promise<SettlementEmailType[]>
}