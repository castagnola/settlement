import { expect, it, describe, jest } from "@jest/globals";
import { AppError, Axios, ResponseApi } from "vanti-utils/lib";
jest.mock('vanti-utils/lib');
import { AdjustmentNoteServiceSettlements } from "./adjustmentNoteSettlements.service"
import { GetAdjustmentViewOptions } from "../../type/adjustmentNote.type";
import { AdjustmentNoteStatus } from "../../../../models/adjustmentNoteSettlement";
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

describe("should validate settlements services", () => {

    jest.mock('vanti-utils/lib', () => ({
        Axios: {
            get: jest.fn(),
        },
        AppError: jest.fn().mockImplementation((error: { message: string }) => {
            const appError = new Error(error.message);
            appError.name = 'AppError';
            return appError;
        }),
    }));

    beforeAll(() => {
        process.env.URI_SETTLEMENT_CORE = 'http://localhost:2000/test/api'; 
    });

    it('should validate update settlement status', async () => {
        const settlementId = 'settlement';

        const responseApi: ResponseApi<boolean> = {
            data: true,
            status: 200
        }

        mockedAxios.put.mockResolvedValue({data: responseApi, status: 200});
        jest.spyOn(Axios, 'put').mockResolvedValue({data: responseApi, status: 200});

        const service = new AdjustmentNoteServiceSettlements();
        const result = await service.updateSettlementStatus(settlementId, AdjustmentNoteStatus.APPROVAL);
        expect(result).toBe(true);
    });

    it('should validate update settlement status error', async () => {
        const settlementId = 'settlement';

        const responseApi: ResponseApi<boolean> = {
            data: true,
            status: 500
        }

        mockedAxios.put.mockResolvedValue({data: responseApi, status: 500});
        jest.spyOn(Axios, 'put').mockResolvedValue({data: responseApi, status: 500});

        const service = new AdjustmentNoteServiceSettlements();
        try {
            await service.updateSettlementStatus(settlementId, AdjustmentNoteStatus.APPROVAL);
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
        }
    })

    it('should validate update settlement status try catch', async () => {
        const settlementId = 'settlement';

        mockedAxios.put.mockRejectedValue(new Error('error'));
        jest.spyOn(Axios, 'put').mockRejectedValue(new Error('error'));

        const service = new AdjustmentNoteServiceSettlements();
        try {
            await service.updateSettlementStatus(settlementId, AdjustmentNoteStatus.APPROVAL);
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
        }
    })

})