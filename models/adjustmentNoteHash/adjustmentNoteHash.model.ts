import { Schema, model } from 'vanti-utils/lib/mongoose';
import { AdjustmentNoteHash, HashStatus, SignaturesHash } from './index';

const SignaturesHashSchema = new Schema<SignaturesHash>(
    {
        clientSignature: { type: String, required: true },
        hash: { type: String, required: true },
    }
)

const AdjustmentNoteHashSchema = new Schema<AdjustmentNoteHash>(
    {
        signatures: { type: [SignaturesHashSchema], required: true },
        fileName: { type: String, required: true },
        status: { type: String, enum: HashStatus }
    },
    {
        timestamps: true
    }
);


const adjustmentNoteModel = model<AdjustmentNoteHash>('AdjustmentNoteHash', AdjustmentNoteHashSchema);
adjustmentNoteModel.syncIndexes();

export const AdjustmentNoteModel = adjustmentNoteModel;