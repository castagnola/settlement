import { AdjustmentNoteHash } from "../../../../models/adjustmentNoteHash";
import { AdjustmentPartnerWithoutSettlementNote } from "../../type/adjustmentNote.type";

export interface IAdjustmentNoteDomainOrders {

    /**
     * Metodo para obtener el cantidad de pedidos a generar en nueva liquidacion
     */
    getCountAdjustmentNotesToNewSettlement(settlementId?: string): Promise<number>

    /**
     * Metodo para obtener las ordenes para una nueva liquidacion de ajuste
     */
    getOrdersToNewSettlement(settlementId?: string): Promise<string>;

    /**
     * Metodo para obtener estructura de hash de un archivo de liquidaciones de ajuste
     */
    getFileHash(fileData: AdjustmentPartnerWithoutSettlementNote[], fileName: string): Promise<AdjustmentNoteHash>
    
}