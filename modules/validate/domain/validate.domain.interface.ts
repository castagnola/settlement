import { ValidateEmailResponse } from "../type/validate.type";

export interface IValidateDomain {

    /**
     * Metodo para validar si el usuario autenticado es un usuario aprobador
     */
    validEmailApprove(email: string, settlementId: string): Promise<ValidateEmailResponse>

}