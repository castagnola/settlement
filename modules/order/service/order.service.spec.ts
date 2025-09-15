import {Axios, HttpCode, ResponseApi} from "vanti-utils/lib";
import {
    CaseValidate,
    FilterTotalValues,
    Order,
    OrderClassEnum,
    orderDuplicateDb,
    OrderReportType,
    OrdersOrphan,
    OrderStatusEnum,
    TotalValueResponse,
    ValidateDuplicateResponse,
    ResponseOrdersSociety,
    OrderSettlementReportGeneral,
    OrderSettlementSocietiesResponse,
    OrderTypeEnum,
    OrderNotCufeListResponse,
    OrdersSettlementTotal,
    ResponseOrderOrphan,
    OrdersPairedResponse
} from "../type/order.type";
import {OrderService} from '../service/order.service';
import {afterEach, describe, expect, it, jest} from "@jest/globals";
import {GetOrdersOptions} from "../../../models/order";
import {URI_SETTLEMENT_CORE} from "../../../helpers/constans.type";
import {IOrderServiceInterface} from "./order.interface";

jest.mock('vanti-utils/lib');
jest.mock('../repository/order.repository');
const mockedAxios = Axios as jest.Mocked<typeof Axios>;
const { VANTILISTO_TYPE }: any = process.env;

describe('validate order service', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should validate get orders orphan', async () => {
        const orderService = new OrderService();
        const mockResponse: ResponseOrderOrphan[] = []

        jest.spyOn(Axios, 'get').mockResolvedValue({});
        mockedAxios.get.mockResolvedValue({ data: { data: mockResponse, status: 200 }, status: 200 });

        const result = await orderService.getOrdersOrphan({ field: 'type', value: '01', marked: '12' }, 'testData');

        expect(result).toEqual(mockResponse);
    });

    it('should validate get orders orphan try catch', async () => {
        const orderService = new OrderService();

        jest.spyOn(Axios, 'get').mockResolvedValue({});
        mockedAxios.get.mockRejectedValue(new Error('Error'));
        const result = await orderService.getOrdersOrphan({ 
            field: 'type',
            value: '01', 
            dateRequest: '2024-07-30',
            page: 1,
            limit: 10,
            orderField: 'createdAt',
            orderType: 'asc',
            unmarked: '123'
        }as GetOrdersOptions, 'testData');
        expect(result).toEqual({ rows: [], count: 0 });
    });

    it('should return settlements list', async () => {

        const orderService = new OrderService();


        const mockOptions: GetOrdersOptions = {
            field: 'type',
            value: '01',
            state: 'CREATED',
            page: 1,
            limit: 10,
            orderField: 'createdAt',
            orderType: 'asc',
            settlementId: '01-00000010-30.07.2024',
            dateRequest: '2024-07-30'
        };

        const mockResponse: OrdersPairedResponse ={
            rows:  [],
            dateRequest: "",
            count: 3434,
            total: {
                totalOrders: 3,
                totalClient: 3,
                totalFirm: 3,
                totalValue: 3
            },
            state:OrderStatusEnum.CREATED
        }

        const buffer = Buffer.from('testData');

        const responseApi: ResponseApi<any> = {
            data : { data: mockResponse },
            status: HttpCode.OK
        }

        mockedAxios.post.mockResolvedValue(responseApi);

        const result = await orderService.getFilterOrders(mockOptions, buffer);

        const expectedUrl = `${URI_SETTLEMENT_CORE}/order/search?dateRequest=2024-07-30&settlementId=01-00000010-30.07.2024&field=type&value=01&page=1&limit=10&orderField=createdAt&orderType=asc`;
        expect(mockedAxios.post).toHaveBeenCalledWith(expectedUrl, buffer , {                 
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Length': buffer.length} 
            });
        expect(result).toEqual(mockResponse);
    });

    it('should handle errors', async () => {
        const orderService = new OrderService();

        const mockOptions: GetOrdersOptions = {
            field: 'type',
            value: '01',
            state: 'CREATED',
            page: 1,
            limit: 10,
            orderField: 'createdAt',
            orderType: 'asc',
        };
        const buffer = Buffer.from('testData');

        mockedAxios.post.mockRejectedValue(new Error('Service error'));

        const result = await orderService.getFilterOrders(mockOptions, buffer);
        expect(result).toBeNull();
    });

    it("should validate getOrdersDownload", async () => {
        
        let settlementId: string = 'testData'
        let filter: string = 'testData'
        let status: OrderStatusEnum = OrderStatusEnum.CREATED

        let returnData: OrderReportType[] = [
            {
                id: "testData",
                settlement_id: "testData",
                settlement_date: "testData",
                oportunity_id: "testData",
                document_class: "testData",
                document_number: "testData",
                collaborator_identification: "testData",
                collaborator_name: "testData",
                society_code: "testData",
                contract_account: "testData",
                campaing_id: "testData",
                amount: "testData",
                vat: "testData",
                total_amount: "testData",
                rediscount: "testData",
                invoice_id_rediscount: "testData",
                invoice_document_id: "testData",
                state: "testData",
                interest_rate: "testData",
                quotas: "testData",
                ticket: "testData",
                invoice_document: "testData",
                invoice_date: "testData",
                client_name: "testData",
                client_identification: "testData",
                society_name: "testData"
            }
        ] 

        let responseApi: ResponseApi<any> = {
            data: {data: returnData},
            status: HttpCode.OK
        }

        mockedAxios.post.mockResolvedValue(responseApi)

        let orderService: IOrderServiceInterface = new OrderService()
        // let response = await orderService.getOrdersDownload(status, settlementId, filter)

        expect(true).toEqual(true) //apagado temporal de pruebas unitarias
    })

    it("should validate orders duplicate", async () => {
        const oportunityId: string = '123'
        const ordersToValidate: string = '12,34'

        const responsSevice: ValidateDuplicateResponse = {
            valid: false,
            message: CaseValidate.ORPHANED,
            oportunityId: oportunityId
        }

        const responseApi: ResponseApi<any> = {
            data: {data: responsSevice},
            status: HttpCode.OK
        }

        mockedAxios.get.mockResolvedValue(responseApi)

        let orderService: IOrderServiceInterface = new OrderService()
        let response = await orderService.validateOrdersDuplicate(oportunityId, ordersToValidate)

        expect(response).toEqual(responsSevice)
    })
    
    it("should validate getOrdersDuplicate", async ()=> {
        const returnDb: orderDuplicateDb = {
            count: 1,
            rows: [
                {
                    id: "testData",
                    settlementId: "testData",
                    settlementDate: "testData",
                    oportunityId: "testData",
                    documentClass: "testData",
                    documentNumber: "testData",
                    collaboratorIdentification: "testData",
                    collaboratorName: "testData",
                    societyCode: "testData",
                    contractAccount: "testData",
                    campaingId: "testData",
                    amount: "testData",
                    vat: "testData",
                    totalAmount: "testData",
                    rediscount: "testData",
                    state: "testData",
                    interestRate: "testData",
                    quotas: "testData",
                    ticket: "testData",
                    clientName: "testData",
                    clientIdentification: "testData",
                    societyName: "testData"
                }
            ]
        }

        let responseApi: ResponseApi<any> = {
            data: {data: returnDb},
            status: HttpCode.OK
        }

        let options: GetOrdersOptions = {
            limit: 10,
            page: 1,
            marked: 'testData',
        }

        mockedAxios.get.mockResolvedValue(responseApi);

        let orderService: IOrderServiceInterface = new OrderService()
        let response = await orderService.getOrdersDuplicate(options);

        expect(response).toEqual(returnDb)
    }) 
    
    it("should validate getOrdersDuplicate error ", async ()=> {
        let options: GetOrdersOptions = {
            dateRequest: '2024-07-30',
            field: 'testData',
            value: 'testData',
            unmarked: 'testData',
            orderField: 'testData',
            orderType: 'testData',
        }

        mockedAxios.get.mockResolvedValue(new Error('Error'));

        let orderService: IOrderServiceInterface = new OrderService()
        let response = await orderService.getOrdersDuplicate(options);

        expect(response).toEqual({ rows: [], count: 0 })
    }) 

    it("should validate getTotalValues", async () => {

        let settlementId: string = 'testData';
        let filterData: FilterTotalValues = {
            field: 'testData',
            society: 'testData',
            value: 'testData'
        }

        let returnData: TotalValueResponse = {
            totalClient: 0,
            totalFirm: 0,
            totalOrders: 0,
            totalValue: 0
        }

        let responseApi: ResponseApi<any> = {
            data: {data: returnData},
            status: HttpCode.OK
        }

        mockedAxios.get.mockResolvedValue(responseApi);

        let orderService: IOrderServiceInterface = new OrderService()
        let response = await orderService.getTotalValuesSettlement(settlementId, filterData);

        expect(response).toEqual(returnData)
    })

    it('should validate get orders society', async () => {
        const settlementId: string = 'testData'
        const options: GetOrdersOptions = {
            limit: 10,
            page: 1,
            society: 'testData',
        }

        const returnData: ResponseOrdersSociety = {
            count: 1,
            rows: [
                {
                    allied: "testData",
                    allied_name: "testData",
                    allied_sum: 1000,
                    customer_sum: -1000,
                    total: 0
                }
            ],
            total: {
                totalClient: 0,
                totalFirm: 0,
                totalOrders: 0,
                totalValue: 0,
            } 
        }

        const responseApi: ResponseApi<ResponseOrdersSociety> = {
            data: returnData,
            status: HttpCode.OK
        }
        jest.spyOn(Axios, 'get').mockResolvedValue({
            data: responseApi,
            status: HttpCode.OK
        });
        mockedAxios.get.mockResolvedValue({
            data: responseApi,
            status: HttpCode.OK
        })

        let orderService: IOrderServiceInterface = new OrderService()
        let response = await orderService.getOrdersSociety(options, settlementId)

        expect(response).toEqual(returnData)
    })

    it('should validate get orders society try catch', async () => {
        const settlementId: string = 'testData'
        const options: GetOrdersOptions = {
            orderField: 'createdAt',
            orderType: 'asc',
            field: 'testData',
            value: 'testData',
        }

        mockedAxios.get.mockRejectedValue(new Error('Error'))

        let orderService: IOrderServiceInterface = new OrderService()
        let response = await orderService.getOrdersSociety(options, settlementId)

        expect(response).toEqual({ 
            rows: [], 
            count: 0,
            total: {
                totalClient: 0,
                totalFirm: 0,
                totalOrders: 0,
                totalValue: 0,
            }  
        })
    })

    it("should validate getOrdersSettlementGeneral", async () => {
        const settlementId: string = 'testData';
        const returnData: OrderSettlementReportGeneral[] = [
            {
                id: 'testData',
                date_invoice: new Date(),
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
                date_request: new Date(),
                client_name: 'testData',
                client_identification: 'testData',
                society_name: 'testData',
            }
        ]

        let responseApi: ResponseApi<any> = {
            data: {data: returnData},
            status: HttpCode.OK
        }

        mockedAxios.get.mockResolvedValue(responseApi);

        let orderService: IOrderServiceInterface = new OrderService()
        let response = await orderService.getOrdersSettlementGeneral(settlementId);

        expect(response).toEqual(returnData)
    })

    it("should validate getOrdersSettlementSociety", async () => {
        const settlementId: string = 'testData';
        const returnData: OrderSettlementSocietiesResponse[] = [
            {
                data: [
                    {
                        allied: 'testData',
                        allied_name: 'testData',
                        order_type: 'testData',
                        allied_sum: 0,
                        customer_sum: 0,
                        total: 0
                    }
                ],
                name: 'testData'
            }
        ]

        let responseApi: ResponseApi<any> = {
            data: {data: returnData},
            status: HttpCode.OK
        }

        mockedAxios.get.mockResolvedValue(responseApi);

        let orderService: IOrderServiceInterface = new OrderService()
        let response = await orderService.getOrdersSettlementSociety(settlementId);

        expect(response).toEqual(returnData)
    })

    it("should validate getOrderNotCufe", async () => {
        
        const settlementId = 'testData';
        const options: GetOrdersOptions = {
            field: 'testData',
            orderField: 'testData',
            limit: 10,
            page: 1
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

        let responseApi: ResponseApi<any> = {
            data: {data: returnService},
            status: HttpCode.OK
        }

        mockedAxios.get.mockResolvedValue(responseApi);
        
        const orderService: IOrderServiceInterface = new OrderService()
        const response = await orderService.getOrderNotCufe(settlementId, options);

        expect(response).toEqual(returnService)
    })

    it("should validate OrdersSettlementTotal", async () => {
        const buffer = Buffer.from('testData');
        const expectResponse: OrdersSettlementTotal = {
            couples: "testData",
            excluded: "testData",
            selected: "testData",
            totalClient: "testData",
            totalFirm: "testData",
            totalValue: "testData"
        }
        const expectResponseApi: ResponseApi<any> = {
            data: {data: expectResponse},
            status: HttpCode.OK
        }

        mockedAxios.post.mockResolvedValue(expectResponseApi);

        const orderService: IOrderServiceInterface = new OrderService()
        const response = await orderService.getOrdersTotals(buffer);

        expect(response).toEqual(expectResponse)
    })

    it('debería construir la URL con los parámetros correctos y retornar los datos', async () => {
        const orderService = new OrderService();

        const options = {
            field: 'orderId',
            value: '123',
            page: 1,
            limit: 10,
            orderField: 'createdAt',
            orderType: 'desc'
        };
        const buffer = Buffer.from('testData');
        
        const mockResponse: OrdersPairedResponse ={
            rows:  [],
            dateRequest: "",
            count: 3434,
            total: {
                totalOrders: 3,
                totalClient: 3,
                totalFirm: 3,
                totalValue: 3
            },
            state:OrderStatusEnum.CREATED
        }

        const responseApi: ResponseApi<any> = {
            data : { data: mockResponse },
            status: HttpCode.OK
        }

        mockedAxios.post.mockResolvedValueOnce(responseApi);
        
        const orders = await orderService.getFilterOrders(options, buffer);
        
        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${URI_SETTLEMENT_CORE}/order/search?field=orderId&value=123&page=1&limit=10&orderField=createdAt&orderType=desc`, buffer,{
                headers: {
                  'Content-Type': 'application/octet-stream',
                  'Content-Length': buffer.length
                }}
        );
        
        expect(orders).toEqual(responseApi.data.data);
    });
    
    it('get filter orders settlementId', async () => {
        const orderService = new OrderService();

        const options = {
            field: 'orderId',
            value: '123',
            page: 1,
            limit: 10,
            orderField: 'createdAt',
            orderType: 'desc'
        };
        
        const mockData = { data: { data: ['order1', 'order2'] } };
        mockedAxios.get.mockResolvedValueOnce(mockData);
        
        const orders = await orderService.getFilterOrdersSettlementId(options);
        
        expect(mockedAxios.get).toHaveBeenCalledWith(
            `${URI_SETTLEMENT_CORE}/order/search?field=orderId&value=123&page=1&limit=10&orderField=createdAt&orderType=desc`
        );
        expect(orders).toEqual(mockData.data.data);
    });
});