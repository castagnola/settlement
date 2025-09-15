import { describe, it, jest, expect } from '@jest/globals';
import request from "supertest";
import { ListData } from '../type/catalogs.type';
import { CatalogsDomain } from '../domain/catalogs.domain';

import app from '../../../config/app';

import { HttpCode, ResponseApi } from 'vanti-utils/lib';
import {AuthService} from "../../auth/services/auth.service";

const { PREFIX }: any = process.env;

const token = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVzIjpbImluc3RhbGxlcl9zaWduYXR1cmUiXSwiZ3JvdXBzIjpbInJvbCJdfSwiaWF0IjoxNjk0MTE1NzMxfQ.0-JqL4ygjdARIHskEpp2OHGPeJ1cAtPC1T4iwO5NOBY`
describe('Should validate catalogs controller', () => {

    beforeAll(() => {
        jest.spyOn(AuthService.prototype, 'validateToken').mockResolvedValue(true);
    });

    it('validacion de consulta de datos /api/catalogs/', async () => {
        let dataReturn: ListData[] = [
            {
                name: 'testData',
                code: 'testData',
            },
        ];

        jest.spyOn(CatalogsDomain.prototype, 'getCatalogList').mockResolvedValue(dataReturn);

        const responseApi: ResponseApi<ListData[]> = {
            status: HttpCode.OK,
            data: dataReturn,
        };

        const res = await request(app)
            .get(PREFIX + '/api/catalogs/list')
            .query({ catalog: 'document' })
            .set('Authorization', token);
        expect(res.statusCode).toBe(HttpCode.OK);
        expect(res.body).toEqual(responseApi);
    });

    it('validacion de consulta de datos /api/catalogs/optionsMneu', async () => {
        let dataReturn: ListData[] = [
            {
                name: 'testData',
                code: 'testData',
            },
        ];

        jest.spyOn(CatalogsDomain.prototype, 'OptionsMenu').mockResolvedValue(dataReturn);

        const responseApi: ResponseApi<ListData[]> = {
            status: HttpCode.OK,
            data: dataReturn,
        };

        const res = await request(app)
            .get(PREFIX + '/api/catalogs/options-menu')
            .query({
                catalog: 'document',
            }).set('Authorization', token);
        expect(res.statusCode).toBe(HttpCode.OK);
        expect(res.body).toEqual(responseApi);
    });

});
