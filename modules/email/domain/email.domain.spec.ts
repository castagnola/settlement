import {describe, expect, it, jest} from '@jest/globals';
import { UploadEmail, UploadResponse } from '../type/email.type'
import { EmailDomain, IEmailDomain } from './index'
import { EmailService } from '../service';
import { BucketService } from '../../../helpers/bucket/bucket.service';
import { promises as fs } from 'fs';
import { AppError } from 'vanti-utils/lib';
import * as path from 'path';

describe("should validate domain", () => {

    it("should validate GetUploadFile", async () => {

        const returnData = Buffer.from('testData');
        jest.spyOn(BucketService.prototype, 'getFile').mockResolvedValue(returnData)
        
        const emailDomain: IEmailDomain = new EmailDomain();
        const response = await emailDomain.GetUploadFile();

        expect(response).toEqual(returnData.toString('base64'))
    })

    it("should validate UploadEmails", async () => {
        const buffer = new Buffer('testData');
        const uploadResponse: UploadResponse = {
            success: 1,
            totalData: 1,
            errorValid: false
        }
        const uploadData: UploadEmail[] = [
            {
                active: true,
                alliedName: 'testData',
                bp: 'testData',
                email: 'testData',
                identification: 'testData',
                mobileNumber: 'testData',
                nit: 'testData',
                position: 'testData',
                recipitentName: 'testData',
            }
        ]

        const emailDomain: IEmailDomain = new EmailDomain();
        Object.defineProperty(emailDomain, '_GetEmailDataCSV', {
            value: jest.fn().mockReturnValue(uploadData)
        })
        jest.spyOn(EmailService.prototype, 'sendUploadEmail').mockResolvedValue(uploadResponse);

        const response = await emailDomain.UploadEmails(buffer);

        expect(response).toEqual(uploadResponse)
    })

    it("should validate createErrorExcel", async () => {

        const bufferTest = Buffer.from("testData");

        jest.mock('exceljs', () => {
            const workbookMock = {
                addWorksheet: jest.fn(),
                xlsx: {
                    writeBuffer: jest.fn().mockReturnValue(bufferTest),
                },
            };
        
            return {
                Workbook: jest.fn(() => workbookMock),
            };
        });

        const uploadResponse: UploadResponse = {
            success: 0,
            totalData: 1,
            errorValid: false,
            error: [
                {
                    bp: "123",
                    nit: "456",
                    alliedName: "Allied Name",
                    active: true,
                    email: "test@example.com",
                    recipitentName: "Recipient Name",
                    identification: "789",
                    position: "Position",
                    mobileNumber: "123456789",
                    error: "Error Message",
                },
            ],
        };

        const expectResponse = {
            success: 0,
            totalData: 1,
            errorValid: true,
            base64: Buffer.from(bufferTest).toString('base64')
        }

        const emailDomain: IEmailDomain = new EmailDomain();
        const createErrorExcelMethod = Reflect.get(emailDomain, '_createErrorExcel') as Function;
        const response = await createErrorExcelMethod.call(emailDomain, uploadResponse);

        expect(response.errorValid).toEqual(expectResponse.errorValid)
    })

    it("should validate createErrorExcel whitout error", async () => {

        const bufferTest = Buffer.from("testData");

        jest.mock('exceljs', () => {
            const workbookMock = {
                addWorksheet: jest.fn(),
                xlsx: {
                    writeBuffer: jest.fn().mockReturnValue(bufferTest),
                },
            };
        
            return {
                Workbook: jest.fn(() => workbookMock),
            };
        });

        const uploadResponse: UploadResponse = {
            success: 1,
            totalData: 1,
            error: [],
        };

        const expectResponse = {
            success: 1,
            totalData: 1,
            errorValid: false,
        }

        const emailDomain: IEmailDomain = new EmailDomain();
        const createErrorExcelMethod = Reflect.get(emailDomain, '_createErrorExcel') as Function;
        const response = await createErrorExcelMethod.call(emailDomain, uploadResponse);

        expect(response.errorValid).toEqual(expectResponse.errorValid)
    })

    it("should validate _GetEmailDataCSV", async () => {
        const filePath = path.join(__dirname, '../../../../tests/test.csv');
        const file = await fs.readFile(filePath);

        const uploadEmails: UploadEmail[] = [
            {
                active: true,
                alliedName: 'testData',
                bp: 'testData',
                email: 'testData',
                identification: 'testData',
                mobileNumber: 'testData',
                nit: 'testData',
                position: 'testData',
                recipitentName: 'testData',
            },
            {
                active: true,
                alliedName: 'testData',
                bp: 'testData',
                email: 'testData',
                identification: 'testData',
                mobileNumber: 'testData',
                nit: 'testData',
                position: 'testData',
                recipitentName: 'testData',
            }
        ]
        
        const emailDomain: IEmailDomain = new EmailDomain();
        const GetEmailDataCSVMethod = Reflect.get(emailDomain, '_GetEmailDataCSV') as Function;
        const response = await GetEmailDataCSVMethod.call(emailDomain, file);

        expect(response).toEqual(uploadEmails)
    })

    it("should validate _GetEmailDataCSV not headers", async () => {
        const filePath = path.join(__dirname, '../../../../tests/testheader.csv');
        const file = await fs.readFile(filePath);

        const emailDomain: IEmailDomain = new EmailDomain();
        const GetEmailDataCSVMethod = Reflect.get(emailDomain, '_GetEmailDataCSV') as Function;

        await expect(GetEmailDataCSVMethod.call(emailDomain, file)).rejects.toThrow(
            new AppError({message: 'Encabezados inválidos'})
        )
    })

    it("should validate createErrorExcel nullData", async () => {

        const bufferTest = Buffer.from("testData");

        jest.mock('exceljs', () => {
            const workbookMock = {
                addWorksheet: jest.fn(),
                xlsx: {
                    writeBuffer: jest.fn().mockReturnValue(bufferTest),
                },
            };
        
            return {
                Workbook: jest.fn(() => workbookMock),
            };
        });

        const uploadResponse = null;

        const expectResponse = {
            success: 0,
            totalData: 0,
            errorValid: true,
            base64: Buffer.from(bufferTest).toString('base64')
        }

        const emailDomain: IEmailDomain = new EmailDomain();
        const createErrorExcelMethod = Reflect.get(emailDomain, '_createErrorExcel') as Function;
        const response = await createErrorExcelMethod.call(emailDomain, uploadResponse, true);

        expect(response.errorValid).toEqual(expectResponse.errorValid)
    })
})