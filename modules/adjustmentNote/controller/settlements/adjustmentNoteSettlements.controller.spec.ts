import request from "supertest";
import app from "../../../../config/app";
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { AuthService } from "../../../auth/services/auth.service";
import { AdjustmentNoteDomainSettlements } from "../../domain";

const { PREFIX } = process.env;

const token =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVzIjpbImluc3RhbGxlcl9zaWduYXR1cmUiXX0sImlhdCI6MTY5NDExNTczMX0.Axip9JUiJ2_-MVLNMhR8CJ5RXuBR0aQ4QGoj7GYh0Ks";

describe("shoudl validate settlement adjustmen note controller", () => {

    beforeEach(() => {
        jest.spyOn(AuthService.prototype, "validateToken").mockResolvedValue(true);
    });

    it("Debería obtener liquidaciones ajustes con éxito", async () => {
        // Configuración
        const options = { limit: "10", page: "1" };
        const expectedResponse = [
            {
                orders: 10,
                settlementId: "settlement123",
                state: "ACTIVE",
            },
        ];
        jest
            .spyOn(AdjustmentNoteDomainSettlements.prototype, "getAdjustmentNotes")
            .mockResolvedValue(expectedResponse);

        // Ejecución
        const response = await request(app)
            .get(PREFIX + "/api/adjustment-note/settlements")
            .query(options)
            .set("Authorization", token);

        // Verificación
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 200, data: expectedResponse });
    });

    it("should validate send adjustmentNoteSettlement for aproval", async () => {
        // Configuración
        const settlementId = "02-000001-2025";

        jest
            .spyOn(AdjustmentNoteDomainSettlements.prototype, "approvalSettlementAdjustmentNote")
            .mockResolvedValue('SUCCESS');

        // Ejecución
        const response = await request(app)
            .get(
                `${PREFIX}/api/adjustment-note/approval-settlement/${settlementId}`
            )
            .set("Authorization", token);

        // Verificación
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 200,
            data: 'SUCCESS',
        });
    });
})