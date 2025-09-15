import { expect, it, describe, jest } from "@jest/globals";
jest.mock("../../service");
import { GetPaginatedResults, TotalBySociety } from "../../type/adjustmentNote.type";
import { AdjustmentNoteDomainDraft } from "./adjustmentNoteDraft.domain"
import { IAdjustmentNoteDomainDraft } from "./adjustmentNoteDraft.domain.interface"
import * as RepositoryMongo from "../../repository/adjustmentNoteSettlement/adjustmentNoteSettlement.repository"
import * as RepositoryAdjusmentNoteOrderHash from "../../repository/adjustmentNoteHash/adjustmentNote.repository"
import * as RepositoryAdjusmentNoteOrder from "../../repository/adjustmentNoteOrder/adjustmentNoteOrder.repository"
import { AdjustmentNoteServiceSettlements } from "../../service";
import { AdjustmentNoteStatus } from "../../../../models/adjustmentNoteSettlement";
import { GenerateMultiviewXlsx } from "../../../../helpers/xlsx/xlsx";

const orders: any[] = [
    { adjustmentNotedocumentNumber: '236429037', oportunityId: '1037049', includeSettlement: 'NO' },
    { adjustmentNotedocumentNumber: '236568921', oportunityId: '1037049', includeSettlement: 'NO' },
    { adjustmentNotedocumentNumber: '238913233', oportunityId: '1093398', includeSettlement: 'NO' },
    { adjustmentNotedocumentNumber: '238897030', oportunityId: '1093398', includeSettlement: 'NO' },
];

const file_name = 'Notas_ajustes_vantilisto_27082025_1105.xlsx';
describe("should validate domain adjustment note Draft", () => {
    it('should validate getPaginatedResults in postgres', async () => {

        const society = '15';
        const page = 1;
        const limit = 10;
        const settlementId = 'testData'

        const responseMongoValidateion = false;
        const responsePostgres: { resultPaginated: { total: number; data: GetPaginatedResults[] }; statusSettlement: AdjustmentNoteStatus } = {
            resultPaginated: {
                total: 1,
                data: [
                    {
                        clientSignature: "testData",
                        cxcClient: 0,
                        cxcSignature: 0,
                        firmName: 'testData',
                        totalGeneral: 0
                    }
                ]
            },
            statusSettlement: AdjustmentNoteStatus.APPROVED // Replace with the appropriate AdjustmentNoteStatus value
        }

        jest.spyOn(AdjustmentNoteServiceSettlements.prototype, 'getSettlementsPostgres').mockResolvedValue(responsePostgres);
        jest.spyOn(RepositoryMongo, 'validSettlementExist').mockResolvedValue(responseMongoValidateion);

        const domain: IAdjustmentNoteDomainDraft = new AdjustmentNoteDomainDraft()
        const response = await domain.getPaginatedResults(society, page, limit, settlementId);

        expect(response).toEqual(responsePostgres)
    })

    it("should validate getTotalBySociety in postgres", async () => {
        const society = '15';
        const settlementId = 'testData';

        const responseMongoValidateion = false;
        const responsePostgres: TotalBySociety = {
            firmName: "testData",
            clientSignature: "testData",
            totalClient: 0,
            totalSignature: 0,
            totalSettlement: 0
        }

        jest.spyOn(RepositoryMongo, 'validSettlementExist').mockResolvedValue(responseMongoValidateion);
        jest.spyOn(AdjustmentNoteServiceSettlements.prototype, 'getSettlementsTotalsPostgres').mockResolvedValue(responsePostgres);

        const domain: IAdjustmentNoteDomainDraft = new AdjustmentNoteDomainDraft()
        const response = await domain.getTotalBySociety(society, settlementId);

        expect(response).toEqual(responsePostgres)
    })

    it("markOrders in mongo return error by invalid includeSettlement", async () => {
        const domain = new AdjustmentNoteDomainDraft();
        const badData = [
            ...orders.slice(0, 3),
            { ...orders[3], includeSettlement: 'MAL' },
        ];

        jest.spyOn(RepositoryAdjusmentNoteOrder as any, "updateOrdersByFile")
            .mockResolvedValue(undefined);

        const res = await domain.markOrders(badData, file_name);

        expect(res).toMatchObject({
            status: false,
            message: expect.stringContaining('ERROR - SOMETHING INCLUDE ERROR')
        });
    });

    it("markOrders returns error when NOT MONGO HASH DATA (repo returns null)", async () => {
        const domain = new AdjustmentNoteDomainDraft();

        jest.spyOn(RepositoryAdjusmentNoteOrderHash as any, 'getAdjustmentNotesRepositoryByFileName').mockResolvedValue(null);
        jest.spyOn(domain as any, 'validPartnerData').mockResolvedValue(true);

        const res = await domain.markOrders(orders, file_name);

        expect(res.status).toBe(false);
        expect(res.message).toContain('NOT MONGO HASH DATA');
    });

    it("markOrders returns error when validPartnerData is false", async () => {
        const domain = new AdjustmentNoteDomainDraft();

        jest.spyOn(RepositoryAdjusmentNoteOrderHash as any, 'getAdjustmentNotesRepositoryByFileName').mockResolvedValue({} as any);
        jest.spyOn(domain as any, 'validPartnerData').mockResolvedValue(false);

        const res = await domain.markOrders(orders, file_name);

        expect(res.status).toBe(false);
        expect(res.message).toContain('BAD VALIDATION PARTNER');
    });

    it("markOrders success flow: updates postgres and calls updateFileOrder once per item", async () => {
        const domain = new AdjustmentNoteDomainDraft();

        jest.spyOn(RepositoryAdjusmentNoteOrderHash as any, 'getAdjustmentNotesRepositoryByFileName').mockResolvedValue({} as any);
        jest.spyOn(domain as any, 'validPartnerData').mockResolvedValue(true);
        const updFileSpy = jest.spyOn(RepositoryAdjusmentNoteOrder as any, 'updateOrdersByFile').mockResolvedValue(undefined);

        const res = await domain.markOrders(orders, file_name);

        expect(res.status).toBe(true);
        expect(res.message).toBe('SUCCESS');

        expect(updFileSpy).toHaveBeenCalledTimes(orders.length);
        orders.forEach((it, idx) => {
            expect(updFileSpy).toHaveBeenNthCalledWith(
                idx + 1,
                it.adjustmentNotedocumentNumber,
                file_name,
                it.includeSettlement,
                undefined
            );
        });
    });

    it("getDetailsSettlement returns true when email is sent successfully", async () => {
        const domain = new AdjustmentNoteDomainDraft();
        const settlementId = "settlement123";
        const bufferMock = "base64xlsx";
        const emailResponseMock = true;

        jest.spyOn(domain, "getBufferExcelTotalBySettlement").mockResolvedValue(bufferMock);
        jest.spyOn(domain, "sendEmailSettlement").mockResolvedValue(emailResponseMock);

        const result = await domain.getDetailsSettlement(settlementId);
        expect(result).toBe(emailResponseMock);
    });

    it("getBufferExcelTotalBySettlement returns buffer after processing societies", async () => {
        const domain = new AdjustmentNoteDomainDraft();
        const settlementId = "settlement123";
        const allDataMock = [{}, {}];
        const totalBySettlementMock = [{}, {}];
        const totalBySocietyMock = { test: "value" };
        const bufferMock = "bufferXLSX";

        jest.spyOn(RepositoryAdjusmentNoteOrder as any, "getAllDataSortByOpportunity").mockResolvedValue(allDataMock);
        jest.spyOn(RepositoryAdjusmentNoteOrder as any, "getTotalBySettlement").mockResolvedValue(totalBySettlementMock);
        jest.spyOn(RepositoryAdjusmentNoteOrder as any, "getTotalBySociety").mockResolvedValue(totalBySocietyMock);
        jest.spyOn(require("../../../../helpers/xlsx/xlsx"), "GenerateMultiviewXlsx").mockResolvedValue(bufferMock);

        const result = await domain.getBufferExcelTotalBySettlement(settlementId);
        expect(result).toBe(bufferMock);
    });

    it("sendEmailSettlement sends email and returns response", async () => {
        const domain = new AdjustmentNoteDomainDraft();
        const xlsxBase64 = "base64string";
        const settlementId = "settlement123";
        const emailDataMock = { userEmail: "test@mail.com", copyEmail: ["copy@mail.com"], name: "Test User" };
        const sendEmailMock = "sent";

        jest.spyOn(require("../../../settlement/service/settlement.service").SettlementService.prototype, "getUserLineData").mockResolvedValue(emailDataMock);
        jest.spyOn(require("../../../transversales/service/transversal.service").TransversalService.prototype, "sendEmail").mockResolvedValue(sendEmailMock);

        const result = await domain.sendEmailSettlement(xlsxBase64, settlementId);
        expect(result).toBe(sendEmailMock);
    });

    it("getAdjustmentNotesSettlement returns expected response", async () => {
        const domain = new AdjustmentNoteDomainDraft();
        const responseMock = { data: [], total: 0 };
        jest.spyOn(RepositoryMongo as any, "getAdjustmentNotesSettlement").mockResolvedValue(responseMock);

        const result = await domain.getAdjustmentNotesSettlement(1, 10, "settlementId", "2024-01-01", "ASC", ["field"]);
        expect(result).toBe(responseMock);
    });

    it("validPartnerData returns false if opportunityArray is empty", async () => {
        const domain = new AdjustmentNoteDomainDraft();
        jest.spyOn(RepositoryAdjusmentNoteOrderHash as any, "getOpportunityByAdjustmentNote").mockResolvedValue([]);
        const result = await (domain as any).validPartnerData([{ adjustmentNotedocumentNumber: "1" }], null);
        expect(result).toBe(false);
    });

    it("validPartnerData returns false if any group length is not 2", async () => {
        const domain = new AdjustmentNoteDomainDraft();
        const opportunityArray = [
            { opportunityId: "A" },
            { opportunityId: "A" },
            { opportunityId: "B" }
        ];
        jest.spyOn(RepositoryAdjusmentNoteOrderHash as any, "getOpportunityByAdjustmentNote").mockResolvedValue(opportunityArray);
        jest.spyOn(require("lodash"), "groupBy").mockReturnValue({ A: [opportunityArray[0], opportunityArray[1]], B: [opportunityArray[2]] });
        const result = await (domain as any).validPartnerData([{ adjustmentNotedocumentNumber: "1" }], null);
        expect(result).toBe(false);
    });

    it("validPartnerData returns true if all groups have length 2", async () => {
        const domain = new AdjustmentNoteDomainDraft();
        const opportunityArray = [
            { opportunityId: "A" },
            { opportunityId: "A" },
            { opportunityId: "B" },
            { opportunityId: "B" }
        ];
        jest.spyOn(RepositoryAdjusmentNoteOrderHash as any, "getOpportunityByAdjustmentNote").mockResolvedValue(opportunityArray);
        jest.spyOn(require("lodash"), "groupBy").mockReturnValue({ A: [opportunityArray[0], opportunityArray[1]], B: [opportunityArray[2], opportunityArray[3]] });
        const result = await (domain as any).validPartnerData([{ adjustmentNotedocumentNumber: "1" }], null);
        expect(result).toBe(true);
    });

    it("getBufferExcelBySingleCollaborator throws error if no data found", async () => {
        const domain = new AdjustmentNoteDomainDraft();
        jest.spyOn(RepositoryAdjusmentNoteOrder as any, "getSingleDataByCollaborator").mockResolvedValue(null);
        await expect(domain.getBufferExcelByClient("settlementId", "signature")).rejects.toThrow('No se encontró información para el colaborador especificado.');
    });

    it("getBufferExcelBySingleCollaborator returns buffer if data found", async () => {
        const domain = new AdjustmentNoteDomainDraft();
        const singleData = { test: "data" };
        const bufferMock = "buffer";
        jest.spyOn(RepositoryAdjusmentNoteOrder as any, "getSingleDataByCollaborator").mockResolvedValue(singleData);

        const result = await domain.getBufferExcelByClient("settlementId", "signature");
        expect(result).toBe(bufferMock);
    });
})