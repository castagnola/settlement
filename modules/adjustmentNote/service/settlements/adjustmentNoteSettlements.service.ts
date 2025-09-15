import { AdjustmentNoteOrderStatusPostgres, AdjustmentNoteType, GetAdjustmentViewOptions, GetPaginatedResults, SettlementFilter, TotalBySociety } from "../../type/adjustmentNote.type";
import { IAdjustmentNoteServiceSettlements } from "./adjustmentNoteSettlements.service.interface";
import { URI_SETTLEMENT_CORE } from "../../../../helpers/constans.type";
import { AppError, Axios, ResponseApi } from "vanti-utils/lib";
import { AdjustmentNoteStatus } from "../../../../models/adjustmentNoteSettlement";


export class AdjustmentNoteServiceSettlements implements IAdjustmentNoteServiceSettlements {

    async getAdjustmentNotes(options: GetAdjustmentViewOptions): Promise<AdjustmentNoteType[]> {
        const baseURL = `${URI_SETTLEMENT_CORE}/adjustment-note/settlements`;
        // Construir los parámetros de consulta
        const params = new URLSearchParams();
        if (options.dateRequest) params.append('dateRequest', options.dateRequest);
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.fieldOrder) params.append('fieldOrder', options.fieldOrder);
        if (options.orderType) params.append('orderType', options.orderType);
        if (options.settlementId) params.append('settlementId', options.settlementId);
        // Construir la URL completa con parámetros
        const urlWithParams = `${baseURL}?${params.toString()}`;
        try {
            const response = await Axios.get(urlWithParams);
            return response.data.data;
        } catch (error) {
            log.error('Error getting settlements: %s', JSON.stringify(error));
            throw new AppError({ message: 'Error getting settlements' });
        }
    }

    /**
     * Actualiza el estado de una nota de ajuste
     * @param settlementId id de liquidacion de la nota de ajuste
     * @param state estado de la nota de ajuste
     * @returns Promise<boolean> true si se actualiza correctamente
     */
    async updateSettlementStatus(settlementId: string, state: AdjustmentNoteStatus): Promise<boolean> {
        const baseURL = `${URI_SETTLEMENT_CORE}/adjustment-note/update-settlement/${settlementId}`;
        try {
            const { data, status } = await Axios.put<ResponseApi<boolean>>(baseURL, { state });
            if (status != 200) {
                log.error('Error updating settlement status: %s', JSON.stringify(data));
                throw new AppError({ message: 'Error updating settlement status' });
            }
            return data.data;
        } catch (error) {
            log.error('Error updating settlement status: %s', JSON.stringify(error.message));
            throw new AppError({ message: 'Error updating settlement status' });
        }
    }

    async getLastConsecutive(): Promise<number> {
        const baseURL = `${URI_SETTLEMENT_CORE}/adjustment-note/last-consecutive`;
        try {
            const response = await Axios.get<ResponseApi<number>>(baseURL);
            return response.data.data;
        } catch (error) {
            log.error('Error getting last consecutive adjustmentNote: %s', JSON.stringify(error));
            throw new AppError({ message: 'Error last consecutive adjustmentNote' });
        }
    }

    async updateAdjustmentNoteOrderStatus(documentNumber: string, status: AdjustmentNoteOrderStatusPostgres): Promise<boolean> {
        const baseURL = `${URI_SETTLEMENT_CORE}/adjustment-note/order/update-status/${documentNumber}`;
        try {
            const response = await Axios.patch<ResponseApi<boolean>>(baseURL, { status });
            return response.data.data;
        } catch (error) {
            log.error('Error updating status adjustmentNote: %s', JSON.stringify(error));
            throw new AppError({ message: 'Error updating status adjustmentNote' });
        }
    }

    async getSettlementsPostgres(settlementId: string, filter: SettlementFilter): Promise<{resultPaginated:{ total: number; data: GetPaginatedResults[] }, statusSettlement: AdjustmentNoteStatus}> {
        const baseURL = `${URI_SETTLEMENT_CORE}/adjustment-note/order/settlement-society/${settlementId}`;

        const params = new URLSearchParams();
        if (filter.society) params.append('society', filter.society);
        if (filter.page) params.append('page', filter.page.toString());
        if (filter.limit) params.append('limit', filter.limit.toString());

        const urlWithParams = `${baseURL}?${params.toString()}`;
        try {
            const response = await Axios.get<ResponseApi<{resultPaginated:{ total: number; data: GetPaginatedResults[] }, statusSettlement: AdjustmentNoteStatus}>>(urlWithParams);
            return response.data.data;
        } catch (error) {
            log.error(`Error getting settlements postgres: ${error.message}`)
            throw new AppError({ message: `Error getting settlements postgres: ${error.message}` })
        }
    }

    async getSettlementsTotalsPostgres(settlementId: string, society: string): Promise<TotalBySociety> {
        const baseURL = `${URI_SETTLEMENT_CORE}/adjustment-note/order/settlement-society-totals/${settlementId}`;

        const params = new URLSearchParams();
        if (society) params.append('society', society);

        const urlWithParams = `${baseURL}?${params.toString()}`;
        try {
            const response = await Axios.get<ResponseApi<{resultTotal:TotalBySociety}>>(urlWithParams);
            return response.data.data.resultTotal;
        } catch (error) {
            log.error(`Error getting settlements postgres: ${error.message}`)
            throw new AppError({message: `Error getting settlements totals postgres: ${error.message}`})
        }
    }
}