import { AdjusmentNoteOrderModel } from "../../../../models/adjusmentNoteOrder";
import { getPaginatedResults, getTotalBySociety, getTotalBySettlement, getAllDataSortByOpportunity } from "./adjustmentNoteOrder.repository"

jest.mock("../../../../models/adjusmentNoteOrder", () => ({
    AdjusmentNoteOrderModel: {
        aggregate: jest.fn(),
        find: jest.fn()
    }
}));

jest.mock("vanti-utils/lib", () => ({
    logger: {
        error: jest.fn()
    }
}));

describe("getPaginatedResults", () => {
    it("Debe devolver resultados paginados junto con el total de registros.", async () => {
        const mockData = [
            { firmName: "Firma 1", clientSignature: "123", cxcCliente: 1000 }
        ];
        const mockTotal = [{ total: 42 }];

        (AdjusmentNoteOrderModel.aggregate as jest.Mock)
            .mockReturnValueOnce(Promise.resolve(mockData))
            .mockReturnValueOnce(Promise.resolve(mockTotal));

        const result = await getPaginatedResults("sociedad1", "settlementId", 1, 1);

        expect(result).toEqual({
            total: 42,
            data: mockData,
        });

        expect(AdjusmentNoteOrderModel.aggregate).toHaveBeenCalledTimes(2); // Ahora se llaman 2 consultas
    });

    it("Debe devolver 0 total si no hay registros en la base de datos.", async () => {
        const mockData: any[] = [];
        const mockTotal: any[] = []; // No hay registros

        (AdjusmentNoteOrderModel.aggregate as jest.Mock)
            .mockReturnValueOnce(Promise.resolve(mockData))
            .mockReturnValueOnce(Promise.resolve(mockTotal));

        const result = await getPaginatedResults("sociedad1", "settlementId", 1, 1);

        expect(result).toEqual({
            total: 0,
            data: [],
        });

        expect(AdjusmentNoteOrderModel.aggregate).toHaveBeenCalledTimes(2);
    });
});

describe("getTotalBySociety", () => {
    it("Debe devolver valores totales para una sociedad.", async () => {
        const mockData = [{ totalCliente: 5000, totalFirma: 3000, totalLiquidacion: 2000 }];
        AdjusmentNoteOrderModel.aggregate = jest.fn().mockReturnValueOnce(Promise.resolve(mockData));

        const result = await getTotalBySociety("sociedad1", "settlementId");
        expect(result).toEqual(mockData[0]);
        expect(AdjusmentNoteOrderModel.aggregate).toHaveBeenCalledTimes(1);
    });
});

describe("getTotalBySettlement", () => {
    it("Debe devolver valores totales para un settlement.", async () => {
        const mockData = [
            { firmName: "Firma 1", clientSignature: "123", totalCliente: 5000, totalFirma: 3000, totalLiquidacion: 2000 }
        ];
        AdjusmentNoteOrderModel.aggregate = jest.fn().mockReturnValueOnce(Promise.resolve(mockData));

        const result = await getTotalBySettlement("sociedad1", "settlementId");
        expect(result).toEqual(mockData);
        expect(AdjusmentNoteOrderModel.aggregate).toHaveBeenCalledTimes(1);
    });
});

describe("getAllDataSortByOpportunity", () => {
    it("Debe devolver todos los datos ordenados por opportunityId.", async () => {
        const mockData = [
            { opportunityId: 1, data: "data1" },
            { opportunityId: 2, data: "data2" }
        ];
        AdjusmentNoteOrderModel.find = jest.fn().mockReturnValueOnce({ sort: jest.fn().mockReturnValueOnce(Promise.resolve(mockData)) });

        const result = await getAllDataSortByOpportunity('testData');
        expect(result).toEqual(mockData);
        expect(AdjusmentNoteOrderModel.find).toHaveBeenCalledTimes(1);
    });
});

