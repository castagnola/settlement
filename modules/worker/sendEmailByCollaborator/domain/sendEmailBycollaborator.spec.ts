import { describe, expect, it, jest, beforeAll } from '@jest/globals';
import { SettlementEmail, SettlementEmailStatusEnum } from '../../../../models/settlmentEmail/settlement.type'
import { OrderSettlementReportGeneral } from "../../../order/type/order.type";
import { SendEmailByCollaboratorService } from "../service/sendEmailByCollaborator.service";
import { SettlementService } from "../../../settlement/service/settlement.service";
import * as helper from "../../../../helpers/xlsx/xlsx";
import { UserLineData } from '../../../settlement/type/settlement.type';
import { SettlementEmailType } from '../../sendEmailByCollaborator.Type';
import { TransversalService } from "../../../transversales/service/transversal.service";
import { ISendEmailByCollaboratorDomain } from "./sendEmailBycollaborator.interface";
import { SendEmailByCollaboratorDomain } from "./sendEmailBycollaborator.domain";
import * as settlementEmailRepository from "../../../settlement/repository/settlementEmail/settlementEmail.repository";
import { AppError } from 'vanti-utils/lib';

describe("should validate sendEmailByCollaborator", () => {
    it("should validate processEmailToSend SEND_OK", async () => {

        const id = 'testData';
        const settlementEmail: SettlementEmail = {
            collaboratorBp: 'testData',
            emailStatus: SettlementEmailStatusEnum.PENDING_CREATE,
            settlementId: 'testData',
            _id: 'testData'
        }
        const date = new Date();
        const dataXlsx: OrderSettlementReportGeneral[] = [
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
        ];
        const userLineView: UserLineData = {
            copyEmail: [],
            name: 'testData',
            userEmail: 'testData@test'
        }
        const emailList: SettlementEmailType[] = [
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

        jest.spyOn(SendEmailByCollaboratorService.prototype, 'getDataToXlsxByCollaborator').mockResolvedValue(dataXlsx);
        jest.spyOn(helper, 'GenerateMultiviewXlsx').mockResolvedValue('testData');
        jest.spyOn(SettlementService.prototype, 'getUserLineData').mockResolvedValue(userLineView);
        jest.spyOn(SendEmailByCollaboratorService.prototype, 'getEmailToSendCollaborator').mockResolvedValue(emailList)
        const jestMethod = jest.spyOn(TransversalService.prototype, 'sendEmail').mockResolvedValue(true);
        jest.spyOn(settlementEmailRepository, 'updateSettlementEmailById').mockResolvedValue({} as any)
        jest.spyOn(settlementEmailRepository, 'getSettlementEmailById').mockResolvedValue(settlementEmail)

        const sendEmailDomain: ISendEmailByCollaboratorDomain = new SendEmailByCollaboratorDomain();
        await sendEmailDomain.processEmailToSend('testData');

        expect(jestMethod).toHaveBeenCalled();
    })

    it("should validate processEmailToSend ERROR_SEND", async () => {

        const id = 'testData';
        const settlementEmail: SettlementEmail = {
            collaboratorBp: 'testData',
            emailStatus: SettlementEmailStatusEnum.PENDING_CREATE,
            settlementId: 'testData',
            _id: 'testData'
        }
        const date = new Date();
        const dataXlsx: OrderSettlementReportGeneral[] = [
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
        ];
        const userLineView: UserLineData = {
            copyEmail: [],
            name: 'testData',
            userEmail: 'testData@test'
        }
        const emailList: SettlementEmailType[] = [
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

        jest.spyOn(SendEmailByCollaboratorService.prototype, 'getDataToXlsxByCollaborator').mockResolvedValue(dataXlsx);
        jest.spyOn(helper, 'GenerateMultiviewXlsx').mockResolvedValue('testData');
        jest.spyOn(SettlementService.prototype, 'getUserLineData').mockResolvedValue(userLineView);
        jest.spyOn(SendEmailByCollaboratorService.prototype, 'getEmailToSendCollaborator').mockResolvedValue(emailList)
        const jestMethod = jest.spyOn(TransversalService.prototype, 'sendEmail').mockResolvedValue(false);
        jest.spyOn(settlementEmailRepository, 'updateSettlementEmailById').mockResolvedValue({} as any)
        jest.spyOn(settlementEmailRepository, 'getSettlementEmailById').mockResolvedValue(settlementEmail)

        const sendEmailDomain: ISendEmailByCollaboratorDomain = new SendEmailByCollaboratorDomain();
        await sendEmailDomain.processEmailToSend('testData');

        expect(jestMethod).toHaveBeenCalled();
    })

    it("should validate processEmailToSend NOT_EMAILS", async () => {

        const id = 'testData';
        const settlementEmail: SettlementEmail = {
            collaboratorBp: 'testData',
            emailStatus: SettlementEmailStatusEnum.PENDING_CREATE,
            settlementId: 'testData',
            _id: 'testData'
        }
        const date = new Date();
        const dataXlsx: OrderSettlementReportGeneral[] = [
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
        ];
        const userLineView: UserLineData = {
            copyEmail: [],
            name: 'testData',
            userEmail: 'testData@test'
        }
        const emailList: SettlementEmailType[] = []

        jest.spyOn(SendEmailByCollaboratorService.prototype, 'getDataToXlsxByCollaborator').mockResolvedValue(dataXlsx);
        jest.spyOn(helper, 'GenerateMultiviewXlsx').mockResolvedValue('testData');
        jest.spyOn(SettlementService.prototype, 'getUserLineData').mockResolvedValue(userLineView);
        jest.spyOn(SendEmailByCollaboratorService.prototype, 'getEmailToSendCollaborator').mockResolvedValue(emailList)
        jest.spyOn(TransversalService.prototype, 'sendEmail').mockResolvedValue(false);
        jest.spyOn(settlementEmailRepository, 'updateSettlementEmailById').mockResolvedValue({} as any)
        const jestMethod = jest.spyOn(settlementEmailRepository, 'getSettlementEmailById').mockResolvedValue(settlementEmail)

        const sendEmailDomain: ISendEmailByCollaboratorDomain = new SendEmailByCollaboratorDomain();
        await sendEmailDomain.processEmailToSend('testData');

        expect(jestMethod).toHaveBeenCalled();
    })

    it("should validate processEmailToSend ERROR_CREATE", async () => {

        const id = 'testData';
        const settlementEmail: SettlementEmail = {
            collaboratorBp: 'testData',
            emailStatus: SettlementEmailStatusEnum.PENDING_CREATE,
            settlementId: 'testData',
            _id: 'testData'
        }
        const date = new Date();
        const dataXlsx: OrderSettlementReportGeneral[] = [
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
        ];
        const userLineView: UserLineData = {
            copyEmail: [],
            name: 'testData',
            userEmail: 'testData@test'
        }
        const emailList: SettlementEmailType[] = []

        jest.spyOn(SendEmailByCollaboratorService.prototype, 'getDataToXlsxByCollaborator').mockResolvedValue(dataXlsx);
        jest.spyOn(helper, 'GenerateMultiviewXlsx').mockImplementation(() => {
            throw new AppError({message: 'testData'})
        });
        jest.spyOn(SettlementService.prototype, 'getUserLineData').mockResolvedValue(userLineView);
        jest.spyOn(SendEmailByCollaboratorService.prototype, 'getEmailToSendCollaborator').mockResolvedValue(emailList)
        jest.spyOn(TransversalService.prototype, 'sendEmail').mockResolvedValue(false);
        jest.spyOn(settlementEmailRepository, 'updateSettlementEmailById').mockResolvedValue({} as any)
        const jestMethod = jest.spyOn(settlementEmailRepository, 'getSettlementEmailById').mockResolvedValue(settlementEmail)

        const sendEmailDomain: ISendEmailByCollaboratorDomain = new SendEmailByCollaboratorDomain();
        await sendEmailDomain.processEmailToSend('testData');

        expect(jestMethod).toHaveBeenCalled();
    })
})