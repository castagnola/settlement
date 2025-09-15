import { expect, it, describe, jest } from "@jest/globals";
import {AdjustmentNoteMongo, AdjustmentPartnerWithoutSettlementNote} from "../../type/adjustmentNote.type";
import { AdjustmentNoteServiceOrders } from "../../service";
import { TransversalService } from "../../../transversales/service/transversal.service";
import * as RepositoryHash from "../../repository/adjustmentNoteHash/adjustmentNote.repository";
import * as RepositoryAdjustmentNote from "../../repository/adjustmentNoteOrder/adjustmentNoteOrder.repository";
import * as Xlsx from "../../../../helpers/xlsx/xlsx";
import { AdjustmentNoteDomainOrders } from "./adjustmentNoteOrders.domain";
import { UserLineData } from "../../../settlement/type/settlement.type";
import { SettlementService } from "../../../settlement/service/settlement.service";

jest.mock("../../service");

describe("shoudl validate domain adjustment note orders", () => {

    it("should validate getOrdersToNewSettlement", async () => {
        const dataResponse: AdjustmentPartnerWithoutSettlementNote[] = [
            {
                id: 0,
                salesOrderCustomer: "testData",
                documentClass: "testData",
                campaingId: "testData",
                interestRate: 0,
                quotas: 0,
                ticket: "testData",
                oportunityId: "testData",
                collaboratorIdentification: "testData",
                collaboratorName: "testData",
                accountingDocument: "testData",
                ClFac: "testData",
                invoicedDate: "testData",
                StRF: "testData",
                society: "testData",
                clientBp: "testData",
                contractAccount: "testData",
                value: 0,
                vatCommission: 0,
                rebateTotal: 0,
                invoiceId: "testData",
                idRediscountInvoice: "testData",
                customerIdentification: "testData",
                pre_settlement: "testData",
                settlement: "testData",
                adjustmentNote: "testData",
                adjustmenReference: "testData",
                remarks: "testData",
                adjustmentNoteType: "testData",
                include: "testData",
            },
        ];

        const base64 = "testData";
        const userLineResponse: UserLineData = {
        copyEmail: ['testData'],
        name: 'testData',
        userEmail: 'testData@gm.com'
        } 

        jest.spyOn(SettlementService.prototype, 'getUserLineData').mockResolvedValue(userLineResponse);
        jest
            .spyOn(AdjustmentNoteServiceOrders.prototype, "getOrdersToNewSettlement")
            .mockResolvedValue(dataResponse);
        jest
            .spyOn(TransversalService.prototype, "sendEmail")
            .mockResolvedValue(true);
        jest
            .spyOn(RepositoryHash, "createAdjustmentNotesRepository")
            .mockResolvedValue({} as any);
        jest
            .spyOn(Xlsx, "GenerateMultiviewXlsx")
            .mockResolvedValue(base64);

        const domain = new AdjustmentNoteDomainOrders();
        const response = await domain.getOrdersToNewSettlement();

        expect(response).toEqual(base64);
    });

    it("should handle errors in getOrdersToNewSettlement", async () => {
        jest
            .spyOn(AdjustmentNoteServiceOrders.prototype, "getOrdersToNewSettlement")
            .mockRejectedValue(new Error("Error fetching orders"));

        const adjustmentNoteDomain = new AdjustmentNoteDomainOrders();

        await expect(
            adjustmentNoteDomain.getOrdersToNewSettlement()
        ).rejects.toThrow("Error fetching orders");
    });

    it("should fetch orders from MongoDB when settlementId is provided", async () => {
        const settlementId = "12345";
        const mongoOrdersMock: AdjustmentNoteMongo[] = [
            {
                id: 4,
                salesDocument: "205574254",
                salesClient: "ZFM6",
                campaignId: "675",
                interestRate: 1.5,
                term: 60,
                ticketId: "392",
                opportunityId: "515404502",
                clientSignature: "1000008242",
                firmName: "DISTRIBUIDORA RAYCO S.A.S",
                invoiceDocument: "2007545618",
                invoiceClient: "testData",
                invoiceDate: "2021-11-11",
                statusRf: "",
                society: "18",
                request: 'testData',
                contractAccount: "63399368",
                netValueWithoutVat: 2261928,
                vat19: 0,
                netValueWithVat: 2261928,
                documentNumber: "8000002693",
                reference: "F18S3968",
                clientCc: "1000008242",
                previousSettlementConsecutive: "01-0007-120221",
                adjustmentSettlementConsecutive: 'testData',
                adjustmentNote: 'testData',
                secondaryReference: "",
                observation: "",
                adjustmentNoteType: "",
                includeInSettlement: "SI",
            }
        ];

        jest.spyOn(RepositoryAdjustmentNote, "findOrdersBySettlementId").mockImplementation(async () => {return mongoOrdersMock;});
        jest.spyOn(Xlsx, "GenerateMultiviewXlsx").mockResolvedValue("mockBase64");

        const domain = new AdjustmentNoteDomainOrders();
        const response = await domain.getOrdersToNewSettlement(settlementId);

        expect(response).toEqual("mockBase64");
        expect(RepositoryAdjustmentNote.findOrdersBySettlementId).toHaveBeenCalledWith(settlementId);
    }, 90000);
})