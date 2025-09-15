import { AdjustmentNoteMassiveResponse, ReturnFileData } from "../../type/adjustmentNoteMassive";

export interface IAdjustmentNoteDomainMassive {
    /**
     * Metodo para obtener la ultima carga masiva
     */
    getLastUpload(): Promise<{createdAt: Date}>;

    /**
     * Metodo para obtener el archivo de ordenes massivas a asignar
     */
    getOrderMassiveFile(): Promise<ReturnFileData>;

    /**
     * Metodo para guardar las ordenes masivas
     */
    saveMassiveOrders(file: Buffer, fileName: string): Promise<AdjustmentNoteMassiveResponse>;
}