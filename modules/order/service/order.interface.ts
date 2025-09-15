import { GetOrdersOptions } from "src/models/order";
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
    OrderSettlementSocietiesResponse,
    OrderSettlementReportGeneral,
    OrderNotCufeListResponse,
    OrdersSettlementTotal
} from "../type/order.type";

export interface IOrderServiceInterface {
    getFilterOrders(options: GetOrdersOptions, buffer: Buffer): Promise<OrdersPairedResponse>

    getFilterOrdersSettlementId(options: GetOrdersOptions): Promise<OrdersPairedResponse>

    /**
     * Get orders to download
     * @param state Type of orders to download
     * @returns Orders to download | Order[]
     */
    getOrdersDownload(state: OrderStatusEnum, settlementId: string | null, filter: Buffer): Promise<OrderReportType[]>

    /**
     * Get orders orphan by filters
     * @param options Filters to get orders orphan
     * @returns Orders orphan | ResponseOrderOrphan
     */
    getOrdersOrphan(options: GetOrdersOptions, orderClass: string): Promise<ResponseOrderOrphan>

    /**
     * Obtener ordenes duplicadas
     * @param options - filtros para ordenes
     */
    getOrdersDuplicate(options: GetOrdersOptions): Promise<orderDuplicateDb>

    /**
     * Metodo para validar ordenes duplicadas
     * @param oportunityId - Identificador de oportunidades
     * @param ordersToValidate - Ordenes a validarr
     */
    validateOrdersDuplicate(oportunityId: string, ordersToValidate: string): Promise<ValidateDuplicateResponse>

    /**
     * Metodo para consultar los totalizadores segun los filtros
     * @param settlementId - identificador de liquidaciones
     * @param filter - filtros opcionales para totalizador
     */
    getTotalValuesSettlement(settlementId: string, filter: FilterTotalValues): Promise<TotalValueResponse>

    /**
     * Metodo para obtener ordenes de la sociedad
     * @param options - filtros para ordenes
     * @param settlementId - identificador de liquidaciones
     * @returns Orders society | ResponseOrdersSociety
     */
    getOrdersSociety(options: GetOrdersOptions, settlementId: string): Promise<ResponseOrdersSociety>;

    /**
     * Metodo para conseguir las ordenes de una liquidacion para la vista general
     * @param settlementId - identificador de liquidacion
     */
    getOrdersSettlementGeneral(settlementId: string): Promise<OrderSettlementReportGeneral[]>

    /**
     * Metodo para conseguir las ordenes de una liquidacion agrupadas por aliados y sociedades
     * @param settlementId - identificador de liquidaciones
     */
    getOrdersSettlementSociety(settlementId: string): Promise<OrderSettlementSocietiesResponse[]>

    /**
     * Metodo para consultar ordenes sin cufe
     * @param settlementId - identificador de liquidacion
     * @param options - opciones de filtro
     */
    getOrderNotCufe(settlementId: string, options: GetOrdersOptions): Promise<OrderNotCufeListResponse>

    /**
     * Metodo para traer la consulta con los totales de las ordenes a facturar
     * @param options - filtros a aplicar
     * @param buffer - archivo actual en front para consulta
     */
    getOrdersTotals(buffer: Buffer): Promise<OrdersSettlementTotal>
}