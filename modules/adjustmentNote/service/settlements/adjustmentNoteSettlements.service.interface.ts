import { AdjustmentNoteStatus } from "../../../../models/adjustmentNoteSettlement";
import { AdjustmentNoteOrderStatusPostgres, AdjustmentNoteType, GetAdjustmentViewOptions, GetPaginatedResults, SettlementFilter } from "../../type/adjustmentNote.type";

export interface IAdjustmentNoteServiceSettlements {
    
    getAdjustmentNotes(options: GetAdjustmentViewOptions): Promise<AdjustmentNoteType[]>;

    /**
     * Actualiza el estado de una nota de ajuste
     * @param settlementId id de liquidacion de la nota de ajuste
     * @param state estado de la nota de ajuste
     * @returns Promise<boolean> true si se actualiza correctamente
     */
    updateSettlementStatus(settlementId: string, state: AdjustmentNoteStatus): Promise<boolean>;

    getLastConsecutive(): Promise<number>;

    updateAdjustmentNoteOrderStatus(documentNumber: string, status: AdjustmentNoteOrderStatusPostgres): Promise<boolean>;

    getSettlementsPostgres(settlementId: string, filter: SettlementFilter): Promise<{resultPaginated:{ total: number; data: GetPaginatedResults[] }, statusSettlement: AdjustmentNoteStatus}>
}