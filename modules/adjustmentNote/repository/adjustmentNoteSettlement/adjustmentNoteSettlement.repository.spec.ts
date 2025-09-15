import { AdjusmentNoteOrderModel } from "../../../../models/adjusmentNoteOrder";
import { AdjustmentNoteSettlement, AdjustmentNoteSettlementModel, AdjustmentNoteStatus } from "../../../../models/adjustmentNoteSettlement";
import * as repository from "./adjustmentNoteSettlement.repository"
import { jest } from "@jest/globals";

jest.mock('../../../../models/adjustmentNoteSettlement')
jest.mock("vanti-utils/lib", () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn()
    }
}));

describe("AdjustmentNoteSettlement Service", () => {
    const date = new Date();
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should return the total count of adjustment notes settlements", async () => {

        jest.spyOn(AdjustmentNoteSettlementModel, "countDocuments").mockResolvedValue(5);

        const total = await repository.getTotalAdjustmentNotesSettlement("12345", "02/2024");

        expect(total).toBe(5);
        expect(AdjustmentNoteSettlementModel.countDocuments).toHaveBeenCalledWith(
            expect.objectContaining({ settlementId: "12345", createdAt: expect.any(Object) })
        );
    });

    it("should validate getAdjustmentNotesSettlement", async () => {
        const page = 1;
        const limit = 1;
        const date = new Date();

        const settlementResponse: AdjustmentNoteSettlement[] = [
            {
                lastState: {
                    createdAt: date,
                    status: AdjustmentNoteStatus.APPROVED,
                    updatedAt: date,
                    message: 'test'
                },
                settlementId: 'testData',
                createdAt: date,
                updatedAt: date,
                statusHistory: [
                    {
                        createdAt: date,
                        status: AdjustmentNoteStatus.APPROVED,
                        updatedAt: date,
                        message: 'test'
                    }
                ],
                owner: 'test'
            }
        ];

        const expectedFormattedResponse = [
            {
                settlementId: "testData",
                creationDate: date,
                lastStatusDate: date,
                orders: 1,
                state: AdjustmentNoteStatus.APPROVED,
                message: 'test'
            }
        ];

        jest.spyOn(AdjustmentNoteSettlementModel, 'find').mockImplementation(() => ({
            sort: () => ({
                skip: () => ({
                    limit: () => Promise.resolve(settlementResponse)
                })
            })
        }) as any);
        jest.spyOn(AdjustmentNoteSettlementModel, "countDocuments").mockResolvedValue(1);
        jest.spyOn(AdjusmentNoteOrderModel, "countDocuments").mockResolvedValue(1);

        const result = await repository.getAdjustmentNotesSettlement(page, limit);

        expect(result).toEqual({
            data: {
                total: 1,
                resultAdjustmentNotesSettlement: expectedFormattedResponse
            }
        });
    });

    it("should validate updatedSettlementBy", async () => {
        const settlementId: string = '02-testData';
        const user: string = 'test@test';

        jest.spyOn(AdjustmentNoteSettlementModel, 'findOneAndUpdate').mockResolvedValue({} as any);

        const result = await repository.updatedSettlementBy(settlementId, user);

        expect(result).toBeTruthy();
    })

});
