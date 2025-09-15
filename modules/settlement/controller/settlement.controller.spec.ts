import request from "supertest";
import app from "../../../config/app";
import { SettlementDomain } from "../domain/settlement.domain";
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { AuthService } from "../../auth/services/auth.service";
import { ResponseCheckSettlement, SettlementStateEnum, UpdateSettlementState, ApiCoreResponse, UserLineData } from "../type/settlement.type";
import { Status } from "../../../models/settlement";
import { HttpCode, ResponseApi } from "vanti-utils/lib";
import { SettlementService } from "../service/settlement.service";
const { PREFIX } = process.env;

const token =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVzIjpbImluc3RhbGxlcl9zaWduYXR1cmUiXX0sImlhdCI6MTY5NDExNTczMX0.Axip9JUiJ2_-MVLNMhR8CJ5RXuBR0aQ4QGoj7GYh0Ks";

describe("SettlementController", () => {
  beforeEach(() => {
    jest.spyOn(AuthService.prototype, "validateToken").mockResolvedValue(true);
  });

  it("should return settlements list", async () => {
    const mockResponse = [
      {
        settlementId: "string",
        classType: "string",
        creationDate: "string",
        lastStatusDate: "any",
        orders: "any",
        state: "string",
      },
    ];
    jest
        .spyOn(SettlementDomain.prototype, "getSettlements")
        .mockResolvedValue(mockResponse);

    const response = await request(app)
        .get(PREFIX + "/api/vantilisto/settlements")
        .query({ limit: "10", page: "1", settlementId: "123" })
        .set("Authorization", token);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 200, data: mockResponse });
  });

  it("should validate check-settlement/:settlementId COMPLETED", async () => {
    const returnData: ResponseCheckSettlement = {
      status: Status.COMPLETED,
      validate: true
    };
    const responseApi: ResponseApi<any> = {
      data: true,
      status: HttpCode.OK
    }

    jest.spyOn(SettlementDomain.prototype, 'checkSettlemnt').mockResolvedValue(returnData)

    const response = await request(app)
        .get(PREFIX + "/api/vantilisto/check-settlement/123")
        .set("Authorization", token);

    expect(response.body).toEqual(responseApi)
  })

  it("should validate check-settlement/:settlementId PROCESING", async () => {
    const returnData: ResponseCheckSettlement = {
      status: Status.PROCESING,
      validate: false
    };
    const responseApi: ResponseApi<any> = {
      data: Status.PROCESING,
      status: HttpCode.ACCEPTED
    }

    jest.spyOn(SettlementDomain.prototype, 'checkSettlemnt').mockResolvedValue(returnData)

    const response = await request(app)
        .get(PREFIX + "/api/vantilisto/check-settlement/123")
        .set("Authorization", token);

    expect(response.body).toEqual(responseApi)
  })

  it("should validate check-settlement/:settlementId BILLING_ERROR", async () => {
    const returnData: ResponseCheckSettlement = {
      status: Status.BILLING_ERROR,
      validate: false
    };
    const responseApi: ResponseApi<any> = {
      data: false,
      status: HttpCode.OK
    }

    jest.spyOn(SettlementDomain.prototype, 'checkSettlemnt').mockResolvedValue(returnData)

    const response = await request(app)
        .get(PREFIX + "/api/vantilisto/check-settlement/123")
        .set("Authorization", token);

    expect(response.body).toEqual(responseApi)
  })

  it("should valiidate update-settlement/:settlementId", async () => {
    const responseApi: ResponseApi<string> = {
      data: "true",
      status: HttpCode.OK
    }

    jest.spyOn(SettlementDomain.prototype, 'updateSettlement').mockResolvedValue("true")

    const response = await request(app)
        .put(PREFIX + "/api/vantilisto/update-settlement/123")
        .send({ status: "COMPLETED", user: {email: 'testData'} })
        .set("Authorization", token);

    expect(response.body).toEqual(responseApi)
  })

  it("should validate approval-settlement", async () => {
    const settlementId: string = 'testData';
    const responseApi: ResponseApi<string> = {
      data: SettlementStateEnum.PENDING_APROVAL,
      status: HttpCode.OK
    }

    jest.spyOn(SettlementDomain.prototype, 'approvalSettlement').mockResolvedValue(SettlementStateEnum.PENDING_APROVAL);
    const response = await request(app)
        .get(PREFIX + "/api/vantilisto/approval-settlement/"+settlementId)
        .set("Authorization", token);

    expect(response.body).toEqual(responseApi)
  })

  it("should validate email-report", async () => {
    const dataResponse = 'testData@gm.com';
    const responseApi: ResponseApi<string> = {
      data: dataResponse!,
      status: HttpCode.OK
    }
    const userLineResponse: UserLineData = {
      copyEmail: ['testData'],
      name: 'testData',
      userEmail: 'testData@gm.com'
    } 

    jest.spyOn(SettlementService.prototype, 'getUserLineData').mockResolvedValue(userLineResponse);

    const response = await request(app)
        .get(PREFIX + "/api/vantilisto/email-report")
        .set("Authorization", token);

    expect(response.body).toEqual(responseApi)
  })

  it("should validate approver-review/:settlementId", async ()=>{
    const settlementId: string = '01-123'
    const updateData: UpdateSettlementState = {
      status: SettlementStateEnum.APPROVED_SETTLED,
      message: 'testData'
    }
    const responseDomain: ApiCoreResponse = {
      data: "SUCCESS",
      status: HttpCode.OK
    };

    const responseApi: ResponseApi<string> = {
      data: responseDomain.data,
      status: HttpCode.OK
    }

    jest.spyOn(SettlementDomain.prototype, 'UpdateSettlementStatus').mockResolvedValue(responseDomain);

    const response = await request(app)
        .put(PREFIX + "/api/vantilisto/approver-review/01-123")
        .set("Authorization", token)
        .send(updateData);

    expect(response.body).toEqual(responseApi);
  })
});