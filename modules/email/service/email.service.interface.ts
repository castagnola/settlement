import { EmailType, GetEmailViewOptions, UploadEmail, UploadResponse } from "../type/email.type";

export interface IEmailService {

    getEmails(options: GetEmailViewOptions): Promise<EmailType[]>;


    /**
     * Metodo para enviar a core los correo
     * @param data - informacion de correos a enviar
     */
    sendUploadEmail(data: UploadEmail[]): Promise<UploadResponse>
    
}