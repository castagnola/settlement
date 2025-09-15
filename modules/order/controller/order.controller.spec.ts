import {describe, expect, it, jest} from '@jest/globals';

import {
    CaseValidate,
    Order,
    OrderClassEnum,
    OrderDuplicate,
    OrderNotCufeListResponse,
    OrdersPairedResponse,
    OrdersSettlementTotal,
    OrderStatusEnum,
    OrderTypeEnum,
    ResponseOrderOrphan,
    ResponseOrdersSociety,
    ValidateDuplicate
} from "../type/order.type";
import {OrderDomain} from "../domain";
import request from 'supertest';
import app from "../../../config/app";
import {HttpCode, ResponseApi} from "vanti-utils/lib";
import {AuthService} from "../../auth/services/auth.service";
import { GetOrdersOptions } from '../../../models/order';

const { PREFIX } = process.env

const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVzIjpbImluc3RhbGxlcl9zaWduYXR1cmUiXSwiZ3JvdXBzIjpbInRlc3QiXX0sImlhdCI6MTY5NDExNjk5M30.YMmvsKh-KhpJwU4jU4bYGeN3y7-LqthpHsbECZTznkk'

describe('validate order controller', () => {
    beforeAll(() => {
        jest.spyOn(AuthService.prototype, 'validateToken').mockResolvedValue(true);
    });

    it('should validate return searched orders ', async () => {
        const orders: OrdersPairedResponse = {
            rows: [{
                "id": "105-87",
                "typeBusiness": OrderTypeEnum.VANTI_LISTO,
                "collaboratorId": "1000403382",
                "collaboratorName": "SOELCO S.A.S. SOGAMOSO",
                "society": "24",
                "societyName": "GAS NATURAL CUNDIBOYACENSE S.A. ESP",
                "contractAccount": "60482213",
                "salesOrderTypeCustomer": OrderClassEnum.ZFM4,
                "salesOrderCustomer": "205082262",
                "value": "1412366.00",
                "campaingId": "723",
                "rediscountPercentage": "0",
                "rediscountValue": "-42371.00",
                "rebateTotal": "-50421.00",
                "vatCommission": "-8050.00",
                "salesCollaboratorTypeDocument": OrderClassEnum.ZP12,
                "orderIdRediscount": "205082339",
                "invoiceId": "2007200515",
                "accountingDocument": "8000011039",
                "invoicedDate": "2021-10-25",
                "cufe": false,
                "oportunityId": "116P170V141",
                "settlementId": "01-00000005-19.11.2021",
                "settlementDate": 'null',
                "datalakeDate": new Date("2021-11-19").toString(),
                "createdOrderDate": new Date("2024-09-20 12:22:59.531788").toString()
            }],
            dateRequest: new Date().toString(),
            count: 1,
            state:OrderStatusEnum.UNBILLED
        }
        const buffer = Buffer.from('testData');

        jest.spyOn(OrderDomain.prototype, 'getFilterOrders').mockResolvedValue(orders);
        let responseData: ResponseApi<OrdersPairedResponse> = {
            status: HttpCode.OK,
            data: orders
        }

        const response = await request(app)
            .post(`${PREFIX}/api/vantilisto/orders`)
            .set('Authorization', token)
            .attach('filter', buffer, 'testFile.txt')
            .query({ limit: 10, page: 1}); 

        expect(response.body).toEqual(responseData)
    });

    it('should validate return searched orders ', async () => {
        const orders: OrdersPairedResponse = {
            rows: [{
                "id": "105-87",
                "typeBusiness": OrderTypeEnum.VANTI_LISTO,
                "collaboratorId": "1000403382",
                "collaboratorName": "SOELCO S.A.S. SOGAMOSO",
                "society": "24",
                "societyName": "GAS NATURAL CUNDIBOYACENSE S.A. ESP",
                "contractAccount": "60482213",
                "salesOrderTypeCustomer": OrderClassEnum.ZFM4,
                "salesOrderCustomer": "205082262",
                "value": "1412366.00",
                "campaingId": "723",
                "rediscountPercentage": "0",
                "rediscountValue": "-42371.00",
                "rebateTotal": "-50421.00",
                "vatCommission": "-8050.00",
                "salesCollaboratorTypeDocument": OrderClassEnum.ZP12,
                "orderIdRediscount": "205082339",
                "invoiceId": "2007200515",
                "accountingDocument": "8000011039",
                "invoicedDate": "2021-10-25",
                "cufe": false,
                "oportunityId": "116P170V141",
                "settlementId": "01-00000005-19.11.2021",
                "settlementDate": 'null',
                "datalakeDate": new Date("2021-11-19").toString(),
                "createdOrderDate": new Date("2024-09-20 12:22:59.531788").toString()
            }],
            dateRequest: new Date().toString(),
            count: 1,
            state:OrderStatusEnum.UNBILLED
        }

        jest.spyOn(OrderDomain.prototype, 'getFilterOrdersSettlementId').mockResolvedValue(orders);
        let responseData: ResponseApi<OrdersPairedResponse> = {
            status: HttpCode.OK,
            data: orders
        }

        const response = await request(app)
            .get(`${PREFIX}/api/vantilisto/orders`)
            .set('Authorization', token)
            .query({ limit: 10, page: 1}); 

        expect(response.body).toEqual(responseData)
    });

    it('should validate return base64 for download orders ', async () => {

        const buffer = Buffer.from('testData');

        jest.spyOn(OrderDomain.prototype, 'getOrdersDownload').mockResolvedValue('base64');
        let responseData: ResponseApi<string> = {
            status: HttpCode.OK,
            data: 'SUCCESS'
        }

        const response = await request(app)
            .post(`${PREFIX}/api/vantilisto/download-orders`)
            .attach('filter', buffer, 'testFile.txt')
            .set('Authorization', token);
        expect(response.status).toBe(HttpCode.OK)
    });

    it('should validate return orphan orders ', async () => {
        const responseOrphan = {
            rows: [],
            count: 0
        }

        jest.spyOn(OrderDomain.prototype, 'getOrdersOrphan').mockResolvedValue(responseOrphan);
        let responseData: ResponseApi<ResponseOrderOrphan> = {
            status: HttpCode.OK,
            data: responseOrphan
        }

        const response = await request(app)
            .get(`${PREFIX}/api/vantilisto/orphan-orders`)
            .set('Authorization', token)
            .query({ limit: 10, page: 1});

        expect(response.body).toEqual(responseData)
    });

    it("should validate getOrdersDuplicate", async ()=> {
        const responseDomain: OrderDuplicate = {
            count: 1,
            rows: [
                {
                    oportunityId: "testData",
                    documentClass: "testData",
                    documentNumber: "testData",
                    collaboratorIdentification: "testData",
                    clientIdentification: "testData",
                    societyCode: "testData",
                    contractAccount: "testData",
                    amount: "testData",
                    totalAmount: "testData",
                    vat: "testData",
                    rediscount: "testData",
                    collaboratorName: "testData",
                    id: "testData"
                }
            ]
        }

        jest.spyOn(OrderDomain.prototype, 'getOrderDuplicate').mockResolvedValue(responseDomain);
        let responseData: ResponseApi<OrderDuplicate> = {
            status: HttpCode.OK,
            data: responseDomain
        }

        const response = await request(app)
            .get(`${PREFIX}/api/vantilisto/orders-duplicate`)
            .set('Authorization', token)
            .query({ limit: 10, page: 1});

        expect(response.body).toEqual(responseData)
    })

    it('should validate orders duplicate', async () => {

        const oportunityId = '123'
        const responseValidate: ValidateDuplicate = {
            allValid: true,
            details: [
                {
                    valid: true,
                    message: CaseValidate.SUCCESS,
                    oportunityId: oportunityId
                },
                {
                    valid: true,
                    message: CaseValidate.SUCCESS,
                    oportunityId: oportunityId
                }
            ]
        }

        jest.spyOn(OrderDomain.prototype, 'validateOrdersDuplicate').mockResolvedValue(responseValidate);
        let responseData: ResponseApi<any> = {
            status: HttpCode.OK,
            data: responseValidate
        }

        const response = await request(app)
            .get(`${PREFIX}/api/vantilisto/validate-orders-duplicate`)
            .set('Authorization', token)
            .query({ duplicate: '12,32', oportunityId: '123'});


        expect(response.status).toBe(HttpCode.OK)
        expect(response.body).toEqual(responseData)
    });

    it('should validate return orders society', async () => {
        const settlementId = '123'
        const responseDomain: ResponseOrdersSociety = {
            rows: [{
                allied: "testData",
                allied_name: "testData",
                allied_sum: 1000,
                customer_sum: -1000,
                total: 0
            }  ],
            count: 1,
            total: {
                totalClient: 0,
                totalFirm: 0,
                totalOrders: 0,
                totalValue: 0,
            } 
        }

        jest.spyOn(OrderDomain.prototype, 'getOrdersSociety').mockResolvedValue(responseDomain);
        let responseData: ResponseApi<ResponseOrdersSociety> = {
            status: HttpCode.OK,
            data: responseDomain
        }

        const response = await request(app)
            .get(`${PREFIX}/api/vantilisto/orders-society/${settlementId}`)
            .set('Authorization', token)
            .query({ limit: 10, page: 1, society: 'testData'});

        expect(response.body).toEqual(responseData)
    })

    it('should validate download-orders-settlement/:settlementId', async () => {
        const settlementId = '123'
        const responseDomain: string = 'SUCCESS'

        jest.spyOn(OrderDomain.prototype, 'downloadOrdersSettlementBase64').mockResolvedValue(responseDomain);
        let responseData: ResponseApi<string> = {
            status: HttpCode.OK,
            data: responseDomain
        }

        const response = await request(app)
            .get(`${PREFIX}/api/vantilisto/download-orders-settlement/${settlementId}`)

        expect(response.body).toEqual(responseData)
    })

    it("should validate /orders-not-cufe", async () => {
        const options: GetOrdersOptions = {
            field: 'testData',
            orderField: 'testData',
            limit: 10,
            page: 1,
            settlementId: 'testData'
        }
        const returnService: OrderNotCufeListResponse = {
            count: 1,
            rows: [
              {
                typeBusiness: OrderTypeEnum.VANTI_LISTO,
                id: 'testData',
                collaboratorId: 'testData',
                collaboratorName: 'testData',
                society: 'testData',
                contractAccount: 'testData',
                salesOrderTypeCustomer: 'ZP12',
                salesOrderCustomer: 'testData',
                value: 0,
                campaingId: 'testData',
                rediscountPercentage: 0,
                rediscountValue: 0,
                rebateTotal: 0,
                vatCommission: 0,
                salesCollaboratorTypeDocument: 'ZFM6',
                orderIdRediscount: 'testData',
                invoiceId: 'testData',
                accountingDocument: 'testData',
                oportunityId: 'testData',
                settlementId: 'testData',
                settlementDate: 'testData',
                datalakeDate: 'testData',
                createdOrderDate: 'testData',
                cufe: false
              }
            ],
            total: {
              totalClient: 1,
              totalFirm: 1,
              totalOrders: 1,
              totalValue: 1
            }
        }

        const responseApi: ResponseApi<OrderNotCufeListResponse> = {
            data: returnService,
            status: HttpCode.OK
        }

        jest.spyOn(OrderDomain.prototype, 'getOrderNotCufe').mockResolvedValue(returnService)

        const response = await request(app)
        .get(`${PREFIX}/api/vantilisto/orders-not-cufe`)
        .set('Authorization', token)
        .query(options);

        expect(response.body).toEqual(responseApi)
    })

    it("should validate /orders-totals", async () => {

        const buffer = Buffer.from('testData');
        const expectResponse: OrdersSettlementTotal = {
            couples: "testData",
            excluded: "testData",
            selected: "testData",
            totalClient: "testData",
            totalFirm: "testData",
            totalValue: "testData"
        }
        const expectResponseApi: ResponseApi<OrdersSettlementTotal> = {
            data: expectResponse,
            status: HttpCode.OK
        }

        jest.spyOn(OrderDomain.prototype, 'getOrdersTotals').mockResolvedValue(expectResponse)

        const response = await request(app)
            .post(`${PREFIX}/api/vantilisto/orders-totals`)
            .set('Authorization', token)
            .attach('filter', buffer, 'testFile.txt');

        expect(response.body).toEqual(expectResponseApi)
    })
});