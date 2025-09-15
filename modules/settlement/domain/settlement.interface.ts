import { Status } from "../../../models/settlement";
import {
    ApiCoreResponse,
    GetSettlementViewOptions,
    SettlementViewType,
    UpdateSettlementState
} from "../type/settlement.type";

export interface ISettlementDomainInterface {
    getSettlements(options: GetSettlementViewOptions): Promise<SettlementViewType[]>
    /**
     * Create new settlement
     * @param data buffer of settlement
     * @param orderClass order class
     * @param user user to create settlement
     * @returns settlementId of the created settlement
     */
    createNewSettlement(data: Buffer, orderClass: string, user: string ): Promise<string>

    /**
     * Update settlement status
     * @param settlementId settlement id
     * @param status new status
     * @returns updated settlement
     */
    updateSettlement(settlementId: string, status: Status): Promise<string>

    /**
     * Validate settlement status
     * @param settlementId - settlement id for search in mongodb
     */
    checkSettlemnt(settlementId: string): Promise<any>

    /**
     * Metodo para obtener excel de aprobacion de liquidacion y enviarlo a linea de negocio
     * @param settlementId - identificador de liquidacion
     */
    approvalSettlement(settlementId: string): Promise<string>

    /**
     * Metodo para obtener el correo al que se enviara el reporte de liquidaciones
     */
    getEmailReport(): Promise<string>

    /**
     * Metodo para actualizar estado de liquidacion con mensaje opcional
     * @param settlementId - identificador de liquidacion
     * @param updateData - informacion a actualizar
     */
    UpdateSettlementStatus(settlementId: string, updateData: UpdateSettlementState): Promise<ApiCoreResponse>

    /**
     * Metodo para enviar correos a colaboradores segun liquidaciones
     * @param settlementId 
     */
    UploadRabbitApproveSettlement(settlementId: string): Promise<string>
}