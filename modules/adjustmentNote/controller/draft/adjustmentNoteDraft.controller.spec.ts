import request from "supertest";
import app from "../../../../config/app";
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { AuthService } from "../../../auth/services/auth.service";
import { AdjustmentNoteDomainDraft } from "../../domain";
import { AdjustmentNoteStatus } from "../../../../models/adjustmentNoteSettlement";
import { GetAdjustmentNotesSettlement, GetAdjustmentNotesSettlementResponse } from "../../type/adjustmentNote.type";
import { HttpCode, ResponseApi } from "vanti-utils/lib";

const { PREFIX } = process.env;

const token =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVzIjpbImluc3RhbGxlcl9zaWduYXR1cmUiXX0sImlhdCI6MTY5NDExNTczMX0.Axip9JUiJ2_-MVLNMhR8CJ5RXuBR0aQ4QGoj7GYh0Ks";

describe("shoudl validate settlement adjustmen draft controller", () => {

    beforeEach(() => {
        jest.spyOn(AuthService.prototype, "validateToken").mockResolvedValue(true);
    });

    it("Debería obtener los totales de liquidaciones por sociedad", async () => {
        const settlementId = "02-000001-2025";
        const society = "15";
        const expectedResponse = {
            firmName: "Empresa XYZ",
            clientSignature: "231233131",
            totalClient: 10000,
            totalSignature: 5000,
            totalSettlement: 15000,
        };

        jest
            .spyOn(AdjustmentNoteDomainDraft.prototype, "getTotalBySociety")
            .mockResolvedValue(expectedResponse);

        // Ejecución
        const response = await request(app)
            .get(
                `${PREFIX}/api/adjustment-note/draft/settlement-society-totals/${settlementId}`
            )
            .query({ society })
            .set("Authorization", token);

        // Verificación
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 200,
            data: { resultTotal: expectedResponse },
        });
    });

    it("should send settlement review successfully", async () => {
        const settlementId = "settlement123";
        const expectedResponse = true;

        jest
            .spyOn(AdjustmentNoteDomainDraft.prototype, "getDetailsSettlement")
            .mockResolvedValue(expectedResponse);

        const response = await request(app)
            .get(
                `${PREFIX}/api/adjustment-note/draft/send-settlement-review/${settlementId}`
            )
            .set("Authorization", token);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 200,
            data: { result: expectedResponse },
        });
    });

    it("Debería obtener los resultados paginados de liquidaciones por sociedad", async () => {
        // Configuración
        const settlementId = "02-000001-2025";
        const society = "15";
        const page = "1";
        const limit = "20";
        const expectedResponse = {
            resultPaginated: {
                total: 1, // Ajustado a la estructura esperada
                data: [
                    {
                        firmName: "Empresa XYZ",
                        clientSignature: "Juan Pérez",
                        cxcClient: 5000,
                        cxcSignature: 3000,
                        totalGeneral: 8000,
                    },
                ],
            },
            statusSettlement: AdjustmentNoteStatus.APPROVED, // Ensure this matches the AdjustmentNoteStatus enum
        };

        jest
            .spyOn(AdjustmentNoteDomainDraft.prototype, "getPaginatedResults")
            .mockResolvedValue(expectedResponse);

        // Ejecución
        const response = await request(app)
            .get(
                `${PREFIX}/api/adjustment-note/draft/settlement-society/${settlementId}`
            )
            .query({ society, page, limit })
            .set("Authorization", token);

        // Verificación
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 200,
            data: expectedResponse,
        });
    });

    it("should validate /draft/settlements", async () => {
        const query = {
            page: 1,
            limit:10,
            settlementId: '01-testData',
            dateRequest: 'testData',
            orderType: 'ASC',
            fieldOrder: 'testData'
        }
        const responseDomain: GetAdjustmentNotesSettlementResponse = {
            data: {
                total: 1,
                resultAdjustmentNotesSettlement: [
                    {
                        creationDate: '2025-04-28T21:00:21.644Z' as any,
                        lastStatusDate: '2025-04-28T21:00:21.644Z' as any,
                        orders: 123,
                        settlementId: 'testData',
                        state: 'testData'
                    }
                ]
            }
        }

        const responseApi: ResponseApi<any> = {
            data: responseDomain,
            status: HttpCode.OK
        }

        jest.spyOn(AdjustmentNoteDomainDraft.prototype, 'getAdjustmentNotesSettlement').mockResolvedValue(responseDomain);

        const response = await request(app)
            .get(
                `${PREFIX}/api/adjustment-note/draft/settlements`
            )
            .query(query)
            .set("Authorization", token);

        expect(response.body.status).toEqual(responseApi.status)
    })
})