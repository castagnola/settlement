import { describe, expect, it, jest } from "@jest/globals";
import { HttpCode, ResponseApi } from "vanti-utils/lib";
import request from "supertest";
import app from "../../../config/app";
import * as JWT from '../../../helpers/jwt/jwt';
import { ValidateDomain } from "../domain";
import { ValidateEmailResponse } from "../type/validate.type";
import { AuthService } from "../../auth/services/auth.service";
const { PREFIX } = process.env;

const token =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVzIjpbImluc3RhbGxlcl9zaWduYXR1cmUiXX0sImlhdCI6MTY5NDExNTczMX0.Axip9JUiJ2_-MVLNMhR8CJ5RXuBR0aQ4QGoj7GYh0Ks";

describe("should validate validate controller", () => {

  it("should validate /approval-token", async () => {
      const dataResponse = 'SUCCESS';
      const responseApi: ResponseApi<string> = {
        data: dataResponse,
        status: HttpCode.OK
      }
  
      jest.spyOn(JWT, 'verifyToken').mockResolvedValue({user: 'testData'})
  
      const response = await request(app)
      .get(PREFIX + "/api/validate/approval-token")
      .set("Authorization", token);
  
      expect(response.body).toEqual(responseApi)
  })

  it("should validate email-approval", async () => {
    const dataResponse = 'SUCCESS';
    const responseApi: ResponseApi<string> = {
      data: dataResponse,
      status: HttpCode.OK
    }
    const responseDomain: ValidateEmailResponse = {
      valid: true,
      date: dataResponse
    }

    jest.spyOn(AuthService.prototype, "validateToken").mockResolvedValue(true);
    jest.spyOn(ValidateDomain.prototype, 'validEmailApprove').mockResolvedValue(responseDomain)

    const response = await request(app)
    .get(PREFIX + "/api/validate/email-approval/123")
    .set("Authorization", token);

    expect(response.body).toEqual(responseApi)
  })

  it("should validate email-approval bad", async () => {
    const dataResponse = "You don't have permissions for the request";
    const responseApi = {
      data: dataResponse,
      status: HttpCode.UNAUTHORIZED
    }

    const responseDomain: ValidateEmailResponse = {
      valid: false,
      date: dataResponse
    }

    jest.spyOn(ValidateDomain.prototype, 'validEmailApprove').mockResolvedValue(responseDomain)

    const response = await request(app)
    .get(PREFIX + "/api/validate/email-approval/123")
    .set("Authorization", token);

    expect(response.body).toEqual(responseApi)
  })
})