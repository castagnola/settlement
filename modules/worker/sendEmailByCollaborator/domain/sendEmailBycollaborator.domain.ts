import { GenerateMultiviewXlsx } from "../../../../helpers/xlsx/xlsx";
import { dataXlsx } from "../../../../helpers/xlsx/xlsx.type";
import { SettlementEmailStatusEnum } from "../../../../models/settlmentEmail/settlement.type";
import { HeaderKeyValueOrderSettlementReportGeneral, HeaderOrderSettlementReportGeneral } from "../../../order/type/order.type";
import { getSettlementEmailById, updateSettlementEmailById } from "../../../settlement/repository/settlementEmail/settlementEmail.repository";
import { ISettlementServiceInterface } from "../../../settlement/service/settlement.interface";
import { SettlementService } from "../../../settlement/service/settlement.service";
import { ItransversalService } from "../../../transversales/service/itransversal.interface";
import { TransversalService } from "../../../transversales/service/transversal.service";
import { MultiSendEmailData } from "../../../transversales/type/transversales.type";
import { SendEmailByCollaboratorService } from "../service/sendEmailByCollaborator.service";
import { ISendEmailByCollaboratorService } from "../service/sendEmailByCollaborator.service.interface";
import { ISendEmailByCollaboratorDomain } from "./sendEmailBycollaborator.interface";

export class SendEmailByCollaboratorDomain implements ISendEmailByCollaboratorDomain {

    async processEmailToSend(id: string): Promise<void> {
        log.info('[processEmailToSend] Inicio proceso envio de correo');
        const mongoData = await getSettlementEmailById(id);

        try {
            log.info('[processEmailToSend] Se procesara liquidacion %s para colaborador %s', mongoData.settlementId, mongoData.collaboratorBp);

            const sendEmailByCollaborator: ISendEmailByCollaboratorService = new SendEmailByCollaboratorService();
            const settlementOrders = await sendEmailByCollaborator.getDataToXlsxByCollaborator(mongoData.settlementId, mongoData.collaboratorBp);
            const settlementService: ISettlementServiceInterface = new SettlementService();

            let dataToXlsx: dataXlsx[] = [
                {
                    data: settlementOrders,
                    name: 'BBDD VALIDACIÓN',
                    headers: HeaderOrderSettlementReportGeneral,
                    headersKey: HeaderKeyValueOrderSettlementReportGeneral
                }
            ];

            log.info('[processEmailToSend] - Envio a generar xlsx')
            let base64 = await GenerateMultiviewXlsx(dataToXlsx);
            log.info('[processEmailToSend] - Finalizacion xlsx')

            const emailCopyData = await settlementService.getUserLineData('CA01');
            const emailData = await sendEmailByCollaborator.getEmailToSendCollaborator(mongoData.collaboratorBp);

            if (emailData.length > 0) {
                const transversalService: ItransversalService = new TransversalService();
                log.info('[downloadOrdersSettlementBase64] - Comienza envio del correo')
                const email_xlsx_template = 'allied-settlement-filter'
                const emailSendData: MultiSendEmailData = {
                    to: emailData.map((item) => {
                        return {
                            email: item.email,
                            name: item.recipitentName
                        }
                    }),
                    copiesEmailList: [emailCopyData.userEmail],
                    subject: `Detalle liquidacion no ${mongoData.settlementId}`,
                    template: email_xlsx_template,
                    parameters: {
                        settlementId: `${mongoData.settlementId}`
                    },
                    attachments: [
                        {
                            content: base64,
                            filename: `Liquidacion_${mongoData.settlementId}_${emailData[0].name}.xlsx`,
                            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        }
                    ]
                }

                let response = await transversalService.sendEmail(emailSendData);
                log.info(`[processEmailToSend] - Correo enviado con estado: ${response}`)

                if (response) {
                    log.info('[processEmailToSend] Envio correcto de liquidacion %s a bp %s con estado %s', mongoData.settlementId, mongoData.collaboratorBp, response);
                    mongoData.emailStatus = SettlementEmailStatusEnum.SEND_OK
                    await updateSettlementEmailById(mongoData._id, mongoData);
                } else {
                    log.info('[processEmailToSend] Envio erroneo de liquidacion %s a bp %s con estado %s', mongoData.settlementId, mongoData.collaboratorBp, response);
                    mongoData.emailStatus = SettlementEmailStatusEnum.ERROR_SEND
                    await updateSettlementEmailById(mongoData._id, mongoData);
                }
            } else {
                log.info('[processEmailToSend] No se encontraron correos para el bp %s', mongoData.collaboratorBp);
                mongoData.emailStatus = SettlementEmailStatusEnum.NOT_EMAILS
                await updateSettlementEmailById(mongoData._id, mongoData);
            }


            return
        } catch (error) {
            log.error('[processEmailToSend] Error en la creacion del archivo para liquidacion %s de bp %s', mongoData.settlementId, mongoData.collaboratorBp)
            mongoData.emailStatus = SettlementEmailStatusEnum.ERROR_CREATE;
            await updateSettlementEmailById(mongoData._id, mongoData);
        }
    }

}