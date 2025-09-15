import { Settlement, SettlementModel, Status } from "../../../models/settlement";

export const createSettlement = async (settlement: Settlement) => {
    return await SettlementModel.create(settlement);
}

export const updateSettlement = async (id: string, status: Status) => {
    return await SettlementModel.updateOne({ settlementId: id }, { status });
}

export const getSettlement = async (id: string) => {
    return await SettlementModel.findOne({settlementId: id});
}

export const updateExpirationTime = async (settlementId: string, date: Date): Promise<Settlement> => {
    return await SettlementModel.findOneAndUpdate(
        { settlementId },
        {
            $set: {
                expirationTime: date
            }
        },
        { new: true }
    )
}