import { describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import app from "../../../config/app";
import { HttpCode, ResponseApi } from "vanti-utils/lib";
import { AuthService } from "../../auth/services/auth.service";
import { UploadResponse } from '../type/email.type';
import { EmailDomain } from '../domain';

const { PREFIX } = process.env

const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVzIjpbImluc3RhbGxlcl9zaWduYXR1cmUiXSwiZ3JvdXBzIjpbInRlc3QiXX0sImlhdCI6MTY5NDExNjk5M30.YMmvsKh-KhpJwU4jU4bYGeN3y7-LqthpHsbECZTznkk'

describe("should validate email controller", () => {

    beforeAll(() => {
        jest.spyOn(AuthService.prototype, 'validateToken').mockResolvedValue(true);
    })

    it("should validate upload", async () => {

        const uploadResponse: UploadResponse = {
            success: 1,
            totalData: 1,
            errorValid: false
        }

        const responseApi: ResponseApi<UploadResponse> = {
            data: uploadResponse,
            status: HttpCode.OK
        }

        jest.spyOn(EmailDomain.prototype, 'UploadEmails').mockResolvedValue(uploadResponse);

        const response = await request(app)
            .post(`${PREFIX}/api/email/upload`)
            .set('authorization', token)
            .attach('emails', 'tests/test.csv');

        expect(response.body).toEqual(responseApi)
    })

    it("should validate get file", async () => {

        const responseDomain: string = 'testDataBase64'

        const responseApi: ResponseApi<string> = {
            data: responseDomain,
            status: HttpCode.OK
        }

        jest.spyOn(EmailDomain.prototype, 'GetUploadFile').mockResolvedValue(responseDomain);

        const response = await request(app)
            .get(`${PREFIX}/api/email/upload/file`)
            .set('authorization', token);

        expect(response.body).toEqual(responseApi)
    })


    it("Debería obtener correos electrónicos con éxito", async () => {
        // Configuración
        const options = { limit: "10", page: "1" };
        const expectedResponse = [
            {
            id: "1",
            identification : 'asdasd',
            recipientName: "John Doe",
            email: "john.doe@example.com",
            active: true,
            mobileNumber: "123-456-7890",
            position: "Manager",
            collaboratorId: "COLL123",
            collaboratorIdentification: "ID123456789",
            name: "John Doe",
        }];
        jest.spyOn(EmailDomain.prototype, 'getEmails')
            .mockResolvedValue(expectedResponse);

        // Ejecución
        const response = await request(app)
            .get(PREFIX + "/api/email/list")
            .query(options)
            .set("Authorization", token);

        // Verificación
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 200, data: expectedResponse });
    });
})