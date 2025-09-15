import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import {CaseValidate, Order, OrderClassEnum, OrderDuplicate, orderDuplicateDb, OrderNotCufeListResponse, OrderReportType, OrderSettlementReportGeneral, OrderSettlementSocietiesResponse, OrdersPairedResponse, OrdersSettlementTotal, OrderStatusEnum, OrderTypeEnum, ResponseOrdersSociety, TotalValueResponse, ValidateDuplicate, ValidateDuplicateResponse} from "../type/order.type";
import { IOrderDomainInterface, OrderDomain } from "../domain";
import { OrderService } from '../service/order.service';
import { IOrderServiceInterface } from "../service/order.interface";
import { GetOrdersOptions } from "../../../models/order";
import { AppError } from "vanti-utils/lib";
import * as Helper from "../../../helpers/xlsx/xlsx";
import { TransversalService } from "../../transversales/service/transversal.service";
import { UserLineData } from "../../settlement/type/settlement.type";
import { SettlementService } from "../../settlement/service/settlement.service";
import * as SettlementRepo from "../../settlement/repository/settlement.repository";
import { sub } from 'date-fns';
import { Settlement } from "../../../models/settlement";
jest.mock('../service/order.service');

describe('validate order domain', () => {

    let orderDomain: OrderDomain
    let mockOrderService: jest.Mocked<IOrderServiceInterface>;
    const mockOptions: GetOrdersOptions = {
        field: 'type',
        value: '01',
        state: 'CREATED',
        page: 1,
        limit: 10,
        orderField: 'createdAt',
        orderType: 'asc',
    };

    beforeEach(() => {
        orderDomain = new OrderDomain();
        mockOrderService = new OrderService() as any;

        (OrderService as jest.Mock).mockImplementation(() => mockOrderService);
    });

    it("should validate orders duplicate", async () => {
        const oportunityId: string = '123,321'
        const ordersToValidate: string = '12,34'

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

        const responseService: ValidateDuplicateResponse = {
            valid: true,
            message: CaseValidate.SUCCESS,
            oportunityId: oportunityId
        };

        jest.spyOn(OrderService.prototype, 'validateOrdersDuplicate').mockResolvedValue(responseService);

        let orderDomain: IOrderDomainInterface = new OrderDomain()
        let response = await orderDomain.validateOrdersDuplicate(oportunityId, ordersToValidate);

        expect(response).toEqual(responseValidate)
    })

    it('should validate get orders for download', async () => {

        let settlementId: string = 'testData'
        const buffer = Buffer.from('testData')
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
        const userLineResponse: UserLineData = {
        copyEmail: ['testData'],
        name: 'testData',
        userEmail: 'testData@gm.com'
        } 

        jest.spyOn(SettlementService.prototype, 'getUserLineData').mockResolvedValue(userLineResponse);
        jest.spyOn(OrderService.prototype, 'getOrdersDownload').mockResolvedValue(returnData);
        jest.spyOn(TransversalService.prototype, 'sendEmail').mockResolvedValue(true)

        const result = await orderDomain.getOrdersDownload(settlementId, buffer);
        expect(OrderService.prototype.getOrdersDownload).toHaveBeenCalledTimes(1);
        expect(result).toEqual('SUCCESS');
        expect(result).not.toBeNull();
    });

    it('should validate get orders for download null return', async () => {

        const settlementId: string = 'testData'
        const buffer = Buffer.from('testData')
        const returnData: OrderReportType[] = [];

        jest.spyOn(OrderService.prototype, 'getOrdersDownload').mockResolvedValue(returnData);

        await expect(orderDomain.getOrdersDownload(settlementId, buffer)).rejects.toThrow(
            new AppError({message: 'orders not found'})
        )
    });

    it('should validate get orders orphan', async () => {
        const mockResponse = {
            rows: [],
            count: 0
        };
        jest.spyOn(OrderService.prototype, 'getOrdersOrphan').mockResolvedValue(mockResponse);

        const result = await orderDomain.getOrdersOrphan(mockOptions, 'testData');
        expect(OrderService.prototype.getOrdersOrphan).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockResponse);
    });

    it("should validate getOrderDuplicate", async ()=> {
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

        let options: GetOrdersOptions = {
            limit: 10,
            page: 1
        }

        const response: OrderDuplicate = {
            count: 1,
            rows: [
                {
                    id: "testData",
                    oportunityId: "testData",
                    documentClass: "testData",
                    documentNumber: "testData",
                    collaboratorIdentification: "testData",
                    collaboratorName: "testData",
                    clientIdentification: "testData",
                    societyCode: "testData",
                    contractAccount: "testData",
                    amount: "testData",
                    totalAmount: "testData",
                    vat: "testData",
                    rediscount: "testData"
                }
            ]
        }

        jest.spyOn(OrderService.prototype, 'getOrdersDuplicate').mockResolvedValue(returnDb);

        const result = await orderDomain.getOrderDuplicate(options);
        expect(result).toEqual(response)
    })

    it("should validate getFilterOrders", async () => {

        let options: GetOrdersOptions = {
            field: 'testData',
            value: 'testData',
            page: 1,
            settlementId: 'testData'
        }

        let returnOrders: OrdersPairedResponse = {
            count: 1,
            dateRequest: 'testData',
            rows: [
                {
                    accountingDocument: 'testData',
                    campaingId: 'testData',
                    collaboratorId: 'testData',
                    collaboratorName: 'testData',
                    contractAccount: 'testData',
                    createdOrderDate: 'testData',
                    cufe: true,
                    datalakeDate: 'testData',
                    id: 'testData',
                    invoicedDate: 'testData',
                    invoiceId: 'testData',
                    oportunityId: 'testData',
                    orderIdRediscount: 'testData',
                    rebateTotal: 'testData',
                    rediscountPercentage: 'testData',
                    rediscountValue: 'testData',
                    salesCollaboratorTypeDocument: OrderClassEnum.ZFM6,
                    salesOrderCustomer: 'testData',
                    salesOrderTypeCustomer: OrderClassEnum.ZP12,
                    settlementDate: 'testData',
                    settlementId: 'testData',
                    society: 'testData',
                    societyName: 'testData',
                    typeBusiness: OrderTypeEnum.VANTI_LISTO,
                    value: 'testData',
                    vatCommission: 'testData',
                }
            ],
            state:OrderStatusEnum.UNBILLED
        }

        const buffer = Buffer.from('testData')
        const oneDayAgo = sub(new Date(), { days: 1 });
        const settlement: Settlement = {
            expirationTime: oneDayAgo,
            settlementId: 'testData'
        }


        jest.spyOn(OrderService.prototype, 'getFilterOrders').mockResolvedValue(returnOrders);
        jest.spyOn(SettlementRepo, 'getSettlement').mockResolvedValue(settlement as any);

        let orderDomain: IOrderDomainInterface = new OrderDomain()
        let response = await orderDomain.getFilterOrders(options, buffer);

        expect(response.rows).toEqual(returnOrders.rows);
    })
    
    it("should validate getFilterOrders null values", async () => {

        let options: GetOrdersOptions = {
            field: 'testData',
            value: 'testData',
            page: 1,
            settlementId: 'testData'
        }

        let returnOrders: OrdersPairedResponse = {
            count: 0,
            dateRequest: 'testData',
            rows: [],
            state:OrderStatusEnum.CREATED
        }

        const buffer = Buffer.from('testData');

        jest.spyOn(OrderService.prototype, 'getFilterOrders').mockResolvedValue(returnOrders);

        let orderDomain: IOrderDomainInterface = new OrderDomain()
        let response = await orderDomain.getFilterOrders(options, buffer);

        expect(response.rows).toEqual(returnOrders.rows);
    })

    it("should validate getFilterOrders settlementId", async () => {

        let options: GetOrdersOptions = {
            field: 'testData',
            value: 'testData',
            page: 1,
            settlementId: 'testData'
        }

        let returnOrders: OrdersPairedResponse = {
            count: 1,
            dateRequest: 'testData',
            rows: [
                {
                    accountingDocument: 'testData',
                    campaingId: 'testData',
                    collaboratorId: 'testData',
                    collaboratorName: 'testData',
                    contractAccount: 'testData',
                    createdOrderDate: 'testData',
                    cufe: true,
                    datalakeDate: 'testData',
                    id: 'testData',
                    invoicedDate: 'testData',
                    invoiceId: 'testData',
                    oportunityId: 'testData',
                    orderIdRediscount: 'testData',
                    rebateTotal: 'testData',
                    rediscountPercentage: 'testData',
                    rediscountValue: 'testData',
                    salesCollaboratorTypeDocument: OrderClassEnum.ZFM6,
                    salesOrderCustomer: 'testData',
                    salesOrderTypeCustomer: OrderClassEnum.ZP12,
                    settlementDate: 'testData',
                    settlementId: 'testData',
                    society: 'testData',
                    societyName: 'testData',
                    typeBusiness: OrderTypeEnum.VANTI_LISTO,
                    value: 'testData',
                    vatCommission: 'testData',
                }
            ],
            state:OrderStatusEnum.UNBILLED
        }

        jest.spyOn(OrderService.prototype, 'getFilterOrdersSettlementId').mockResolvedValue(returnOrders);

        let orderDomain: IOrderDomainInterface = new OrderDomain()
        let response = await orderDomain.getFilterOrdersSettlementId(options);

        expect(response.rows).toEqual(returnOrders.rows);
    })
    
    it("should validate getFilterOrders settlementId null values", async () => {

        let options: GetOrdersOptions = {
            field: 'testData',
            value: 'testData',
            page: 1,
            settlementId: 'testData'
        }

        let returnOrders: OrdersPairedResponse = {
            count: 0,
            dateRequest: 'testData',
            rows: [],
            state:OrderStatusEnum.CREATED
        }
        
        jest.spyOn(OrderService.prototype, 'getFilterOrdersSettlementId').mockResolvedValue(returnOrders);

        let orderDomain: IOrderDomainInterface = new OrderDomain()
        let response = await orderDomain.getFilterOrdersSettlementId(options);

        expect(response.rows).toEqual(returnOrders.rows);
    })

    it("should validate get orders society", async () => {
        const societyCode: string = 'testData'
        const returnData: ResponseOrdersSociety = {
                count: 1,
                rows: [{
                    allied: "testData",
                    allied_name: "testData",
                    allied_sum: 1000,
                    customer_sum: -1000,
                    total: 0
                }],
                total: {
                    totalClient: 0,
                    totalFirm: 0,
                    totalOrders: 0,
                    totalValue: 0,
                } 
            };

        jest.spyOn(OrderService.prototype, 'getOrdersSociety').mockResolvedValue(returnData);

        const result = await orderDomain.getOrdersSociety({}, 'testData');
        expect(OrderService.prototype.getOrdersSociety).toHaveBeenCalledTimes(1);
        expect(result).toEqual(returnData);
    })

    it("should validate downloadOrdersSettlementBase64", async () => {
        const settlementId: string = 'testData';
        const base64Test = 'testDataBase64';

        const societyData: OrderSettlementSocietiesResponse[] = [
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
        ];
        const generalData: OrderSettlementReportGeneral[] = [
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
        ];
        const userLineResponse: UserLineData = {
            copyEmail: ['testData'],
            name: 'testData',
            userEmail: 'testData@gm.com'
        }

        jest.spyOn(SettlementService.prototype, 'getUserLineData').mockResolvedValue(userLineResponse);
        jest.spyOn(OrderService.prototype, 'getOrdersSettlementGeneral').mockResolvedValue(generalData);
        jest.spyOn(OrderService.prototype, 'getOrdersSettlementSociety').mockResolvedValue(societyData);
        jest.spyOn(TransversalService.prototype, 'sendEmail').mockResolvedValue(true);
        jest.spyOn(Helper, 'GenerateMultiviewXlsx').mockResolvedValue(base64Test);

        let orderDomain: IOrderDomainInterface = new OrderDomain()
        let response = await orderDomain.downloadOrdersSettlementBase64(settlementId, true);

        expect(response).toEqual(base64Test)
    })

    it("should validate downloadOrdersSettlementBase64 error", async () => {
        const settlementId: string = 'testData';

        jest.spyOn(OrderService.prototype, 'getOrdersSettlementGeneral').mockImplementation(()=> {
            throw new AppError({message: 'error'})
        })

        let orderDomain: IOrderDomainInterface = new OrderDomain()

        await expect(orderDomain.downloadOrdersSettlementBase64(settlementId)).rejects.toThrow(
            new AppError({message: `[downloadOrdersSettlementBase64] Error al crear el archivo: error`})
        )
    })

    it("shoulda validate getOrderNotCufe", async () => {
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

        jest.spyOn(OrderService.prototype, 'getOrderNotCufe').mockResolvedValue(returnService);

        const orderDomain: IOrderDomainInterface = new OrderDomain()
        const response = await orderDomain.getOrderNotCufe(settlementId, options);

        expect(response).toEqual(returnService)
    })

    it("shoulda validate getOrderNotCufe error", async () => {
        const settlementId = 'testData';
        const options: GetOrdersOptions = {
            field: 'testData',
            orderField: 'testData',
            limit: 10,
            page: 1
        }

        jest.spyOn(OrderService.prototype, 'getOrderNotCufe').mockImplementation(()=> {
            throw new AppError({message: 'error'})
        });

        const orderDomain: IOrderDomainInterface = new OrderDomain()

        await expect(orderDomain.getOrderNotCufe(settlementId, options)).rejects.toThrow(
            new AppError({message: '[getOrderNotCufe] Error al consultar ordenes sin cufe - error'})
        )
    })

    it("should validate getOrdersTotals", async () => {
        const buffer = Buffer.from('testData');
        const expectResponse: OrdersSettlementTotal = {
            couples: "testData",
            excluded: "testData",
            selected: "testData",
            totalClient: "testData",
            totalFirm: "testData",
            totalValue: "testData"
        }

        jest.spyOn(OrderService.prototype, 'getOrdersTotals').mockResolvedValue(expectResponse)

        const orderDomain: IOrderDomainInterface = new OrderDomain()
        const response = await orderDomain.getOrdersTotals(buffer);

        expect(response).toEqual(expectResponse);
    })
});