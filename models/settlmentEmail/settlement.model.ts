import { Schema, model } from 'vanti-utils/lib/mongoose'
import { SettlementEmail, SettlementEmailStatusEnum } from './settlement.type';

const SettlementEmailSchema = new Schema<SettlementEmail>(
    {
        settlementId: { type: String, required: true },
        collaboratorBp: { type: String, required: true },
        emailStatus: { type: String, default: SettlementEmailStatusEnum.PENDING_CREATE, enum: SettlementEmailStatusEnum, required: true },
    },
    {
        timestamps: true
    }
);


const settlementEmailModel = model<SettlementEmail>('SettlementEmails', SettlementEmailSchema);
settlementEmailModel.syncIndexes();

export const SettlementEmailModel = settlementEmailModel;