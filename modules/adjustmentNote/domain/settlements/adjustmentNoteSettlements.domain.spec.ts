import { expect, it, describe, jest } from "@jest/globals";
import { AdjustmentNoteServiceSettlements } from "../../service";
import { AdjustmentNoteDomainSettlements } from "./adjustmentNoteSettlements.domain";
import { AdjustmentMessageReturn, AdjustmentNoteType, AdjustmentPartnerWithoutSettlementNote, GetAdjustmentViewOptions } from "../../type/adjustmentNote.type";
import * as RepositoryOrders from "../../repository/adjustmentNoteOrder/adjustmentNoteOrder.repository";
import * as RepositorySettlements from "../../repository/adjustmentNoteSettlement/adjustmentNoteSettlement.repository";
import * as RepositoryHash from "../../repository/adjustmentNoteHash/adjustmentNote.repository";
import * as Xlsx from "../../../../helpers/xlsx/xlsx";
import * as JWt from '../../../../helpers/jwt/jwt';
import { AdjustmentNoteHash, HashStatus } from "../../../../models/adjustmentNoteHash";
import { AdjustmentNoteDomainOrders } from "../orders/adjustmentNoteOrders.domain";
import { TransversalService } from "../../../transversales/service/transversal.service";
import { SettlementService } from "../../../settlement/service/settlement.service";
import { AdjustmentNoteDomainDraft } from "../draft/adjustmentNoteDraft.domain";
import { AppError } from "vanti-utils/lib";
import { AdjustmentNoteStatus } from "../../../../models/adjustmentNoteSettlement";
jest.mock("../../service");

describe("shoudl validate domain adjustment note settlements", () => {

    it("should return emails from getAdjustmentNotes", async () => {
        // Datos de prueba
        const options: GetAdjustmentViewOptions = {
            page: 1,
            limit: 10,
            fieldOrder: "creationDate", // Ejemplo de campo de orden
            orderType: "desc", // Ejemplo de tipo de orden
            settlementId: "settlement123", // Ejemplo de settlementId
        };

        const mockResponse: AdjustmentNoteType[] = [
            {
                orders: 5,
                settlementId: "settlement123",
                state: "ACTIVE",
                creationDate: new Date("2024-01-01T00:00:00"),
                lastStatusDate: new Date("2024-01-02T00:00:00"),
            },
        ];

        // Mock de la función getEmails de AdjustmentNoteService
        jest
            .spyOn(AdjustmentNoteServiceSettlements.prototype, "getAdjustmentNotes")
            .mockResolvedValue(mockResponse);

        const adjustmentNoteDomain = new AdjustmentNoteDomainSettlements();
        const response = await adjustmentNoteDomain.getAdjustmentNotes(options);

        expect(response).toEqual(mockResponse); // Verifica que la respuesta coincida
        expect(response.length).toBe(1); // Verifica que la longitud sea correcta
        expect(response[0].settlementId).toBe("settlement123"); // Verifica que el settlementId sea correcto
        expect(response[0].state).toBe("ACTIVE"); // Verifica que el estado sea correcto
    });

    it('should generate a valid consecutive adjustment note ID', async () => {
        const domain = new AdjustmentNoteDomainSettlements();
        const lastConsecutive = 123;
        const result = await (domain as any).generateConsecutiveAdjustmentNote(lastConsecutive);

        const fixedPart = "02";
        const consecutivePart = (lastConsecutive + 1).toString().padStart(4, "0");
        const datePart = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "2-digit" }).replace(/\//g, "");

        expect(result).toBe(`${fixedPart}-${consecutivePart}-${datePart}`);
    });

    it("should validate _saveMongoRelation", async () => {

        const settlementId = 'testData';
        const fileData: AdjustmentPartnerWithoutSettlementNote[] = [
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
                include: 'SI'
            }
        ]
        const fileName = 'testData';
        const consecutive = 0

        const jestMockCreate = jest.spyOn(RepositorySettlements, 'createAdjustmentNoteSettlement').mockResolvedValue({} as any)
        const jestMockUpdate = jest.spyOn(RepositoryOrders, 'updateFileOrder').mockResolvedValue({} as any)

        const domain = new AdjustmentNoteDomainSettlements();
        await (domain as any)._saveMongoRelation(settlementId, fileData, fileName, consecutive);

        expect(jestMockCreate).toHaveBeenCalled();
        expect(jestMockUpdate).toHaveBeenCalled();
    })

    it("should validate createNewSettlement", async () => {
        const base64 = "testData";
        const fileName = "testData";
        const file = Buffer.from(base64, "base64");
        const domain = new AdjustmentNoteDomainSettlements();

        const bufferConvert: AdjustmentPartnerWithoutSettlementNote[] = [
            {
                id: 0,
                salesOrderCustomer: 'testData',
                documentClass: 'testData1',
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
                include: 'SI'
            },
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
                include: 'SI'
            }
        ]
        const responseMongo: AdjustmentNoteHash = {
            signatures: [
                {
                    clientSignature: 'testData',
                    hash: 'testData'
                }
            ],
            fileName: 'testData',
            status: HashStatus.CREATED
        }

        const settlementId = 'testData'
        const userEmail = 'testData';
        const responseValid: AdjustmentMessageReturn = {
            message: settlementId,
            status: true
        }

        jest.spyOn(domain as any, '_convertBufferToFilterData').mockResolvedValue(bufferConvert)
        jest.spyOn(AdjustmentNoteDomainOrders.prototype, 'getFileHash').mockResolvedValue(responseMongo)
        jest.spyOn(domain as any, '_validHashData').mockResolvedValue('SUCCESS')
        jest.spyOn(domain as any, '_saveNewSettlementErrased').mockResolvedValue(settlementId)
        jest.spyOn(RepositoryHash, 'getAdjustmentNotesRepositoryByFileName').mockResolvedValue(responseMongo as any)
        jest.spyOn(RepositoryHash, 'updateAdjustmentNoteHash').mockResolvedValue({} as any)
        jest.spyOn(domain as any, '_validSettlementUsed').mockResolvedValue(true)
        jest.spyOn(domain as any, '_validPartnerData').mockResolvedValue(true)

        const response = await domain.createNewSettlement(file, fileName, userEmail);

        expect(response).toEqual(responseValid);
    });

    it("should validate createNewSettlement not partner", async () => {
        const base64 = "testData";
        const fileName = "testData";
        const file = Buffer.from(base64, "base64");
        const domain = new AdjustmentNoteDomainSettlements();

        const bufferConvert: AdjustmentPartnerWithoutSettlementNote[] = [
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
                include: 'NO'
            },
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
                include: 'SI'
            }
        ]
        const responseMongo: AdjustmentNoteHash = {
            signatures: [
                {
                    clientSignature: 'testData',
                    hash: 'testData'
                }
            ],
            fileName: 'testData',
            status: HashStatus.CREATED
        }

        const responseValid: AdjustmentMessageReturn = {
            message: `ERROR - BAD VALIDATION PARTNER`,
            status: false
        }
        const userEmail = 'testData';

        jest
            .spyOn(domain as any, "_convertBufferToFilterData")
            .mockResolvedValue(bufferConvert);
        jest.spyOn(AdjustmentNoteDomainOrders.prototype, "getFileHash").mockResolvedValue(responseMongo);
        jest
            .spyOn(domain as any, "_validHashData")
            .mockResolvedValue(responseValid);
        jest
            .spyOn(RepositoryHash, "getAdjustmentNotesRepositoryByFileName")
            .mockResolvedValue(responseMongo as any);

        const response = await domain.createNewSettlement(file, fileName, userEmail);

        expect(response).toEqual(responseValid);
    });

    it("should handle errors in createNewSettlement", async () => {
        const file = Buffer.from("invalid data");
        const fileName = "testData";
        const userEmail = "testData";

        const adjustmentNoteDomain = new AdjustmentNoteDomainSettlements();

        await expect(
            adjustmentNoteDomain.createNewSettlement(file, fileName, userEmail)
        ).rejects.toThrow("Error creating new settlement");
    });

    it("should convert buffer to filter data correctly", async () => {
        const buffer = Buffer.from(
            JSON.stringify([
                {
                    "DOC. VENTA": "testData",
                    CLVT: "testData",
                    "ID DE CAMPAÑA": "testData",
                    "TASA DE INTERES": 0,
                    PLAZO: 0,
                    "ID TICKET": "testData",
                    "ID OPORTUNIDAD": "testData",
                    "CLIENTE/FIRMA": "testData",
                    "NOMBRE FIRMA": "testData",
                    "DOC. FAC.": "testData",
                    CLFAC: "testData",
                    "FECHA FACTURA": "testData",
                    STRF: "testData",
                    "SOC.": "testData",
                    "SOLIC.": "testData",
                    "CTA. CONTRATO": "testData",
                    "VALOR NETO SIN IVA": 0,
                    "IVA 19%": 0,
                    "VALOR NETO CON IVA": 0,
                    "N DOC": "testData",
                    REFERENCIA: "testData",
                    "CC CLIENTE": "testData",
                    "CONSECUTIVO LIQUIDACION PREVIA": "testData",
                    "CONSECUTIVO LIQUIDACION AJUSTE": "testData",
                    "NOTA DE AJUSTE": "testData",
                    "REFERENCIA 2": "testData",
                    OBSERVACION: "testData",
                    "TIPO DE NOTA DE AJUSTE": "testData",
                    "INCLUIR EN LIQUIDACION": "NO",
                },
            ])
        );

        const expectedData: AdjustmentPartnerWithoutSettlementNote[] = [
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
                include: "NO",
            },
        ];

        const domain = new AdjustmentNoteDomainSettlements();
        const result = await (domain as any)._convertBufferToFilterData(buffer);

        expect(result).toEqual(expectedData);
    });

    it("should handle errors during buffer conversion", async () => {
        const buffer = Buffer.from("invalid data");

        const domain = new AdjustmentNoteDomainSettlements();

        await expect(
            (domain as any)._convertBufferToFilterData(buffer)
        ).rejects.toThrow("Error al leer archivo de settlement");
    });

    it("should return adjustment notes", async () => {
        const options: GetAdjustmentViewOptions = {
            page: 1,
            limit: 10,
            fieldOrder: "creationDate",
            orderType: "desc",
            settlementId: "settlement123",
        };

        const mockResponse: AdjustmentNoteType[] = [
            {
                orders: 5,
                settlementId: "settlement123",
                state: "ACTIVE",
                creationDate: new Date("2024-01-01T00:00:00"),
                lastStatusDate: new Date("2024-01-02T00:00:00"),
            },
        ];

        jest
            .spyOn(AdjustmentNoteServiceSettlements.prototype, "getAdjustmentNotes")
            .mockResolvedValue(mockResponse);

        const adjustmentNoteDomain = new AdjustmentNoteDomainSettlements();
        const response = await adjustmentNoteDomain.getAdjustmentNotes(options);

        expect(response).toEqual(mockResponse);
    });

    it("should handle errors in getAdjustmentNotes", async () => {
        const options: GetAdjustmentViewOptions = {
            page: 1,
            limit: 10,
            fieldOrder: "creationDate",
            orderType: "desc",
            settlementId: "settlement123",
        };

        jest
            .spyOn(AdjustmentNoteServiceSettlements.prototype, "getAdjustmentNotes")
            .mockRejectedValue(new Error("Error fetching adjustment notes"));

        const adjustmentNoteDomain = new AdjustmentNoteDomainSettlements();

        await expect(
            adjustmentNoteDomain.getAdjustmentNotes(options)
        ).rejects.toThrow("Error fetching adjustment notes");
    });

    it("should validate _validHashData method", async () => {
        const fileHash: AdjustmentNoteHash = {
            fileName: "testData",
            signatures: [{ clientSignature: "testSignature", hash: "testHash" }],
            status: HashStatus.CREATED
        };

        const adjustmentNoteDataMongo: AdjustmentNoteHash = {
            signatures: [{ clientSignature: "testSignature", hash: "testHash" }],
            fileName: "testData",
            status: HashStatus.CREATED
        };

        const adjustmentNoteDomain = new AdjustmentNoteDomainSettlements();
        const response = await (adjustmentNoteDomain as any)._validHashData(
            fileHash,
            adjustmentNoteDataMongo
        );

        expect(response).toBe("SUCCESS");
    });

    it('should save new settlement correctly', async () => {
        const fileData: AdjustmentPartnerWithoutSettlementNote[] = [
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
                include: 'SI'
            }
        ];
        const fileName = 'testFile.xlsx';
        const settlementId = '02-0001-240101';

        jest.spyOn(AdjustmentNoteServiceSettlements.prototype, 'getLastConsecutive').mockResolvedValue(0);
        jest.spyOn(RepositorySettlements, 'getLastConsecutive').mockResolvedValue(0);
        jest.spyOn(AdjustmentNoteDomainSettlements.prototype as any, 'generateConsecutiveAdjustmentNote').mockResolvedValue(settlementId);
        jest.spyOn(AdjustmentNoteDomainSettlements.prototype as any, '_saveMongoRelation').mockResolvedValue('');
        jest.spyOn(AdjustmentNoteDomainSettlements.prototype as any, '_updatePostgresOrders').mockResolvedValue('');
        jest.spyOn(RepositorySettlements, 'createAdjustmentNoteSettlement').mockResolvedValue({} as any);
        jest.spyOn(RepositorySettlements, 'updatedSettlementBy').mockResolvedValue(true);
        jest.spyOn(RepositoryOrders, 'upsertManyAdjustmentNoteOrders').mockResolvedValue({} as any);

        const domain = new AdjustmentNoteDomainSettlements();
        const result = await (domain as any)._saveNewSettlementErrased(fileData, fileName);

        expect(result).toBe(settlementId);
    });

    it('should validate send email for aproval and update status', async () => {
        const settlementId = 'testData';

        jest.spyOn(SettlementService.prototype, 'getUserLineData').mockResolvedValue({copyEmail: ['test'], name: 'test', userEmail: 'test'});
        jest.spyOn(RepositoryOrders, 'getTotalBySettlement').mockResolvedValue([{ _id: 'testData' }] as any);
        jest.spyOn(RepositoryOrders, 'getTotalBySociety').mockResolvedValue([{ _id: 'testData' }] as any);

        jest.spyOn(RepositoryOrders, 'getAllDataSortByOpportunity').mockResolvedValue([{ consecutive: 0 }] as any);
        jest.spyOn(Xlsx, 'GenerateMultiviewXlsx').mockResolvedValue('testData');
        jest.spyOn(JWt, 'createToken').mockReturnValue('testData');
        jest.spyOn(TransversalService.prototype, 'sendEmail').mockResolvedValue(true);
        jest.spyOn(RepositorySettlements, 'updateStatusApprovalAdjustmentNoteSettlement').mockResolvedValue({ modifiedCount: 1 } as any);

        const domain = new AdjustmentNoteDomainSettlements();
        const result = await domain.approvalSettlementAdjustmentNote(settlementId);

        expect(result).toEqual(AdjustmentNoteStatus.APPROVAL);
    });

    it('should validate send email for aproval and update status with error', async () => {
        const settlementId = 'testData';

        jest.spyOn(SettlementService.prototype, 'getUserLineData').mockResolvedValue({copyEmail: ['test'], name: 'test', userEmail: 'test'});
        jest.spyOn(RepositoryOrders, 'getTotalBySettlement').mockResolvedValue([{ _id: 'testData' }] as any);
        jest.spyOn(RepositoryOrders, 'getTotalBySociety').mockResolvedValue([{ _id: 'testData' }] as any);
        jest.spyOn(AdjustmentNoteDomainDraft.prototype, 'getBufferExcelTotalBySettlement').mockResolvedValue('testData');
        jest.spyOn(JWt, 'createToken').mockReturnValue('testData');
        jest.spyOn(TransversalService.prototype, 'sendEmail').mockImplementation(()=> {
            throw new AppError({message: 'error'})
        });
        jest.spyOn(RepositorySettlements, 'updateStatusApprovalAdjustmentNoteSettlement').mockResolvedValue({ modifiedCount: 1 } as any);

        const domain = new AdjustmentNoteDomainSettlements();
        const result = await domain.approvalSettlementAdjustmentNote(settlementId);

        expect(result).toEqual('ERROR');
    });
})