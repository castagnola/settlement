import { AdjustmentNoteStatus } from "src/models/adjustmentNoteSettlement";
import { AdjustmentNoteByChunks, GetAdjustmentNotesSettlementResponse, GetPaginatedResults, TotalBySociety } from "../../type/adjustmentNote.type";

export interface IAdjustmentNoteDomainDraft {

    /**
     * Metodo para obtener los resultados paginados
     * @param society
     * @param page
     * @param limit
     */
    getPaginatedResults(society: string, page: number, limit: number, settlementId: string): Promise<{resultPaginated: { total: number; data: GetPaginatedResults[] }, statusSettlement: AdjustmentNoteStatus}>;

    /**
     * Metodo para obtener los totales por sociedad
     * @param society
     */
    getTotalBySociety(
        society: string,
        settlementId: string
    ): Promise<TotalBySociety>;

    /**
     * Metodo para obtener los datos de un excel con los totales por sociedad
     * @param society
     */
    getDetailsSettlement(settlementId: string): Promise<boolean>;

    /**
         * Metodo para obtener las notas de ajuste de liquidación
         * @param settlementId
         * @param dateRequest
         * @param page
         * @param limit
         * @param orderType
         * @param fieldOrder
         */
    getAdjustmentNotesSettlement(page: number, limit: number, settlementId: string, dateRequest: string, orderType: "ASC" | "DESC", fieldOrder: string[]): Promise<GetAdjustmentNotesSettlementResponse>;


    /**
     * Metodo para obtener los datos de un excel con los totales por sociedad
     * @param society
     */
    getBufferExcelTotalBySettlement(settlementId: string): Promise<string>;

    /**
     * Metodo para crear un nuevo ajuste
     * @param data
     * @param fileName
     */
    markOrders(data: AdjustmentNoteByChunks[], fileName: string): Promise<{message: string, status: boolean}>;
}