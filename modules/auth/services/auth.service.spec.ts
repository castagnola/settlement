import { describe, expect, it, jest } from '@jest/globals';
import { HttpCode, ResponseApi } from 'vanti-utils/lib'
//************* helpers *********************************//
import { Axios } from 'vanti-utils/lib'
//******************* mocks ******************************//
jest.mock('vanti-utils/lib');
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

//************* service *********************************//
import { AuthService } from './auth.service';

//******************** interface ************************//
import { IAuthService } from './auth.service.interface';
import { ActiveToken, ResponseDataAuthService } from '../types/auth.type';

describe('Should validate AuthService', () => {

    it("should validate validateToken method with azuread", async () => {
        jest.spyOn(Axios, 'get').mockResolvedValue({});
        const responseApi: ResponseApi<ActiveToken> = {
            status: HttpCode.OK,
            data: {active: true},
        }
        mockedAxios.get.mockResolvedValue({
            data: responseApi,
            status: 200,
            statusText: 'Ok',
            headers: {},
            config: {},
        });

        const authService: IAuthService = new AuthService();
        const response = await authService.validateToken("token", "azuread");

        expect(response).toEqual(true);
    });

    it("should validate validateToken method with keycloak try catch", async () => {
        jest.spyOn(Axios, 'get').mockRejectedValue({});
        mockedAxios.get.mockRejectedValue({});

        const authService: IAuthService = new AuthService();

        expect(await authService.validateToken("", "")).toBeFalsy();
    });
});