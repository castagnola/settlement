import { EmailType, GetEmailViewOptions, UploadResponse } from "../type/email.type";

export interface IEmailDomain {

    getEmails(options: GetEmailViewOptions): Promise<EmailType[]>;


    /**
     * Metodo para coger correos del excel y enviarlos a la base de datos
     * @param file - archivo con correos a enviar
     */
    UploadEmails(file: Buffer): Promise<UploadResponse>

    /**
     * Metodo para obtener la plantilla de s3 para cargar correos
     */
    GetUploadFile(): Promise<string>
}