import { EmailData, MultiSendEmailData } from "../type/transversales.type";


export interface ItransversalService {

    /**
     * Envio de correo
     */
    sendEmail(emailInfo: EmailData | MultiSendEmailData): Promise<boolean>
}