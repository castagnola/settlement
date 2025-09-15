
import { Axios, ResponseApi } from "vanti-utils/lib";
import { EmailData, MultiSendEmailData } from "../type/transversales.type";
import { ItransversalService } from "./itransversal.interface";
const { EMAIL_APPLICATION, SHARED_SERVICES, VANTI_EMAIL } = process.env

export class TransversalService implements ItransversalService {

    async sendEmail(emailInfo: EmailData | MultiSendEmailData): Promise<boolean> {
        const url = `${SHARED_SERVICES}${VANTI_EMAIL}/notification/send`;	
        const response = await Axios.post<ResponseApi<boolean>>(url, emailInfo,  {
            headers: {
                'x-application': EMAIL_APPLICATION,
            }
        })
        return response.data.data;
    }
}