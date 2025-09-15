import { Schema, model } from 'vanti-utils/lib/mongoose';
import { AdjustmentNoteHashMassive, HashStatusMassive } from './index';

const AdjustmentNoteHashMassiveSchema = new Schema<AdjustmentNoteHashMassive>(
    {
        hash: { type: String, required: true },
        fileName: { type: String, required: true },
        status: { type: String, enum: HashStatusMassive }
    },
    {
        timestamps: true
    }
);


const adjustmentNoteHashMassiveModel = model<AdjustmentNoteHashMassive>('AdjustmentNoteHashMassive', AdjustmentNoteHashMassiveSchema);
adjustmentNoteHashMassiveModel.syncIndexes();

export const AdjustmentNoteHashMassiveModel = adjustmentNoteHashMassiveModel;