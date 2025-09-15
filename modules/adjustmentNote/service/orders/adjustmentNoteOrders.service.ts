import { IAdjustmentNoteServiceOrders } from "./adjustmentNoteOrders.service.interface";
import { URI_SETTLEMENT_CORE } from "../../../../helpers/constans.type";
import { AdjustmentPartnerWithoutSettlementNote } from "../../type/adjustmentNote.type";
import { AppError, Axios, ResponseApi } from "vanti-utils/lib";

export class AdjustmentNoteServiceOrders implements IAdjustmentNoteServiceOrders {
    
    async getOrdersToNewSettlement():Promise<AdjustmentPartnerWithoutSettlementNote[]> {
        const baseURL = `${URI_SETTLEMENT_CORE}/adjustment-note/orders`;
        try {
            const response = await Axios.get<ResponseApi<AdjustmentPartnerWithoutSettlementNote[]>>(baseURL);
            return response.data.data;
        } catch (error) {
            log.error('Error getting orders adjustmentNote: %s', JSON.stringify(error));
            throw new AppError({ message: 'Error getting orders adjustmentNote' });
        }
    }

    async getCountAdjustmentNotesToNewSettlement(): Promise<number> {
        const baseURL = `${URI_SETTLEMENT_CORE}/adjustment-note/order/count-orders-new-settlement`;
        try {
            const response = await Axios.get<ResponseApi<number>>(baseURL);
            return response.data.data;
        } catch (error) {
            log.error('Error getting count orders adjustmentNote: %s', JSON.stringify(error));
            throw new AppError({ message: 'Error getting count orders adjustmentNote' });
        }
    }
    
}