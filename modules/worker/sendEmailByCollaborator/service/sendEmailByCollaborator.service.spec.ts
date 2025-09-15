import { describe, expect, it, jest, beforeAll } from '@jest/globals';
import { Axios } from 'vanti-utils/lib';
import { OrderSettlementReportGeneral } from '../../../order/type/order.type';
import { ISendEmailByCollaboratorService } from "./sendEmailByCollaborator.service.interface";
import { SendEmailByCollaboratorService } from './sendEmailByCollaborator.service'
import { SettlementEmailType } from '../../sendEmailByCollaborator.Type';
jest.mock('vanti-utils/lib');
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

describe("should validate sendEmailByCollaboratorService", ()=> {
    it("should validate getDataToXlsxByCollaborator", async () => {
        const settlementId = 'testData'
        const bp = 'testData'
        const date = new Date();

        const mockResponse: OrderSettlementReportGeneral[] = [
            {
                id: 'testData',
                date_invoice: date,
                oportunity_id: 'testData',
                document_class: 'testData',
                document_number: 'testData',
                collaborator_identification: 'testData',
                collaborator_name: 'testData',
                society_code: 'testData',
                contract_account: 'testData',
                campaing_id: 'testData',
                amount: 0,
                vat: 0,
                total_amount: 0,
                rediscount: 0,
                accounting_document_id: 'testData',
                id_invoice_rediscount: 'testData',
                state: 'testData',
                interest_rate: 0,
                quotas: 0,
                ticket: 'testData',
                invoice_document: 'testData',
                date_request: date,
                client_name: 'testData',
                client_identification: 'testData',
                society_name: 'testData'
            }
        ]

        jest.spyOn(Axios, 'get').mockResolvedValue({});
        mockedAxios.get.mockResolvedValue({ data: { data: mockResponse, status: 200 }, status: 200 });

        const sendEmailService: ISendEmailByCollaboratorService = new SendEmailByCollaboratorService()
        const result = await sendEmailService.getDataToXlsxByCollaborator(settlementId, bp);

        expect(result).toEqual(mockResponse);
    })

    it("should validate getEmailToSendCollaborator", async () => {
        const settlementId = 'testData'
        const date = new Date();

        const mockResponse: SettlementEmailType[] = [
            {
                id: 'testData',
                recipitentName: 'testData',
                email: 'testData',
                active: false,
                mobileNumber: 'testData',
                identification: 'testData',
                position: 'testData',
                collaboratorId: 'testData',
                collaboratorIdentification: 'testData',
                name: 'testData',
                bp: 'testData',
                createdAt: date,
                updatedAt: date
            }
        ]

        jest.spyOn(Axios, 'get').mockResolvedValue({});
        mockedAxios.get.mockResolvedValue({ data: { data: mockResponse, status: 200 }, status: 200 });

        const sendEmailService: ISendEmailByCollaboratorService = new SendEmailByCollaboratorService()
        const result = await sendEmailService.getEmailToSendCollaborator(settlementId);

        expect(result).toEqual(mockResponse);
    })
})