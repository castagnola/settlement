import { GetOrdersOptions } from "src/models/order";
import { OrderNotCufeListResponse, OrdersPairedResponse, OrdersSettlementTotal, ResponseOrderOrphan, ResponseOrdersSociety } from "../type/order.type";

export interface IOrderDomainInterface {
    getFilterOrders( options : GetOrdersOptions, buffer: Buffer): Promise<OrdersPairedResponse>

    getFilterOrdersSettlementId( options : GetOrdersOptions): Promise<OrdersPairedResponse>

    /**
     * Get orders to download
     * @returns base64 string
     */
    getOrdersDownload(settlementId: string | null, filter: Buffer): Promise<string>

    /**
     * Get orders orphan by filters
     * @param options Filters to get orders orphan
     * @returns Orders orphan | ResponseOrderOrphan
     */
    getOrdersOrphan(options: GetOrdersOptions, orderClass: string): Promise<ResponseOrderOrphan>

    /**
     * Metodo para obtener ordenes duplicadas
     * @param options - filtros para obtener ordenes duplicadas
     */
    getOrderDuplicate(options: GetOrdersOptions): Promise<any>;

    /**
     * Metodo para validar lista de duplicados
     * @param oportunityId - string con identificadores de oportunidad 12,23
     * @param ordersToValidate - string con id de ordenes para excluir 1,2,3
     */
    validateOrdersDuplicate(oportunityId: string, ordersToValidate: string): Promise<any>

    /**
     * Metodo para obtener ordenes por sociedad
     * @param options - filtros para obtener ordenes por sociedad
     * @returns Orders by society | ResponseOrdersSociety
     */
    getOrdersSociety(options: GetOrdersOptions, settlementId: string): Promise<ResponseOrdersSociety>

    /**
     * Metodo para obtener el base 64 con el excel de liquidacion
     * @param settlementId - Identificador de liquidacion
     */
    downloadOrdersSettlementBase64(settlementId: string, sendEmail?: boolean): Promise<string>

    /**
     * Metodo para traer ordenes que no tienen cufe segun filtro
     * @param settlementId - identificador de liquidacion
     * @param options - opciones de filtro
     */
    getOrderNotCufe(settlementId: string, options: GetOrdersOptions): Promise<OrderNotCufeListResponse>

    /**
     * Metodo para traer la consulta con los totales de las ordenes a facturar
     * @param buffer - archivo actual en front para consulta
     */
    getOrdersTotals(buffer: Buffer): Promise<OrdersSettlementTotal>
}