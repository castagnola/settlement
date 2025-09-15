import { describe, expect, it, jest, beforeAll } from '@jest/globals';
import { GetEmailViewOptions, UploadEmail, UploadResponse } from '../type/email.type';
import { IEmailService } from './email.service.interface';
import { EmailService } from './email.service';
import { Axios, HttpCode, ResponseApi } from 'vanti-utils/lib';

// Mocking Axios and AppError
jest.mock('vanti-utils/lib', () => ({
    Axios: {
        get: jest.fn(),
        post: jest.fn(), // Asegúrate de mockear también el método post
    },
    AppError: jest.fn().mockImplementation((error: unknown) => {
        const e = error as { message: string };
        const appError = new Error(e.message);
        appError.name = 'AppError';
        return appError;
    }),
}));

const mockedAxios = Axios as jest.Mocked<typeof Axios>;

beforeAll(() => {
    process.env.URI_SETTLEMENT_CORE = 'http://localhost:2000/test/api'; // Asegúrate de que esta variable esté definida
});

describe("should validate email service", () => {
    it("should validate sendUploadEmail", async () => {
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
        ];

        const uploadResponse: UploadResponse = {
            success: 1,
            totalData: 1,
            errorValid: false,
        };

        const responseApi: ResponseApi<UploadResponse> = {
            data: uploadResponse,
            status: 200,
        };

        mockedAxios.post.mockResolvedValue({ data: { data: responseApi } });

        const emailService: IEmailService = new EmailService();
        const response = await emailService.sendUploadEmail(uploadData);

        expect(response).toEqual(responseApi);
    });

    it('should return emails from getEmails', async () => {
        const options: GetEmailViewOptions = {
            page: 1,
            limit: 10,
            fieldOrder: 'creationDate',
            orderType: 'desc',
        };

        const mockResponse = {
            data: {
                data: [
                    {
                        id: '1',
                        identification: "aa",
                        recipientName: 'John Doe',
                        email: 'john.doe@example.com',
                        active: true,
                        mobileNumber: '123-456-7890',
                        position: 'Manager',
                        collaboratorId: 'COLL123',
                        collaboratorIdentification: 'ID123456789',
                        name: 'John Doe',
                    },
                ],
            },
        };

        (mockedAxios.get as jest.Mock).mockResolvedValue(mockResponse as never);

        const emailService = new EmailService();
        const response = await emailService.getEmails(options);

        expect(response).toEqual(mockResponse.data.data);
        expect(response.length).toBe(1);
    });

    it('should throw an error if Axios fails', async () => {
        const options: GetEmailViewOptions = {
            page: 1,
            limit: 10,
            fieldOrder: 'active',
            orderType: 'desc',
        };

        // Simular un error con un mensaje específico
        const mockError = new Error('Error getting emails');
        (mockedAxios.get as jest.Mock).mockRejectedValue(mockError as never);

        const emailService = new EmailService();

        // Verifica que se lance el error correcto
        await expect(emailService.getEmails(options)).rejects.toThrow('Error getting emails');
    });
});
