import { SettlementBasicData } from "../type/validate.type"

export interface IValidateService {

    /**
     * Metodo para validar que el usuario autenticado sea un usuario aprobador
     * @param email - correo a validar 
     */
    ValidApprovedUserEmail(email: string, settlementId: string): Promise<boolean>

    /**
     * Metodo para consultar informacion basica de la liquidacion
     * @param settlementId - identificador de la liquidacion
     */
    GetSettlementData(settlementId: string): Promise<SettlementBasicData>

}