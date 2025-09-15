import { AppError, Axios, ResponseApi } from "vanti-utils/lib";
import { URI_SETTLEMENT_CORE } from "../../../helpers/constans.type";
import { EmailType, GetEmailViewOptions, UploadEmail, UploadResponse } from "../type/email.type";
import { IEmailService } from "./email.service.interface";

export class EmailService implements IEmailService {

    async getEmails(options: GetEmailViewOptions): Promise<EmailType[]> {

        const baseURL = `${URI_SETTLEMENT_CORE}/email/list`;

        // Construir los parámetros de consulta
        const params = new URLSearchParams();

        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.fieldOrder) params.append('fieldOrder', options.fieldOrder);
        if (options.orderType) params.append('orderType', options.orderType);
        if (options.field) params.append('field', options.field);
        if (options.value) params.append('value', options.value);

        // Construir la URL completa con parámetros
        const urlWithParams = `${baseURL}?${params.toString()}`;

        try {
            const response = await Axios.get(urlWithParams);
            return response.data.data;
        } catch (error) {
            log.error('Error getting emails: %s', JSON.stringify(error));
            throw new AppError({ message: 'Error getting emails' });
        }
    }

    /**
   * @see IEmailService.sendUploadEmail
   */
    async sendUploadEmail(data: UploadEmail[]): Promise<UploadResponse> {
        log.info(`${URI_SETTLEMENT_CORE}/email/upload`)
        const response = await Axios.post<ResponseApi<UploadResponse>>(`${URI_SETTLEMENT_CORE}/email/upload`, data);
        return response.data.data;
    }

}