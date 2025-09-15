import crypto from 'crypto';
import { GenerateMultiviewXlsx } from "../../../../helpers/xlsx/xlsx";
import { dataXlsx } from "../../../../helpers/xlsx/xlsx.type";
import { AdjustmentNoteHash, HashStatus } from "../../../../models/adjustmentNoteHash";
import { ItransversalService } from "../../../transversales/service/itransversal.interface";
import { TransversalService } from "../../../transversales/service/transversal.service";
import { EmailData } from "../../../transversales/type/transversales.type";
import { AdjustmentNoteServiceOrders, IAdjustmentNoteServiceOrders } from "../../service";
import { AdjustmentPartnerWithoutSettlementNote, HeaderKeyValueSettlementNoteReportGeneral, HeaderSettlementNoteReportGeneral, AdjustmentNoteMongo } from "../../type/adjustmentNote.type";
import { IAdjustmentNoteDomainOrders } from "./adjustmentNoteOrders.domain.interface";
import { createAdjustmentNotesRepository } from '../../repository/adjustmentNoteHash/adjustmentNote.repository';
import { upsertManyAdjustmentNoteOrders, getTotalOrders, findOrdersBySettlementId, updateOrdersFileBySettlement } from '../../repository/adjustmentNoteOrder/adjustmentNoteOrder.repository';
import { ISettlementServiceInterface } from '../../../settlement/service/settlement.interface';
import { SettlementService } from '../../../settlement/service/settlement.service';

export class AdjustmentNoteDomainOrders implements IAdjustmentNoteDomainOrders {
    async getCountAdjustmentNotesToNewSettlement(settlementId?: string): Promise<number> {
        let adjustmentService: IAdjustmentNoteServiceOrders = new AdjustmentNoteServiceOrders()
        if (settlementId) {
            return await getTotalOrders(settlementId);
        }
        return await adjustmentService.getCountAdjustmentNotesToNewSettlement();
    }

    /**
     * @see iAdjustmentNoteDomain.getOrdersToNewSettlement
     */
    async getOrdersToNewSettlement(settlementId?: string): Promise<string> {

        let adjustmentService: IAdjustmentNoteServiceOrders = new AdjustmentNoteServiceOrders()
        let ordersToSend: AdjustmentPartnerWithoutSettlementNote[];
        console.log(`[getOrdersToNewSettlement] - Inicio proceso para settlementId: ${settlementId}`);
        if (settlementId) {
            log.info(`[getOrdersToNewSettlement] - Consultando datos en MongoDB para settlementId: ${settlementId}`);
            const mongoOrders = await findOrdersBySettlementId(settlementId);
            ordersToSend = this.mapMongoOrders(mongoOrders);
        } else {
            log.info(`[getOrdersToNewSettlement] - Consultando datos en PostgreSQL`);
            const orders = await adjustmentService.getOrdersToNewSettlement();
            const temporalOrders = await Promise.all(orders.map(item => ({ ...item, include: 'SI', adjustmentNoteType: item.noteType })));
            ordersToSend = temporalOrders;
        }
        if (!ordersToSend || ordersToSend.length === 0) {
            log.error({ message: 'orders not found' });
            return 'orders not found'
        }

        let dataToXlsx: dataXlsx[] = [
            {
                data: ordersToSend,
                name: 'BBDD',
                headers: HeaderSettlementNoteReportGeneral,
                headersKey: HeaderKeyValueSettlementNoteReportGeneral
            }
        ];

        log.info('[getOrdersToNewSettlement] - Envio a generar xlsx')
        let base64 = await GenerateMultiviewXlsx(dataToXlsx);
        log.info(`[getOrdersToNewSettlement] - Finalizacion xlsx`)

        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        const fileName = `Notas_ajustes_vantilisto_${day}${month}${year}_${hours}${minutes}.xlsx`;

        const hashData = await this.getFileHash(ordersToSend, fileName);
        const saveMongoData = await createAdjustmentNotesRepository(hashData);

        log.info(`[getOrdersToNewSettlement] - Guardado hash en mongo con id: ${saveMongoData.id}`)
        try {
            if (!settlementId) {
                const bulkData = ordersToSend.map(item => ({
                    salesDocument: item.salesOrderCustomer,
                    salesClient: item.documentClass,
                    campaignId: item.campaingId,
                    interestRate: item.interestRate,
                    term: item.quotas,
                    ticketId: item.ticket,
                    opportunityId: item.oportunityId,
                    clientSignature: item.collaboratorIdentification,
                    firmName: item.collaboratorName,
                    invoiceDocument: item.accountingDocument,
                    invoiceClient: item.ClFac,
                    invoiceDate: item.invoicedDate,
                    statusRf: item.StRF,
                    society: item.society,
                    request: item.clientBp,
                    contractAccount: item.contractAccount,
                    netValueWithoutVat: item.value,
                    vat19: item.vatCommission,
                    netValueWithVat: item.rebateTotal,
                    documentNumber: item.invoiceId,
                    reference: item.idRediscountInvoice,
                    clientCc: item.customerIdentification,
                    previousSettlementConsecutive: item.pre_settlement,
                    adjustmentSettlementConsecutive: item.settlement,
                    adjustmentNote: item.adjustmentNote,
                    secondaryReference: item.adjustmenReference,
                    observation: item.remarks,
                    adjustmentNoteType: item.noteType,
                    includeInSettlement: 'NO',
                }));
                await upsertManyAdjustmentNoteOrders(bulkData, fileName);
            } else {
                log.info(`[getOrdersToNewSettlement] - Actualizando órdenes en MongoDB con settlementId: ${settlementId}`);
                await updateOrdersFileBySettlement(settlementId, fileName);
                log.info(`[getOrdersToNewSettlement] - Órdenes actualizadas con el nuevo archivo: ${fileName}`);
            }

            const transversalService: ItransversalService = new TransversalService();
            log.info('[getOrdersToNewSettlement] - Comienza envio del correo')
            const settlementService: ISettlementServiceInterface = new SettlementService();
            const emailData = await settlementService.getUserLineData('R2');
            const email_template_new_adjustment_note = 'new-settlement-adjustment-note';
            const emailSendData: EmailData = {
                email: emailData.userEmail,
                copiesEmailList: emailData.copyEmail,
                name: emailData.name,
                subject: `Pedidos para liquidación de ajuste de Vanti Listo`,
                template: email_template_new_adjustment_note,
                parameters: {},
                attachments: [
                    {
                        content: base64,
                        filename: fileName,
                        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    }
                ]
            }
            let response = await transversalService.sendEmail(emailSendData);
            log.info(`[getOrdersToNewSettlement] - Correo enviado con estado: ${response}`)
        } catch (error) {
            log.error(`[Error envio correo] - correo de ordenes de ajuste: ${error.message}`)
        }
        return base64
    }

    async getFileHash(fileData: AdjustmentPartnerWithoutSettlementNote[], fileName: string): Promise<AdjustmentNoteHash> {
        const hashData: AdjustmentNoteHash = {
            fileName: fileName,
            signatures: [],
            status: HashStatus.CREATED
        };

        const uniqueSignatures = [...new Set(fileData.map(item => item.collaboratorIdentification))];

        await Promise.all(uniqueSignatures.map(async (signature) => {
            const filteredData = fileData.filter(item => item.collaboratorIdentification === signature);

            const totalNetValueWithVAT = filteredData.reduce((sum, item) => sum + (Number(item.rebateTotal) || 0), 0);
            const totalOpportunityId = filteredData.reduce((sum, item) => sum + (Number(item.oportunityId) || 0), 0);

            const hashString = `${signature}|${totalNetValueWithVAT}|${totalOpportunityId}`;
            const hash = crypto.createHash('sha256').update(hashString).digest('hex');

            const hashObject = {
                clientSignature: signature,
                hash
            }

            hashData.signatures.push(hashObject);
        }));

        return hashData;
    }

    private mapMongoOrders(orders: AdjustmentNoteMongo[]): AdjustmentPartnerWithoutSettlementNote[] {
        return orders.map(item => ({
            id: item.id,
            salesOrderCustomer: item.salesDocument,
            documentClass: item.salesClient,
            campaingId: item.campaignId,
            interestRate: item.interestRate,
            quotas: item.term,
            ticket: item.ticketId,
            oportunityId: item.opportunityId,
            collaboratorIdentification: item.clientSignature,
            collaboratorName: item.firmName,
            accountingDocument: item.invoiceDocument,
            ClFac: item.invoiceClient,
            invoicedDate: item.invoiceDate,
            StRF: item.statusRf,
            society: item.society,
            clientBp: item.request,
            contractAccount: item.contractAccount,
            value: item.netValueWithoutVat,
            vatCommission: item.vat19,
            rebateTotal: item.netValueWithVat,
            invoiceId: item.documentNumber,
            idRediscountInvoice: item.reference,
            customerIdentification: item.clientCc,
            pre_settlement: item.previousSettlementConsecutive,
            settlement: item.adjustmentSettlementConsecutive,
            adjustmentNote: item.adjustmentNote,
            adjustmenReference: item.secondaryReference,
            remarks: item.observation,
            adjustmentNoteType: item.adjustmentNoteType,
            include: item.includeInSettlement,
            noteType: item.noteType
        }));
    }
}


