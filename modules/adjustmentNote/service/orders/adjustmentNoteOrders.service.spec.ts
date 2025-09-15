import { AppError, Axios, ResponseApi } from "vanti-utils/lib";
import { AdjustmentPartnerWithoutSettlementNote } from "../../type/adjustmentNote.type";
import { AdjustmentNoteServiceOrders } from "./adjustmentNoteOrders.service"
jest.mock('vanti-utils/lib');
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

describe("should validate orders services", () => {

    jest.mock('vanti-utils/lib', () => ({
        Axios: {
            get: jest.fn(),
        },
        AppError: jest.fn().mockImplementation((error: { message: string }) => {
            const appError = new Error(error.message);
            appError.name = 'AppError';
            return appError;
        }),
    }));

    beforeAll(() => {
        process.env.URI_SETTLEMENT_CORE = 'http://localhost:2000/test/api'; 
    });

    it("should validate get Orders", async () => {
        const dataResponse: AdjustmentPartnerWithoutSettlementNote[] = [
            {
                id: 0,
                salesOrderCustomer: 'testData',
                documentClass: 'testData',
                campaingId: 'testData',
                interestRate: 0,
                quotas: 0,
                ticket: 'testData',
                oportunityId: 'testData',
                collaboratorIdentification: 'testData',
                collaboratorName: 'testData',
                accountingDocument: 'testData',
                ClFac: 'testData',
                invoicedDate: 'testData',
                StRF: 'testData',
                society: 'testData',
                clientBp: 'testData',
                contractAccount: 'testData',
                value: 0,
                vatCommission: 0,
                rebateTotal: 0,
                invoiceId: 'testData',
                idRediscountInvoice: 'testData',
                customerIdentification: 'testData',
                pre_settlement: 'testData',
                settlement: 'testData',
                adjustmentNote: 'testData',
                adjustmenReference: 'testData',
                remarks: 'testData',
                adjustmentNoteType: 'testData',
                include: 'testData'
            }
        ]
        const service = new AdjustmentNoteServiceOrders();
        const responseApi: ResponseApi<any> = {
            data: {data: dataResponse},
            status: 200
        }
        
        mockedAxios.get.mockResolvedValueOnce(responseApi);
        
        const orders = await service.getOrdersToNewSettlement();
        expect(orders).toEqual(dataResponse);
    })

})
