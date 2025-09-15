import { Schema, model } from 'vanti-utils/lib/mongoose';
import { AdjustmentNoteSettlement, AdjustmentNoteStatus } from './adjustmentNoteSettlement.type';

const AdjustmentNoteSettlementSchema = new Schema<AdjustmentNoteSettlement>(
    {
        settlementId: { type: String, unique: true, required: true },
        createdAt: { type: Date, required: true, default: Date.now },
        updatedAt: { type: Date, required: true, default: Date.now },
        lastState: {
            status: { type: String, default: AdjustmentNoteStatus.PROCESS, enum: AdjustmentNoteStatus },
            createdAt: { type: Date },
            updatedAt: { type: Date},
            message: { type: String, required: false }
        },
        statusHistory: [{
            status: { type: String, default: AdjustmentNoteStatus.PROCESS, enum: AdjustmentNoteStatus },
            createdAt: { type: Date },
            updatedAt: { type: Date },
            message: { type: String, required: false }
        }],
        consecutive: { type: Number, required: false },
        owner: { type: String, required: false },
        approver: { type: String, required: false },
        updatedBy: { type: String, required: false },
        expirationDate: { type: Date, required: false },
    },
    {
        timestamps: true
    }
);

const adjustmentNoteSettlementModel = model<AdjustmentNoteSettlement>('AdjustmentNoteSettlement', AdjustmentNoteSettlementSchema);
adjustmentNoteSettlementModel.syncIndexes();

export const AdjustmentNoteSettlementModel = adjustmentNoteSettlementModel;
