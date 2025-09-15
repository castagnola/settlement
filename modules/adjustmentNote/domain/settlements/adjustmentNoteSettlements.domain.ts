import { Readable } from 'stream';
import JSONStream from 'JSONStream';
import { AppError } from "vanti-utils/lib";
import { AdjustmentNoteServiceSettlements, IAdjustmentNoteServiceSettlements } from "../../service";
import { AdjustmentMessageReturn, AdjustmentNoteOrderStatusPostgres, AdjustmentNoteType, AdjustmentPartnerWithoutSettlementNote, GetAdjustmentNotesSettlementResponse, GetAdjustmentViewOptions } from "../../type/adjustmentNote.type";
import { AdjustmentNoteHash } from "../../../../models/adjustmentNoteHash";
import { AdjustmentNoteSettlement, AdjustmentNoteStatus } from "../../../../models/adjustmentNoteSettlement";
import { AdjustmentNoteDomainOrders } from '../orders/adjustmentNoteOrders.domain';
import { getAdjustmentNotesRepositoryByFileName, updateAdjustmentNoteHash } from '../../repository/adjustmentNoteHash/adjustmentNote.repository';
import { createAdjustmentNoteSettlement, getAdjustmentNotesSettlement, getLastConsecutive, updatedSettlementBy, updateStatusApprovalAdjustmentNoteSettlement } from '../../repository/adjustmentNoteSettlement/adjustmentNoteSettlement.repository';
import { findBySettlementId, updateFileOrder, validateSettlementNullBySalesDocument } from '../../repository/adjustmentNoteOrder/adjustmentNoteOrder.repository';
import { ItransversalService } from '../../../transversales/service/itransversal.interface';
import { TransversalService } from '../../../transversales/service/transversal.service';
import { createToken } from "../../../../helpers/jwt/jwt";
import { AdjustmentNoteDomainDraft } from '../draft/adjustmentNoteDraft.domain';
import { EmailData } from '../../../transversales/type/transversales.type';
import { ISettlementServiceInterface } from '../../../../modules/settlement/service/settlement.interface';
import { SettlementService } from '../../../../modules/settlement/service/settlement.service';
import lodash from 'lodash';
import { IAdjustmentNoteDomainSettlements } from './adjustmentNoteSettlements.domain.interface';
import { IAdjustmentNoteDomainDraft } from '../draft/adjustmentNoteDraft.domain.interface';
import { IAdjustmentNoteDomainOrders } from '../orders/adjustmentNoteOrders.domain.interface';
import { addHours } from 'date-fns';
const {
    FRONT_URI,
    SECRET_APPROVAL_TOKEN,
    TOKEN_LIVETIME
} = process.env;

export class AdjustmentNoteDomainSettlements implements IAdjustmentNoteDomainSettlements {

    /**
     * @see iAdjustmentNoteDomain.getAdjustmentNotes
     */
    async getAdjustmentNotes(options: GetAdjustmentViewOptions): Promise<AdjustmentNoteType[]> {
        let adjustmentService: IAdjustmentNoteServiceSettlements = new AdjustmentNoteServiceSettlements();
        return await adjustmentService.getAdjustmentNotes(options);
    }

    async createNewSettlement(file: Buffer, fileName: string, userEmail: string, settlementId?: string): Promise<AdjustmentMessageReturn> {
        try {
            const fileData: AdjustmentPartnerWithoutSettlementNote[] = await this._convertBufferToFilterData(file);
            const invalidEntries = fileData.filter(item => item.include !== 'SI' && item.include !== 'NO');
            if (invalidEntries.length > 0) {
                return {
                    message: `ERROR - SOMETHING INCLUDE ERROR`,
                    status: false
                }
            }

            const adjustmentNoteDataMongo: AdjustmentNoteHash = await getAdjustmentNotesRepositoryByFileName(fileName.split('.')[0]);
            if (!adjustmentNoteDataMongo) {
                return {
                    message: `ERROR - NOT MONGO HASH DATA`,
                    status: false
                }
            }

            const adjusmentNoteOrder: IAdjustmentNoteDomainOrders = new AdjustmentNoteDomainOrders();
            const fileHash: AdjustmentNoteHash = await adjusmentNoteOrder.getFileHash(fileData, fileName);
            let message = await this._validHashData(fileHash, adjustmentNoteDataMongo);

            const validPartner: boolean = await this._validPartnerData(fileData);
            if(!validPartner){
                return {
                    message: 'ERROR - BAD VALIDATION PARTNER',
                    status: false
                }
            }
            const validUsed: boolean = await this._validSettlementUsed(fileData);
            if(!validUsed) {
                return {
                    message: 'ERROR - ORDER USED BEFORE',
                    status: false
                }
            }

            if (message == 'SUCCESS') {
                await updateAdjustmentNoteHash(adjustmentNoteDataMongo);
                const adjustmentNoteSettlmentId = await this._saveNewSettlementErrased(fileData, fileName, settlementId, userEmail);
                return {
                    message: adjustmentNoteSettlmentId,
                    status: true
                }
            }

            return {
                message,
                status: false
            };
        } catch (error) {
            log.error({ message: `Error creating new settlement: ${error.message}` });
            throw new AppError({ message: 'Error creating new settlement' });
        }
    }

    private async _validSettlementUsed(fileData: AdjustmentPartnerWithoutSettlementNote[]): Promise<boolean> {
        const includedItems = fileData.filter(item => item.include === 'SI');
        const salesDocuments = lodash.uniq(includedItems.map(item => `${item.salesOrderCustomer}`));
    
        return await validateSettlementNullBySalesDocument(salesDocuments);
    }

    private async _validPartnerData(fileData: AdjustmentPartnerWithoutSettlementNote[]): Promise<boolean> {
        const includedItems = fileData.filter(item => item.include === 'SI');
        const groupedByOpportunity: AdjustmentPartnerWithoutSettlementNote[][] = lodash.groupBy(includedItems, 'oportunityId');

        for (const group of Object.values(groupedByOpportunity)) {
            if (group.length !== 2) {
                return false;
            }

            const [doc1, doc2] = group.map(item => item.documentClass);
            if (doc1 === doc2) {
                return false;
            }
        }

        return true;
    }

    private async _validHashData(fileHash: AdjustmentNoteHash, adjustmentNoteDataMongo: AdjustmentNoteHash): Promise<string> {
        if (adjustmentNoteDataMongo == null || adjustmentNoteDataMongo == undefined) return 'ERROR - NO DATA IN MONGO';
        if (adjustmentNoteDataMongo && fileHash.signatures.length !== adjustmentNoteDataMongo.signatures.length) return 'ERROR - SIGNATURES LENGTH MISMATCH';

        const mongoSignatures = Array.isArray(adjustmentNoteDataMongo.signatures)
            ? adjustmentNoteDataMongo.signatures
            : [adjustmentNoteDataMongo];

        const fileSignatures = fileHash.signatures.map(sig => ({
            clientSignature: String(sig.clientSignature),
            hash: sig.hash
        }));

        const mongoSignaturesFormatted = mongoSignatures.map(sig => ({
            clientSignature: String(sig.clientSignature),
            hash: sig.hash
        }));

        const sortedFileSignatures = [...fileSignatures].sort((a, b) =>
            a.clientSignature.localeCompare(b.clientSignature)
        );          
        const sortedMongoSignatures = [...mongoSignaturesFormatted].sort((a, b) => 
            a.clientSignature.localeCompare(b.clientSignature)
        );

        return JSON.stringify(sortedFileSignatures) === JSON.stringify(sortedMongoSignatures)
            ? 'SUCCESS'
            : 'ERROR - HASH MISMATCH';
    }

    private async _convertBufferToFilterData(buffer: Buffer): Promise<AdjustmentPartnerWithoutSettlementNote[]> {
        const bufferToStream = (buffer: Buffer) => {
            const readable = new Readable();
            readable.push(buffer);
            readable.push(null);
            return readable;
        };

        const jsonStream = JSONStream.parse('*');
        const readStream = bufferToStream(buffer);
        readStream.pipe(jsonStream);

        return new Promise<AdjustmentPartnerWithoutSettlementNote[]>((resolve, reject) => {
            const filterDataArray: AdjustmentPartnerWithoutSettlementNote[] = [];

            jsonStream.on('data', (data: any) => {
                try {
                    const filterData: AdjustmentPartnerWithoutSettlementNote = {
                        id: 0,
                        salesOrderCustomer: data["DOC. VENTA"] || "",
                        documentClass: data["CLVT"] || "",
                        campaingId: data["ID DE CAMPAÑA"] || "",
                        interestRate: data["TASA DE INTERES"] || 0,
                        quotas: data["PLAZO"] || 0,
                        ticket: data["ID TICKET"] || "",
                        oportunityId: data["ID OPORTUNIDAD"] || "",
                        collaboratorIdentification: data["CLIENTE/FIRMA"] || "",
                        collaboratorName: data["NOMBRE FIRMA"] || "",
                        accountingDocument: data["DOC. FAC."] || "",
                        ClFac: data["CLFAC"] || "",
                        invoicedDate: data["FECHA FACTURA"] || "",
                        StRF: data["STRF"] || "",
                        society: data["SOC."] || "",
                        clientBp: data["SOLIC."] || "",
                        contractAccount: data["CTA. CONTRATO"] || "",
                        value: data["VALOR NETO SIN IVA"] || 0,
                        vatCommission: data["IVA 19%"] || 0,
                        rebateTotal: data["VALOR NETO CON IVA"] || 0,
                        invoiceId: data["N DOC"] || "",
                        idRediscountInvoice: data["REFERENCIA"] || "",
                        customerIdentification: data["CC CLIENTE"] || "",
                        pre_settlement: data["CONSECUTIVO LIQUIDACION PREVIA"] || "",
                        settlement: data["CONSECUTIVO LIQUIDACION AJUSTE"] || "",
                        adjustmentNote: data["NOTA DE AJUSTE"] || "",
                        adjustmenReference: data["REFERENCIA 2"] || "",
                        remarks: data["OBSERVACION"] || "",
                        adjustmentNoteType: data["TIPO DE NOTA DE AJUSTE"] || "",
                        include: data["INCLUIR EN LIQUIDACION"] || ""
                    };

                    filterDataArray.push(filterData);
                } catch (error) {
                    console.log('Error procesando línea del archivo de settlement', error);
                    reject(new Error('Error procesando línea del archivo de settlement'));
                }
            });

            jsonStream.on('end', () => resolve(filterDataArray));
            jsonStream.on('error', (error) => reject(new Error(`Error al leer archivo de settlement: ${error.message}`)));
        });
    }

    private async _saveNewSettlementErrased(fileData: AdjustmentPartnerWithoutSettlementNote[], fileName: string, settlementId: string, userEmail: string): Promise<string> {
        const service: IAdjustmentNoteServiceSettlements = new AdjustmentNoteServiceSettlements();
        const consecutive = Math.max(
            await service.getLastConsecutive() || 0,
            await getLastConsecutive() || 0
        );
        const adjustmentNoteSettlmentId = await this.generateConsecutiveAdjustmentNote(consecutive);

        await this._saveMongoRelation(adjustmentNoteSettlmentId, fileData, fileName, consecutive + 1, settlementId, userEmail);
        this._updatePostgresOrders(fileData);

        if (!settlementId) {
            return adjustmentNoteSettlmentId
        } else {
            await updatedSettlementBy(settlementId, userEmail);
            log.info('[update-settlement-adjustmentNote] Liquidación %s de nota de ajuste modificada - correo: %s', settlementId, userEmail);
            return settlementId;
        }
    }

    private async _updatePostgresOrders(fileData: AdjustmentPartnerWithoutSettlementNote[]): Promise<void> {
        const adjustmentService: IAdjustmentNoteServiceSettlements = new AdjustmentNoteServiceSettlements();
        if(fileData[0]?.settlement != ""){
            fileData = fileData.filter(item=>item.include === 'NO');
        }else {
            fileData = fileData.filter(item=>item.include === 'SI');
        }

        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        const BATCH_SIZE = 100;
        const DELAY_MS = 500;

        for (let i = 0; i < fileData.length; i += BATCH_SIZE) {
            const batch = fileData.slice(i, i + BATCH_SIZE);

            await Promise.all(
                batch.map(item =>
                    adjustmentService.updateAdjustmentNoteOrderStatus(
                        item.salesOrderCustomer,
                        item.include === 'SI'
                            ? AdjustmentNoteOrderStatusPostgres.BLOCK
                            : AdjustmentNoteOrderStatusPostgres.CREATED
                    )
                )
            );

            if (i + BATCH_SIZE < fileData.length) {
                await sleep(DELAY_MS);
            }
        }

        log.info("Actualización en Postgres completada");
    }

    async generateConsecutiveAdjustmentNote(lastConsecutive: number): Promise<string> {
        const fixedPart = "02";
        const consecutivePart = (lastConsecutive + 1).toString().padStart(4, "0");
        const datePart = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "2-digit" }).replace(/\//g, "");

        return `${fixedPart}-${consecutivePart}-${datePart}`;
    }

    private async _saveMongoRelation(settlementId: string, fileData: AdjustmentPartnerWithoutSettlementNote[], fileName: string, consecutive: number, currentSettlementId: string, userEmail: string): Promise<void> {
        try {
            let promises = [];
            if (!currentSettlementId) {
                const settlementModelMongo: AdjustmentNoteSettlement = {
                    settlementId,
                    consecutive,
                    lastState: {
                        status: AdjustmentNoteStatus.PROCESS,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    statusHistory: [{
                        status: AdjustmentNoteStatus.PROCESS,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }],
                    owner: userEmail
                };
                await createAdjustmentNoteSettlement(settlementModelMongo);
                const filterDataYes = fileData.filter(item => item.include === 'SI');
                promises = filterDataYes.map(item => {
                    updateFileOrder(item.salesOrderCustomer, fileName, item.include, currentSettlementId ?? settlementId);
                });
            } else {
                const filterDataNo = fileData.filter(item => item.include === 'NO');
                promises = filterDataNo.map(item => {
                    updateFileOrder(item.salesOrderCustomer, fileName, item.include);
                });
                const validateExist = await findBySettlementId(currentSettlementId);
                if (!validateExist) throw new AppError({ message: 'Settlement not found' });
            }

            await Promise.all(promises);
            log.info("Inserción en MongoDB completada");
        } catch (error) {
            log.error("Error insertando en MongoDB:", error);
        }
    }

    /**
     * @see iAdjustmentNoteDomain.getAdjustmentNotesSettlement
     */
    async getAdjustmentNotesSettlement(page: number, limit: number, settlementId: string, dateRequest: string, orderType: string, fieldOrder: string[]): Promise<GetAdjustmentNotesSettlementResponse> {
        const validatedOrderType: "ASC" | "DESC" = orderType === "ASC" || orderType === "DESC" ? orderType : "ASC";
        return await getAdjustmentNotesSettlement(page, limit, settlementId, dateRequest, validatedOrderType, fieldOrder);
    }

    async approvalSettlementAdjustmentNote(settlementId: string): Promise<string> {
        const settlementService: ISettlementServiceInterface = new SettlementService();
        const transversalService: ItransversalService = new TransversalService();
        const timeToAdd = TOKEN_LIVETIME?.split('h')[0];
        const expirationDate = addHours(new Date(), Number(timeToAdd));

        try {
            const emailData = await settlementService.getUserLineData(settlementId);
            const adjustmentNoteDomainDraft: IAdjustmentNoteDomainDraft = new AdjustmentNoteDomainDraft();
            const base64 = await adjustmentNoteDomainDraft.getBufferExcelTotalBySettlement(settlementId);
            const tokenUrl = createToken({ settlementId }, SECRET_APPROVAL_TOKEN, TOKEN_LIVETIME);
            const URL = `${FRONT_URI}approve?token=${tokenUrl}&settlementId=${settlementId}`;
            log.info('URL APPROVAL ADJUSTMENT NOTE: %s', URL);

            const emailSendData: EmailData = {
                email: emailData.userEmail,
                name: emailData.name,
                copiesEmailList: emailData.copyEmail,
                subject: `Liquidación de Ajuste Vanti Listo ID ${settlementId} para Aprobación`,
                template: 'approve-adjusment-note',
                parameters: {
                    userName: emailData.name,
                    id: `${settlementId}`,
                    link: URL,
                },
                attachments: [
                    {
                        content: base64,
                        filename: `Detalle-liquidacion-${settlementId}.xlsx`,
                        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    }
                ]
            };

            let response = await transversalService.sendEmail(emailSendData);
            log.info('[approvalSettlement] - Correo enviado con estado: %s', JSON.stringify({response, emailData}));
            const updateStatusMongo = await updateStatusApprovalAdjustmentNoteSettlement(settlementId, AdjustmentNoteStatus.APPROVAL, expirationDate);
            log.info('[approvalSettlement] Actualizacion de estado de liquidacion en mongo %s', JSON.stringify(updateStatusMongo))
            return AdjustmentNoteStatus.APPROVAL;
        } catch (error) {
            log.info('[approvalSettlement] - Error al enviar correo de aprobacion de liquidacion de ajuste: %s', JSON.stringify(error.message));
            return 'ERROR';
        }
    }

    
}