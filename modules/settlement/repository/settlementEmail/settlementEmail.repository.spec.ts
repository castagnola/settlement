import { describe, expect, it, jest, beforeAll } from '@jest/globals';
import { SettlementEmail, SettlementEmailStatusEnum } from "../../../../models/settlmentEmail/settlement.type";
import { SettlementEmailModel } from "../../../../models/settlmentEmail/settlement.model";
import { createSettlementEmail, getSettlementEmailById, updateSettlementEmailById } from './settlementEmail.repository'

describe("should validate SettlementEmailRepository", () => {
    it("should validate getSettlementEmailById", async () => {
        const id = 'testData'
        const settlementEmail: SettlementEmail = {
            collaboratorBp: 'testData',
            emailStatus: SettlementEmailStatusEnum.PENDING_CREATE,
            settlementId: 'testData',
            _id: 'testData'
        }

        jest.spyOn(SettlementEmailModel, 'findOne').mockResolvedValue(settlementEmail);

        const response = await getSettlementEmailById(id);

        expect(response).toEqual(settlementEmail);
    })

    it("should validate updateSettlementEmailById", async () => {
        const id = 'testData'
        const settlementEmail: SettlementEmail = {
            collaboratorBp: 'testData',
            emailStatus: SettlementEmailStatusEnum.PENDING_CREATE,
            settlementId: 'testData',
            _id: 'testData'
        }

        jest.spyOn(SettlementEmailModel, 'updateOne').mockResolvedValue({ acknowledged: true, modifiedCount: 1, matchedCount: 1 } as any);

        const response = await updateSettlementEmailById(id, settlementEmail);

        expect(response).toEqual({ acknowledged: true, modifiedCount: 1, matchedCount: 1 } as any);
    })

    it("should validate createSettlementEmail", async () => {
        const id = 'testData'
        const settlementEmail: SettlementEmail = {
            collaboratorBp: 'testData',
            emailStatus: SettlementEmailStatusEnum.PENDING_CREATE,
            settlementId: 'testData',
            _id: 'testData'
        }

        jest.spyOn(SettlementEmailModel, 'create').mockResolvedValue(settlementEmail as any);

        const response = await createSettlementEmail(settlementEmail);

        expect(response).toEqual(settlementEmail);
    })
})