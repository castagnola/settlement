import { OdersAdjustmentNote } from "src/modules/settlement/type/settlement.type";
import { AdjusmentNoteOrder, AdjusmentNoteOrderModel } from "../../../../models/adjusmentNoteOrder";
import { AdjustmentNoteByChunks, AdjustmentNoteMongo, GetPaginatedResults, TotalBySociety } from "../../type/adjustmentNote.type";
import { AppError } from "vanti-utils/lib";

export async function getPaginatedResults(
    society: string,
    settlementId: string,
    page = 1,
    limit = 1
): Promise<{ total: number; data: GetPaginatedResults[] }> {
    try {
        const [results, total] = await Promise.all([AdjusmentNoteOrderModel.aggregate([
            {
                $match: {
                    society: society,
                    settlementId: settlementId,
                },
            },
            {
                $addFields: {
                    isZFM: { $regexMatch: { input: "$salesClient", regex: "^ZFM" } },
                    isZP: { $regexMatch: { input: "$salesClient", regex: "^ZP" } },
                },
            },
            {
                $group: {
                    _id: "$clientSignature",
                    firmName: { $first: "$firmName" },
                    clientSignature: { $first: "$clientSignature" },
                    cxcClient: {
                        $sum: {
                            $cond: { if: "$isZFM", then: "$netValueWithVat", else: 0 },
                        },
                    },
                    cxcSignature: {
                        $sum: { $cond: { if: "$isZP", then: "$netValueWithVat", else: 0 } },
                    },
                },
            },
            {
                $addFields: {
                    totalGeneral: {
                        $sum: ["$cxcClient", "$cxcSignature"],
                    },
                },
            },
            { $sort: { firmName: 1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    firmName: 1,
                    clientSignature: 1,
                    cxcClient: 1,
                    cxcSignature: 1,
                    totalGeneral: 1,
                },
            },
        ]),
        getTotalCount(society, settlementId),
        ]);

        return { total, data: results };
    } catch (error) {
        log.error("Error executing aggregation:", error);
        throw new Error("Failed to fetch data");
    }
}

export async function getTotalCount(society: string, settlementId: string): Promise<number> {
    try {
        const result = await AdjusmentNoteOrderModel.aggregate([
            {
                $match: { society: society, settlementId: settlementId }
            },
            {
                $group: { _id: "$clientSignature" }
            },
            {
                $count: "total"
            }
        ]);

        return result.length > 0 ? result[0].total : 0;
    } catch (error) {
        log.error("Error counting total unique clientSignature:", error);
        throw new Error("Failed to count unique clientSignature");
    }
}

export async function getTotalBySociety(
    society: string,
    settlementId: string
): Promise<TotalBySociety> {
    try {
        const result = await AdjusmentNoteOrderModel.aggregate([
            {
                $match: {
                    society: society,
                    settlementId: settlementId,
                },
            },
            {
                $addFields: {
                    isZFM: { $regexMatch: { input: "$salesClient", regex: "^ZFM" } },
                    isZP: { $regexMatch: { input: "$salesClient", regex: "^ZP" } },
                },
            },
            {
                $group: {
                    _id: null,
                    totalCliente: {
                        $sum: {
                            $cond: { if: "$isZFM", then: "$netValueWithVat", else: 0 },
                        },
                    },
                    totalFirma: {
                        $sum: {
                            $cond: {
                                if: "$isZP",
                                then: "$netValueWithVat",
                                else: 0,
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    totalLiquidacion: { $sum: ["$totalCliente", "$totalFirma"] },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalCliente: 1,
                    totalFirma: 1,
                    totalLiquidacion: 1,
                },
            },
        ]);
        return result[0];
    } catch (error) {
        log.error("Error counting documents:", error);
        throw new Error("Failed to count documents");
    }
}

export async function getTotalBySettlement(
    society: string,
    settlementId: string
): Promise<TotalBySociety[]> {
    try {
        const results = await AdjusmentNoteOrderModel.aggregate([
            {
                $match: {
                    society: society,
                    settlementId: settlementId,
                },
            },
            {
                $addFields: {
                    isZFM: { $regexMatch: { input: "$salesClient", regex: "^ZFM" } },
                    isZP: { $regexMatch: { input: "$salesClient", regex: "^ZP" } },
                },
            },
            {
                $group: {
                    _id: "$clientSignature",
                    firmName: { $first: "$firmName" },
                    clientSignature: { $first: "$clientSignature" },
                    totalCliente: {
                        $sum: {
                            $cond: { if: "$isZFM", then: "$netValueWithVat", else: 0 },
                        },
                    },
                    totalFirma: {
                        $sum: { $cond: { if: "$isZP", then: "$netValueWithVat", else: 0 } },
                    },
                },
            },
            {
                $addFields: {
                    totalLiquidacion: {
                        $sum: ["$totalCliente", "$totalFirma"],
                    },
                },
            },
            { $sort: { firmName: 1 } },
            {
                $project: {
                    _id: 0,
                    firmName: 1,
                    clientSignature: 1,
                    totalCliente: 1,
                    totalFirma: 1,
                    totalLiquidacion: 1,
                },
            },
        ]);

        return results;
    } catch (error) {
        log.error("Error executing aggregation:", error);
        throw new Error("Failed to fetch data");
    }
}

export async function getAllDataSortByOpportunity(settlementId: string) {
    try {
        const result = await AdjusmentNoteOrderModel.find({ settlementId }).sort({
            opportunityId: 1,
        });
        return result;
    } catch (error) {
        log.error("Error counting documents:", error);
        throw new Error("Failed to count documents");
    }
}

export async function updateFileOrder(
    salesDocument: string,
    fileName: string,
    include: string,
    settlementId?: string
): Promise<void> {
    try {
        const update = {
            $set: {
                includeInSettlement: include,
                settlementId: settlementId || null
            },
            $push: {
                fileHistory: {
                    fileName,
                    include,
                    type: "LOAD"
                }
            }
        };
        await AdjusmentNoteOrderModel.updateMany({ salesDocument, settlementId: null }, update);

        log.info(`Se actualizaron los documentos con salesDocument "${salesDocument}"`);
    } catch (error) {
        log.error("Error updating file order:", error);
        throw new Error("Failed to update file order");
    }
}

export async function updateOrdersByFile(
    salesDocument: string,
    fileName: string,
    include: string,
    settlementId?: string
): Promise<void> {
    try {
        const update = {
            $set: {
                includeInSettlement: include,
                settlementId: settlementId || null
            },
            $push: {
                fileHistory: {
                    fileName,
                    include,
                    type: "LOAD"
                }
            }
        };
        log.info("Data to update %s: ", JSON.stringify(update));
        await AdjusmentNoteOrderModel.updateMany({ adjustmentNote: salesDocument, settlementId }, update);

        log.info(`Se actualizaron los documentos con salesDocument "${salesDocument}"`);
    } catch (error) {
        log.error("Error updating file order:", error);
        throw new Error("Failed to update file order");
    }
}

export async function upsertManyAdjustmentNoteOrders(data: any[], fileName: string): Promise<void> {
    try {
        const bulkInsertOps = data.map(item => ({
            updateOne: {
                filter: { salesDocument: item.salesDocument },
                update: {
                    $setOnInsert: {
                        ...item,
                    }
                },
                upsert: true
            }
        }));

        if (bulkInsertOps.length > 0) {
            await AdjusmentNoteOrderModel.bulkWrite(bulkInsertOps);
        }

        const bulkUpdateOps = data.map(item => ({
            updateOne: {
                filter: { salesDocument: item.salesDocument },
                update: {
                    $set: { fileName },
                    $push: { fileHistory: { fileName, include: item.includeInSettlement, type: 'SYSTEM' } }
                }
            }
        }));

        if (bulkUpdateOps.length > 0) {
            await AdjusmentNoteOrderModel.bulkWrite(bulkUpdateOps);
        }

        log.info(`[upsertManyAdjustmentNoteOrders] Se insertaron/actualizaron ${data.length} documentos`);
    } catch (error) {
        log.error("Error upserting documents orders:", error);
        throw new Error(`Failed to upsert documents ${error}`);
    }
}

export const getOrdersBySettlementId = async (settlementId: string): Promise<OdersAdjustmentNote[]> => {
    const orders = await AdjusmentNoteOrderModel.find(
        { settlementId },
        { salesClient: 1, salesDocument: 1 }
    );

    return orders.map(({ salesClient, salesDocument }) => ({
        orderClass: salesClient,
        orderNumber: salesDocument
    })) as OdersAdjustmentNote[];
};

export async function getTotalOrders(settlementId: string): Promise<number> {
    try {
        const count = await AdjusmentNoteOrderModel.countDocuments({ settlementId, includeInSettlement: "SI" });
        return count;
    } catch (error) {
        log.error("Error counting total orders:", error);
        throw new Error("Failed to count total orders");
    }
}

export async function findOrdersBySettlementId(settlementId: string): Promise<AdjustmentNoteMongo[]> {
    try {
        return await AdjusmentNoteOrderModel.find({ settlementId: settlementId, includeInSettlement: "SI" });
    } catch (error) {
        log.error("Error obteniendo órdenes por settlementId:", error);
        throw new Error("Failed to get orders by settlementId");
    }
}

export const findBySettlementId = async (settlementId: string): Promise<AdjusmentNoteOrder> => {
    return AdjusmentNoteOrderModel.findOne({ settlementId });
};

export async function updateOrdersFileBySettlement(settlementId: string, fileName: string): Promise<void> {
    try {
        const result = await AdjusmentNoteOrderModel.updateMany(
            { settlementId, includeInSettlement: "SI" },
            {
                $set: { fileName },
                $push: { fileHistory: { fileName, include: "SI", type: "LOAD" } }
            }
        );

        log.info(`[updateOrdersFileBySettlement] Se actualizaron ${result.modifiedCount} documentos con settlementId "${settlementId}"`);
    } catch (error) {
        log.error("[updateOrdersFileBySettlement] - Error actualizando fileName y fileHistory por settlementId:", error);
        throw new Error("Failed to update orders file by settlementId");
    }
}

export async function validateSettlementNullBySalesDocument(salesDocument: string[]): Promise<boolean> {
    try {
        const result = await AdjusmentNoteOrderModel.findOne({
            salesDocument: { $in: salesDocument },
            settlementId: { $ne: null }
        });

        return !result;
    } catch (error) {
        log.error(`[validateSettlementNullBySalesDocument] Error al consultar ordenes ${error.message}`)
        throw new AppError({ message: `Failed to find orders` })
    }
}

export async function updateAllOrdersByFilename(fileName: string, includeInSettlement: string, settlementId: string): Promise<void> {
    await AdjusmentNoteOrderModel.updateMany(
        { fileName, includeInSettlement },
        {
            $set: {
                settlementId
            }
        }
    );
}

export async function getOrdersByFileName(fileName: string, includeInSettlement: string): Promise<AdjustmentNoteByChunks[]> {
    const orderTemp = await AdjusmentNoteOrderModel.find({ fileName, includeInSettlement }, { adjustmentNote: 1, includeInSettlement: 1 });
    return orderTemp.map(item => ({
        adjustmentNotedocumentNumber: item.adjustmentNote,
        includeSettlement: item.includeInSettlement
    }));
}

export async function getOrderByClient(settlementId: string, clientSignature: string) {
    try {
        log.info("Buscando datos para el colaborador especificado: %s en la liquidación: %s", clientSignature, settlementId);
        const result = await AdjusmentNoteOrderModel.findOne({ settlementId, clientSignature });
        return result;
    } catch (error) {
        log.error("Error counting documents:", error);
        throw new Error("Failed find collaborator");
    }

}