import request from "supertest";
import app from "../../../../config/app";
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { AuthService } from "../../../auth/services/auth.service";
import { AdjustmentNoteDomainOrders } from "../../domain";

const { PREFIX } = process.env;

const token =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVzIjpbImluc3RhbGxlcl9zaWduYXR1cmUiXX0sImlhdCI6MTY5NDExNTczMX0.Axip9JUiJ2_-MVLNMhR8CJ5RXuBR0aQ4QGoj7GYh0Ks";

describe("shoudl validate settlement adjustmen orders controller", () => {

    beforeEach(() => {
        jest.spyOn(AuthService.prototype, "validateToken").mockResolvedValue(true);
    });

    it("should validate orders", async () => {
        const expectedResponse = 2;

        jest.spyOn(AdjustmentNoteDomainOrders.prototype, "getOrdersToNewSettlement")
            .mockResolvedValue("SUCCESS");
        jest.spyOn(AdjustmentNoteDomainOrders.prototype, "getCountAdjustmentNotesToNewSettlement")
            .mockResolvedValue(expectedResponse);

        const response = await request(app)
            .get(PREFIX + "/api/adjustment-note/orders")
            .set("Authorization", token);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 200, data: expectedResponse });
    });

})