import { AdjustmentMessageReturn, AdjustmentNoteType, GetAdjustmentViewOptions } from "../../type/adjustmentNote.type";

export interface IAdjustmentNoteDomainSettlements {

    /**
     * Metodo para consultar las liquidaciones de ajuste
     * @param options
     */
    getAdjustmentNotes(options: GetAdjustmentViewOptions): Promise<AdjustmentNoteType[]>;

    /**
     * Metodo para crear una nueva liquidacion de ajuste
     * @param file - archivo con seleccion de ordenes
     */
    createNewSettlement(file: Buffer, fileName: string, userEmail: string, settlementId?: string): Promise<AdjustmentMessageReturn>;

    /**
     * Metodo para obtener los datos de un excel con los totales por sociedad
     * @param settlementId
     */
    approvalSettlementAdjustmentNote(settlementId: string): Promise<string>;
}