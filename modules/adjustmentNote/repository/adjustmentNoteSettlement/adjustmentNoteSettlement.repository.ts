import { AdjusmentNoteOrderModel } from "../../../../models/adjusmentNoteOrder";
import { AdjustmentNoteSettlementModel, AdjustmentNoteStatus } from "../../../../models/adjustmentNoteSettlement";
import { GetAdjustmentNotesSettlementResponse } from "../../type/adjustmentNote.type";

export async function getTotalAdjustmentNotesSettlement(settlementId?: string, dateRequest?: string): Promise<number> {
    try {
        const matchFilter: Record<string, any> = {};

        if (settlementId) {
            matchFilter.settlementId = settlementId;
        }

        if (dateRequest) {
            const [month, year] = dateRequest.split("/");
            if (month && year) {
                const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
                const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));
                matchFilter.createdAt = { $gte: startDate, $lt: endDate };
            }
        }

        return await AdjustmentNoteSettlementModel.countDocuments(matchFilter);
    } catch (error) {
        log.error("Error executing query getTotalAdjustmentNotesSettlement", error);
        throw new Error("Failed to fetch total count");
    }
}

export async function getAdjustmentNotesSettlement(
    page: number,
    limit: number,
    settlementId?: string,
    dateRequest?: string,
    orderType: "ASC" | "DESC" = "DESC",
    fieldOrder: string[] = []
): Promise<GetAdjustmentNotesSettlementResponse> {
    try {
        const sortOrder = orderType === "ASC" ? 1 : -1;

        // Mapeo de los filtros al nombre real en la base de datos
        const fieldMapping: Record<string, string> = {
            creationDate: "createdAt",
            settlementId: "settlementId",
            state: "lastState.status",
            lastStatusDate: "updatedAt"
        };

        // Filtrar solo los campos válidos para evitar errores en la consulta
        const validFieldOrders = fieldOrder.filter(field => fieldMapping[field]);

        // Construcción del objeto de ordenación basado en los filtros recibidos
        const sortFields = validFieldOrders.reduce((acc, field) => {
            const mappedField = fieldMapping[field];
            if (mappedField) {
                acc[mappedField] = sortOrder;
            }
            return acc;
        }, {} as Record<string, 1 | -1>);

        // Inicialización del filtro de búsqueda
        const matchFilter: Record<string, any> = {};

        // Filtrar por settlementId si se proporciona
        if (settlementId) {
            matchFilter.settlementId = settlementId;
        }

        // Filtrar por createdAt (fecha de creación)
        if (dateRequest) {
            const [month, year] = dateRequest.split("/");
            if (month && year) {
                const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
                const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

                matchFilter.createdAt = { $gte: startDate, $lt: endDate };
            }
        }

        matchFilter["lastState.status"] = { $not: { $eq: "APPROVED" } };

        const [results, total] = await Promise.all([

            AdjustmentNoteSettlementModel.find(matchFilter, {
                    settlementId: 1,
                    createdAt: 1,
                    "lastState.createdAt": 1,
                    "lastState.status": 1
                })
                    .sort(Object.keys(sortFields).length ? sortFields : { createdAt: sortOrder })
                    .skip((page - 1) * limit )
                    .limit(limit),
            getTotalAdjustmentNotesSettlement(settlementId, dateRequest)
        ]);
        const formattedResults = await Promise.all(
            results.map(async item => {
                const quantityOrders = await AdjusmentNoteOrderModel.countDocuments({
                    settlementId: { $regex: item.settlementId, $options: "i" }
                })
                return {
                    settlementId: item.settlementId,
                    creationDate: item.createdAt,
                    lastStatusDate: item.lastState.createdAt,
                    orders: quantityOrders,
                    state: item.lastState.status,
                    ...(item.lastState.message && { message: item.lastState.message })
                }
            }))
        return {
            data: { total, resultAdjustmentNotesSettlement: formattedResults }
        };
    } catch (error) {
        log.error("Error executing query getAdjustmentNotesSettlement", error);
        throw new Error("Failed to fetch data");
    }
    
}

export async function getLastConsecutive(): Promise<number> {
    try {
        const result = await AdjustmentNoteSettlementModel.aggregate([
            { $group: { _id: null, maxConsecutive: { $max: "$consecutive" } } }
        ]);
        return result.length > 0 ? result[0].maxConsecutive : 0;
    } catch (error) {
        log.error("Error getting last consecutive:", error);
        throw new Error("Failed to get last consecutive");
    }
}

export async function createAdjustmentNoteSettlement(data: any): Promise<void> {
    try {
        await AdjustmentNoteSettlementModel.create(data);
    } catch (error) {
        log.error("Error creating document adjustment note settlemet:", error);
        throw new Error(`Error creating document adjustment note settlemet: ${error}`);
    }
}

export const updateStatusApprovalAdjustmentNoteSettlement = async (settlementId: string, status: AdjustmentNoteStatus, expirationDate: Date) => {
    const now = new Date();
    return await AdjustmentNoteSettlementModel.updateOne(
        {
            settlementId
        },
        {
            $set: {
                lastState: {
                    status: status,
                    createdAt: now,
                    updatedAt: now
                },
                updatedAt: now,
                expirationDate
            },
            $push: {
                statusHistory: {
                    status: status,
                    createdAt: now,
                    updatedAt: now
                }
            }
        }
    )
}

export async function validSettlementExist(settlementId: string): Promise<boolean> {
    const settlement = await AdjustmentNoteSettlementModel.findOne({ settlementId }).exec();
    if (!settlement) {
        return false;
    }
    return settlement?.lastState?.status != AdjustmentNoteStatus.APPROVED;
}

export async function getStatusSettlement(settlementId: string): Promise<AdjustmentNoteStatus> {
    const settlement = await AdjustmentNoteSettlementModel.findOne({ settlementId }).exec();
    const currentDate = new Date();
    const expirationDate = settlement?.expirationDate;
    if (expirationDate && expirationDate < currentDate) {
        return AdjustmentNoteStatus.PROCESS;
    } else {
        return settlement?.lastState?.status || AdjustmentNoteStatus.APPROVAL;
    }
}

export async function updatedSettlementBy(settlementId: string, user: string): Promise<boolean> {
    const result = await AdjustmentNoteSettlementModel.findOneAndUpdate(
        {
            settlementId
        },
        {
            $set: {
                updatedBy: user
            }
        }
    )

    return !!result;
}