import { describe, expect, it } from "@jest/globals";
import { Settlement, SettlementModel, Status } from "../../../models/settlement";
import { createSettlement, getSettlement, updateExpirationTime, updateSettlement } from "./settlement.repository";


describe("should validate repository", () => {
    it("should validate createSettlement", async () => {
        const settlement: Settlement = {
            settlementId: 'testData',
            status: Status.CREATED
        } 
        const settlementData = { 
            _id: 'testData',
            status: Status.CREATED,
            settlementId: 'testData'
         }
        jest.spyOn(SettlementModel, 'create').mockResolvedValue(settlementData as any);
        const response = await createSettlement(settlement);
        expect(response).toEqual(settlementData)
    })

    it("should validate updateSettlement", async () => {
        const settlementId = 'testData'
        const settlementData = { 
            status: Status.PROCESING,
            settlementId: 'testData'
         }
        jest.spyOn(SettlementModel, 'updateOne').mockResolvedValue(settlementData as any);
        const response = await updateSettlement(settlementId, Status.PROCESING);
        expect(response).toEqual(settlementData)
    })

    it("should validate getSettlement", async () => {
        const settlementId = 'testData'
        const settlementData = { 
            status: Status.CREATED,
            settlementId: 'testData'
         }
        jest.spyOn(SettlementModel, 'findOne').mockResolvedValue(settlementData);
        const response = await getSettlement(settlementId);
        expect(response).toEqual(settlementData)
    })

    it("should validate updateExpirationTime", async () => {
        const settlementId = '03-testData';
        const date = new Date();
        const Settlement = {
            expirationTime: date,
            settlementId: 'testData',
        }

        jest.spyOn(SettlementModel, 'findOneAndUpdate').mockResolvedValue(Settlement);

        const response = await updateExpirationTime(settlementId, date);
        expect(response).toEqual(Settlement);
    })
})