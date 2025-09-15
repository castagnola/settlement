import { DocumentNumberToValidate, OrderMassive, OrderMassiveValidate, OrdersToSaveRelation, OrderValidationStatus } from "../../type/adjustmentNoteMassive";
import { IAdjustmentNoteMassiveService } from "./adjustmentNoteOrdersMassive.service.interface";
import { URI_SETTLEMENT_CORE } from "../../../../helpers/constans.type";
import { AppError, Axios, ResponseApi } from "vanti-utils/lib";

export class AdjustmentNoteMassiveService implements IAdjustmentNoteMassiveService {
    
    async getMassiveOrdersToFile(): Promise<OrderMassive[]> {
        const baseURL = `${URI_SETTLEMENT_CORE}/adjustment-note/mass-order/orders`;
        try {
            const response = await Axios.get<ResponseApi<OrderMassive[]>>(baseURL);
            return response.data.data;
        } catch (error) {
            log.error('Error getting orders adjustmentNote: %s', JSON.stringify(error));
            throw new AppError({ message: 'Error getting orders adjustmentNote' });
        }
    }

    async validateMassiveOrders(ordersToValidate: DocumentNumberToValidate): Promise<string> {
        const baseURL = `${URI_SETTLEMENT_CORE}/adjustment-note/mass-order/validate`;
        const response = await Axios.post<ResponseApi<string>>(baseURL, ordersToValidate);
        return response.data.data;
    }

    async saveMassiveOrderRelation(ordersToSave: OrdersToSaveRelation[]): Promise<any> {
        const baseURL = `${URI_SETTLEMENT_CORE}/adjustment-note/mass-order/save`;
        try {
            const response = await Axios.post<ResponseApi<OrderMassiveValidate>>(baseURL, {orders:ordersToSave});
            return response.data.data;
        } catch (error) {
            log.error('Error getting orders adjustmentNote: %s', JSON.stringify(error));
            throw new AppError({ message: 'Error getting orders adjustmentNote' });
        }
    }
    
}