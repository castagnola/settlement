import { DocumentNumberToValidate, OrderMassive, OrdersToSaveRelation, OrderValidationStatus } from "../../type/adjustmentNoteMassive";

export interface IAdjustmentNoteMassiveService {

    /**
     * Traer Ordenes para armar archivo de ordenes masivas
     */
    getMassiveOrdersToFile(): Promise<OrderMassive[]>

    /**
     * Validar ordenes para cargue de masivos
     */
    validateMassiveOrders(ordersToValidate: DocumentNumberToValidate): Promise<string>;

    /**
     * Guardar relacion de ordenes en postgres
     */
    saveMassiveOrderRelation(ordersToSave: OrdersToSaveRelation[]): Promise<any>;

}