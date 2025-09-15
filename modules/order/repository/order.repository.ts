import { OrderModel } from "../../../models/order";
import { Order } from '../type/order.type';
import { Settlement, SettlementModel, Status } from '../../../models/settlement';

export const insertManyOrders = async (data: Order[]) => {
    let update = await OrderModel.insertMany(
        data
    );
    return update
}

export const createSettlement = async () => {
    let settlementToSave = new SettlementModel;
    return await settlementToSave.save();
}

export const findSettlement = async () => {
    return await SettlementModel.findOne({ status: Status.CREATED });
}

export const updateSettlement = async (settlement: Partial<Settlement>, updateData: Partial<Settlement>) => {
    try {
        const updatedSettlement = await SettlementModel.findByIdAndUpdate<Settlement>(
            settlement,
            { $set: updateData },
            { new: true } // Esto devuelve el documento actualizado
        );
        return updatedSettlement;
    } catch (error) {
        console.error("Error updating settlement: ", error);
        throw error;
    }
};

