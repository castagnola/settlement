import { GenerateMultiviewXlsx } from "../../../../helpers/xlsx/xlsx";
import { dataXlsx } from "../../../../helpers/xlsx/xlsx.type";
import { TransversalService } from "../../../transversales/service/transversal.service";
import { EmailData } from "../../../transversales/type/transversales.type";
import { societies } from "../../../../helpers/society";
import { AdjustmentNoteByChunks, AdjustmentNoteOrderStatusPostgres, allHeaderKeys, GetAdjustmentNotesSettlementResponse, headerKeyBySociety, SettlementFilter } from "../../type/adjustmentNote.type";
import { IAdjustmentNoteDomainDraft } from "./adjustmentNoteDraft.domain.interface";
import { getAllDataSortByOpportunity, getOrdersByFileName, getPaginatedResults, getOrderByClient, getTotalBySettlement, getTotalBySociety, updateAllOrdersByFilename, updateOrdersByFile } from "../../repository/adjustmentNoteOrder/adjustmentNoteOrder.repository";
import { createAdjustmentNoteSettlement, getAdjustmentNotesSettlement, getLastConsecutive, getStatusSettlement, validSettlementExist } from "../../repository/adjustmentNoteSettlement/adjustmentNoteSettlement.repository";
import { AdjustmentNoteServiceSettlements, IAdjustmentNoteServiceSettlements } from "../../service";
import { ISettlementServiceInterface } from "../../../settlement/service/settlement.interface";
import { SettlementService } from "../../../settlement/service/settlement.service";
import { AppError } from "vanti-utils/lib";
import lodash from 'lodash';
import { AdjustmentNoteHash } from "../../../../models/adjustmentNoteHash";
import { getAdjustmentNotesRepositoryByFileName, getOpportunityByAdjustmentNote, updateByFileName } from "../../repository/adjustmentNoteHash/adjustmentNote.repository";
import { AdjustmentNoteDomainSettlements } from "../settlements/adjustmentNoteSettlements.domain";
import { AdjustmentNoteSettlement, AdjustmentNoteStatus } from "../../../../models/adjustmentNoteSettlement";
export class AdjustmentNoteDomainDraft implements IAdjustmentNoteDomainDraft {

    /**
     * @see iAdjustmentNoteDomain.getPaginatedResults
     */
    async getPaginatedResults(
        society: string,
        page: number,
        limit: number,
        settlementId: string,
    ) {
        const existMongo = await validSettlementExist(settlementId);
        if (existMongo) {
            const resultPaginated = await getPaginatedResults(society, settlementId, page, limit);
            const statusSettlement = await getStatusSettlement(settlementId);
            return { resultPaginated, statusSettlement };
        }
        const filter: SettlementFilter = { page, limit, society }
        const adjustmentNote: IAdjustmentNoteServiceSettlements = new AdjustmentNoteServiceSettlements();
        const { resultPaginated, statusSettlement } = await adjustmentNote.getSettlementsPostgres(settlementId, filter);
        return { resultPaginated, statusSettlement };
    }

    /**
     * @see iAdjustmentNoteDomain.getTotalBySociety
     */
    async getTotalBySociety(society: string, settlementId: string) {
        const existMongo = await validSettlementExist(settlementId);
        if (existMongo) {
            return await getTotalBySociety(society, settlementId);
        }
        const adjustmentNote: AdjustmentNoteServiceSettlements = new AdjustmentNoteServiceSettlements();
        return await adjustmentNote.getSettlementsTotalsPostgres(settlementId, society);
    }

    async getDetailsSettlement(settlementId: string): Promise<boolean> {
        const bufferXlsx = await this.getBufferExcelTotalBySettlement(settlementId);
        const emailResponse = await this.sendEmailSettlement(
            bufferXlsx,
            settlementId
        );

        return emailResponse;
    }

    async getBufferExcelTotalBySettlement(settlementId: string): Promise<string> {
        const results: dataXlsx[] = [];

        const allDataPerOpportunity = await getAllDataSortByOpportunity(settlementId);
        results.push({
            data: allDataPerOpportunity,
            name: "BBDD VALIDACIÓN",
            headers: Object.keys(allHeaderKeys),
            headersKey: allHeaderKeys,
        });

        for (const { society, sheetName } of societies) {
            const data = await getTotalBySettlement(society, settlementId);
            if (data.length < 1) continue;
            let totalPerSociety = await getTotalBySociety(society, settlementId);
            totalPerSociety = {
                firmName: "Total general",
                clientSignature: "",
                ...totalPerSociety,
            };
            data.push(totalPerSociety);

            results.push({
                data,
                name: sheetName,
                headers: Object.keys(headerKeyBySociety),
                headersKey: headerKeyBySociety,
            });
        }

        const buffer = await GenerateMultiviewXlsx(results);
        return buffer;
    }

    async sendEmailSettlement(xlsxBase64: string, settlementId: string) {
        const settlementService: ISettlementServiceInterface = new SettlementService();
        const emailData = await settlementService.getUserLineData('D2');
        const emailTemplate = "review-adjusment-note";
        const transversalService = new TransversalService();
        const emailSendData: EmailData = {
            email: emailData.userEmail,
            copiesEmailList: emailData.copyEmail,
            name: emailData.name,
            subject: `Liquidación de ajuste Vanti Listo - ${settlementId}`,
            template: emailTemplate,
            attachments: [
                {
                    content: xlsxBase64,
                    filename: `Detalle-liquidacion-${settlementId}.xlsx`,
                    contentType:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
            ],
        };

        let response = await transversalService.sendEmail(emailSendData);
        return response;
    }

    /**
     * @see iAdjustmentNoteDomain.getAdjustmentNotesSettlement
     */
    async getAdjustmentNotesSettlement(page: number, limit: number, settlementId: string, dateRequest: string, orderType: string, fieldOrder: string[]): Promise<GetAdjustmentNotesSettlementResponse> {
        const validatedOrderType: "ASC" | "DESC" = orderType === "ASC" || orderType === "DESC" ? orderType : "ASC";
        return await getAdjustmentNotesSettlement(page, limit, settlementId, dateRequest, validatedOrderType, fieldOrder);
    }

    private async validPartnerData(fileData: AdjustmentNoteByChunks[], settlementId: string | null): Promise<boolean> {
        const mappedOportunity = fileData.map(item => item.adjustmentNotedocumentNumber);
        const opportunityArray = await getOpportunityByAdjustmentNote(mappedOportunity, settlementId);
        if (opportunityArray.length === 0) {
            return false;
        }

        const groupedByOpportunity: AdjustmentNoteByChunks[][] = lodash.groupBy(opportunityArray, 'opportunityId');
        for (const group of Object.values(groupedByOpportunity)) {
            if (group.length !== 2) {
                return false;
            }
        }

        return true;
    }

    private async _updatePostgresOrders(fileData: AdjustmentNoteByChunks[], settlementId?: string): Promise<void> {
        const adjustmentService: IAdjustmentNoteServiceSettlements = new AdjustmentNoteServiceSettlements();
        if (settlementId) {
            fileData = fileData.filter(item => item.includeSettlement === 'NO');
        } else {
            fileData = fileData.filter(item => item.includeSettlement === 'SI');
        }

        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        const BATCH_SIZE = 100;
        const DELAY_MS = 500;

        for (let i = 0; i < fileData.length; i += BATCH_SIZE) {
            const batch = fileData.slice(i, i + BATCH_SIZE);

            await Promise.all(
                batch.map(item =>
                    adjustmentService.updateAdjustmentNoteOrderStatus(
                        item.adjustmentNotedocumentNumber,
                        item.includeSettlement === 'SI'
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

    async markOrders(data: AdjustmentNoteByChunks[], fileName: string, settlementId?: string): Promise<{ message: string; status: boolean }> {
        try {
            let message = 'SUCCESS';
            const invalidEntries = data.filter(item => item.includeSettlement !== 'SI' && item.includeSettlement !== 'NO');
            if (invalidEntries.length > 0) {
                throw new AppError({ message: `ERROR - SOMETHING INCLUDE ERROR` })
            }

            const adjustmentNoteDataMongo: AdjustmentNoteHash = await getAdjustmentNotesRepositoryByFileName(fileName);
            if (!adjustmentNoteDataMongo) {
                throw new AppError({ message: `ERROR - NOT MONGO HASH DATA` })
            }

            const validPartner: boolean = await this.validPartnerData(data, settlementId);
            if (!validPartner) {
                throw new AppError({ message: `ERROR - BAD VALIDATION PARTNER` })
            }

            let promises = [];
            promises = data.map((item) => {
                return updateOrdersByFile(item.adjustmentNotedocumentNumber, fileName, item.includeSettlement, settlementId);
            });
            await Promise.all(promises);
            log.info("Inserción en MongoDB completada");
            return {
                message,
                status: true
            };
        } catch (error) {
            log.error({ message: `Error creating new settlement: ${error.message}` });
            await Promise.all(
                data.map((item) => {
                    const value = settlementId ? "SI" : "NO"
                    return updateOrdersByFile(item.adjustmentNotedocumentNumber, fileName, value, settlementId)
                })
            );
            return { status: false, message: error.message }
        }
    }

    async updateSettlementOrders(fileName: string, consecutive: number, settlementId: string, userEmail: string) {
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
        await updateAllOrdersByFilename(fileName, "SI", settlementId);
        await updateByFileName(fileName);
    }

    async createNewSettlement(fileName: string, userEmail: string, settlementId?: string): Promise<string> {
        const service: IAdjustmentNoteServiceSettlements = new AdjustmentNoteServiceSettlements();
        const adjustmentNoteDomainSettlements = new AdjustmentNoteDomainSettlements();
        let adjustmentNoteSettlmentId = "";
        if (!settlementId) {
            const consecutive = Math.max(
                await service.getLastConsecutive() || 0,
                await getLastConsecutive() || 0
            );
            adjustmentNoteSettlmentId = await adjustmentNoteDomainSettlements.generateConsecutiveAdjustmentNote(consecutive);
            await this.updateSettlementOrders(fileName, consecutive + 1, adjustmentNoteSettlmentId, userEmail);

            const dataOrders = await getOrdersByFileName(fileName, "SI");
            this._updatePostgresOrders(dataOrders);
            return adjustmentNoteSettlmentId;
        } else {
            await updateAllOrdersByFilename(fileName, "NO", null);
            const dataOrders = await getOrdersByFileName(fileName, "NO");
            this._updatePostgresOrders(dataOrders, adjustmentNoteSettlmentId);
            await updateByFileName(fileName);
            return settlementId;
        }
    }

    async getBufferExcelByClient(settlementId: string, clientSignature: string): Promise<string> {
        const order = await getOrderByClient(settlementId, clientSignature);
        if (!order) {
            throw new AppError({ message: 'No se encontró información para el colaborador especificado.' });
        }
        log.info("Se encontraron datos para el colaborador especificado: %s ", clientSignature);

        const results: dataXlsx[] = [{
            data: [order],
            name: "COLABORADOR",
            headers: Object.keys(allHeaderKeys),
            headersKey: allHeaderKeys,
        }];
        const buffer = await GenerateMultiviewXlsx(results);
        return buffer;
    }
}