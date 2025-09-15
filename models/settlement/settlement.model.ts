import { Schema, model } from 'vanti-utils/lib/mongoose'
import { Settlement, Status } from './settlement.type';

const SettlementSchema = new Schema<Settlement>(
    {
        status: { type: String, default: Status.PROCESING, enum: Status, required: true },
        settlementId: { type: String, unique: true, required: true },
        expirationTime: { type: Date, required: false }
    },
    {
        timestamps: true
    }
);


const settlementModel = model<Settlement>('Settlement', SettlementSchema);
settlementModel.syncIndexes();

export const SettlementModel = settlementModel;