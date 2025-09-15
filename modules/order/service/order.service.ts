import { IOrderServiceInterface } from "./order.interface";
import {
    OrderStatusEnum,
    ResponseOrderOrphan,
    OrderReportType,
    orderDuplicateDb,
    ValidateDuplicateResponse,
    OrdersPairedResponse,
    FilterTotalValues,
    TotalValueResponse,
    ResponseOrdersSociety,
    OrderSettlementReportGeneral,
    OrderSettlementSocietiesResponse,
    OrderNotCufeListResponse,
    OrdersSettlementTotal
} from "../type/order.type";
import { Axios, ResponseApi } from "vanti-utils/lib";
import { URI_SETTLEMENT_CORE } from "../../../helpers/constans.type";
import { GetOrdersOptions } from "src/models/order";


export class OrderService implements IOrderServiceInterface {

    async getFilterOrders(options: GetOrdersOptions, buffer: Buffer): Promise<OrdersPairedResponse> {
       
        const baseURL = `${URI_SETTLEMENT_CORE}/order/search`;
        // Construir los parámetros de consulta
        const params = new URLSearchParams();

        if (options.dateRequest) params.append('dateRequest', options.dateRequest);
        if (options.settlementId) params.append('settlementId', options.settlementId);
        if (options.field) params.append('field', options.field);
        if (options.value) params.append('value', options.value);
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.orderField) params.append('orderField', options.orderField);
        if (options.orderType) params.append('orderType', options.orderType);
        // Construir la URL completa con parámetros
        const urlWithParams = `${baseURL}?${params.toString()}`;

        try {
            const { data } = await Axios.post<ResponseApi<OrdersPairedResponse>>(urlWithParams, buffer, {
                headers: {
                  'Content-Type': 'application/octet-stream',
                  'Content-Length': buffer.length
                }
              })

            if(data.data.total){
                let state = data.data.total["state"];
                delete data.data.total["state"];
                data.data.state=state;
            }
            
            return data.data;
        } catch (error) {
            log.info('[Error] no se pudo obtener los datos de la orden %s', JSON.stringify(error.message));
            return null;
        }
    }

    async getFilterOrdersSettlementId(options: GetOrdersOptions): Promise<OrdersPairedResponse> {
       
        const baseURL = `${URI_SETTLEMENT_CORE}/order/search`;
        const params = new URLSearchParams();

        if (options.dateRequest) params.append('dateRequest', options.dateRequest);
        if (options.settlementId) params.append('settlementId', options.settlementId);
        if (options.field) params.append('field', options.field);
        if (options.value) params.append('value', options.value);
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.orderField) params.append('orderField', options.orderField);
        if (options.orderType) params.append('orderType', options.orderType);

        const urlWithParams = `${baseURL}?${params.toString()}`;

        try {
            const { data } = await Axios.get<ResponseApi<OrdersPairedResponse>>(urlWithParams)
            return data.data;
        } catch (error) {
            log.info('[Error] no se pudo obtener los datos de la orden %s', JSON.stringify(error));
            return null;
        }
    }

    /**
     * Get orders to download
     * @param state Type of orders to download
     * @returns Orders to download | Order[]
     */
    async getOrdersDownload(state: OrderStatusEnum, settlementId: string|null, filter: Buffer): Promise<OrderReportType[]> {
        const response = await Axios.post<ResponseApi<OrderReportType[]>>(`${URI_SETTLEMENT_CORE}/order/download`, 
            filter,
            { headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Length': filter.length,
                'x-settlement': settlementId
            }, params: {state}});

        return response.data.data
    }

    /**
     * Get orders orphan by filters
     * @param options Filters to get orders orphan
     * @returns Orders orphan | ResponseOrderOrphan
     */
    async getOrdersOrphan(options: GetOrdersOptions, orderClass: string): Promise<ResponseOrderOrphan> {
        const baseURL = `${URI_SETTLEMENT_CORE}/order/orphan`;
        const params = new URLSearchParams();

        if (options.dateRequest) params.append('dateRequest', options.dateRequest.toString());
        if (options.field) params.append('field', options.field);
        if (options.value) params.append('value', options.value);
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.orderField) params.append('orderField', options.orderField);
        if (options.orderType) params.append('orderType', options.orderType);
        if (options.marked && !options.unmarked) params.append('marked', options.marked.toString());
        if (options.unmarked && !options.marked) params.append('unmarked', options.unmarked.toString());

        const urlWithParams = `${baseURL}?${params.toString()}`;

        try {
            const { data } = await Axios.get<ResponseApi<ResponseOrderOrphan>>(urlWithParams,{
                headers: { 'x-orderclass': orderClass }
            });
            return data.data;
        } catch (error) {
            log.error('[Error] no se pudo obtener los datos de la orden %s', JSON.stringify(error));
            return { rows: [], count: 0 };
        }

    }

    async getOrdersDuplicate(options: GetOrdersOptions): Promise<orderDuplicateDb> {
        const baseURL = `${URI_SETTLEMENT_CORE}/order/orders-duplicate`;
        const params = new URLSearchParams();

        params.append('page', options.page ? options.page.toString() : '1');
        params.append('limit', options.limit ? options.limit.toString() : '10');
        if (options.dateRequest) params.append('dateRequest', options.dateRequest.toString());
        if (options.field) params.append('field', options.field);
        if (options.value) params.append('value', options.value);
        if (options.orderField) params.append('orderField', options.orderField);
        if (options.orderType) params.append('orderType', options.orderType);
        if (options.marked && !options.unmarked) params.append('marked', options.marked.toString());
        if (options.unmarked && !options.marked) params.append('unmarked', options.unmarked.toString());

        const urlWithParams = `${baseURL}?${params.toString()}`;

        try {
            const { data } = await Axios.get<ResponseApi<orderDuplicateDb>>(urlWithParams);
            return data.data;
        } catch (error) {
            log.error('[Error] no se pudo obtener los datos de la orden %s', JSON.stringify(error));
            return { rows: [], count: 0 };
        }
    }

    async validateOrdersDuplicate(oportunityId: string, ordersToValidate: string): Promise<ValidateDuplicateResponse> {
        const baseURL = `${URI_SETTLEMENT_CORE}/order/duplicate/${oportunityId}`;
        const params = new URLSearchParams();
        params.append('duplicate', ordersToValidate);

        const urlWithParams = `${baseURL}?${params.toString()}`;

        const {data} = await Axios.get<ResponseApi<ValidateDuplicateResponse>>(urlWithParams);
        return data.data
    }

    /**
     * @see IOrderServiceInterface.getTotalValues
     */
    async getTotalValuesSettlement(settlementId: string, filter: FilterTotalValues): Promise<TotalValueResponse> {
        const response = await Axios.get<ResponseApi<TotalValueResponse>>(`${URI_SETTLEMENT_CORE}/order/total-values/${settlementId}`, {params: filter});
        return response.data.data
    }

    /**
     * @see IOrderServiceInterface.getOrdersSociety
     * @param options options to filter orders
     * @param settlementId settlement id
     * @returns orders society
     */
    async getOrdersSociety(options: GetOrdersOptions, settlementId: string): Promise<ResponseOrdersSociety> {
        const baseURL = `${URI_SETTLEMENT_CORE}/order/search-society/${settlementId}`;
        const params = new URLSearchParams();

        if (options.field) params.append('field', options.field);
        if (options.value) params.append('value', options.value);
        params.append('page', options.page ? options.page.toString() : '1');
        params.append('limit', options.limit ? options.limit.toString() : '10');
        if (options.orderField) params.append('orderField', options.orderField);
        if (options.orderType) params.append('orderType', options.orderType);
        if (options.society) params.append('society', options.society);

        const urlWithParams = `${baseURL}?${params.toString()}`;

        try {
            const { data } = await Axios.get<ResponseApi<ResponseOrdersSociety>>(urlWithParams);
            return data.data;
        } catch (error) {
            log.error('[Error] no se pudo obtener los datos de la orden %s', JSON.stringify(error));
            return { 
                rows: [], 
                count:0, 
                total: {
                    totalClient: 0,
                    totalFirm: 0,
                    totalOrders: 0,
                    totalValue: 0,
                } 
            }
        }
    }

    /**
     * @see IOrderServiceInterface.getOrdersSettlementGeneral
     */
    async getOrdersSettlementGeneral(settlementId: string): Promise<OrderSettlementReportGeneral[]>{
        log.info('[getOrdersSettlementGeneral] - inicio servicio geneal xlsx')
        const response = await Axios.get<ResponseApi<OrderSettlementReportGeneral[]>>(`${URI_SETTLEMENT_CORE}/order/orders/${settlementId}`);
        log.info('[getOrdersSettlementGeneral] - fin servicio geneal xlsx')
        return response.data.data
    }

    /**
     * @see IOrderServiceInterface.getOrdersSettlementSociety
     */
    async getOrdersSettlementSociety(settlementId: string): Promise<OrderSettlementSocietiesResponse[]>{
        log.info('[getOrdersSettlementSociety] - inicio servicio sociedades xlsx')
        const response = await Axios.get<ResponseApi<OrderSettlementSocietiesResponse[]>>(`${URI_SETTLEMENT_CORE}/order/society/${settlementId}`);
        log.info('[getOrdersSettlementSociety] - fin servicio sociedades xlsx')
        return response.data.data
    }

    async getOrderNotCufe(settlementId: string, options: GetOrdersOptions): Promise<OrderNotCufeListResponse> {
        const baseURL = `${URI_SETTLEMENT_CORE}/order/not-cufe/${settlementId}`;
        const params = new URLSearchParams();

        params.append('page', options.page ? options.page.toString() : '1');
        params.append('limit', options.limit ? options.limit.toString() : '10');
        if (options.orderField) params.append('orderField', options.orderField);
        if (options.orderType) params.append('orderType', options.orderType);

        const urlWithParams = `${baseURL}?${params.toString()}`;

        const response = await Axios.get<ResponseApi<OrderNotCufeListResponse>>(urlWithParams)
        return response.data.data
    }

    /**
     * @see IOrderServiceInterface.getOrdersTotals
     */
    async getOrdersTotals(buffer: Buffer): Promise<OrdersSettlementTotal> {
        const baseURL = `${URI_SETTLEMENT_CORE}/order/total-values-bill`;

        const response = await Axios.post<ResponseApi<OrdersSettlementTotal>>(baseURL, buffer, {
            headers: {
              'Content-Type': 'application/octet-stream',
              'Content-Length': buffer.length
            }
          })
        return response.data.data
    }
}