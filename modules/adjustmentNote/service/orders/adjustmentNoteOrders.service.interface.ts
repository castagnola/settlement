import { AdjustmentPartnerWithoutSettlementNote } from "../../type/adjustmentNote.type";

export interface IAdjustmentNoteServiceOrders {
    
    getOrdersToNewSettlement():Promise<AdjustmentPartnerWithoutSettlementNote[]>;

    getCountAdjustmentNotesToNewSettlement(): Promise<number>;
    
}