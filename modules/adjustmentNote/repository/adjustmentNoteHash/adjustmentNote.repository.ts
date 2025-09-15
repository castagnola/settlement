import { AdjusmentNoteOrderModel } from "../../../../models/adjusmentNoteOrder";
import { AdjustmentNoteHash, AdjustmentNoteModel, HashStatus } from "../../../../models/adjustmentNoteHash";

export const createAdjustmentNotesRepository = async (settlement: AdjustmentNoteHash) => {
    return await AdjustmentNoteModel.create(settlement);
}

export const getAdjustmentNotesRepositoryByFileName = async (fileName: string) => {
    return await AdjustmentNoteModel.findOne(
        {
            fileName,
            status: HashStatus.CREATED
        }
    );
}

export const updateAdjustmentNoteHash = async (data: AdjustmentNoteHash) => {
    const result = await AdjustmentNoteModel.findOneAndUpdate(
        {
            fileName: data.fileName,
            status: HashStatus.CREATED
        },
        {
            $set: {
                status: HashStatus.USED
            }
        },
        { new: true }
    );

    return result;  
}

export const updateByFileName = async (fileName: string) => {
    return await AdjustmentNoteModel.findOneAndUpdate(
        {
            fileName: { $regex: new RegExp(fileName) },
        },
        {
            $set: {
                status: HashStatus.USED
            }
        },
        { new: true }
    );
}

export const getOpportunityByAdjustmentNote = async (documentNumber: string[], settlementId: string | null) => {
    return await AdjusmentNoteOrderModel.find(
        {
            adjustmentNote : { $in: documentNumber },
            $or: [
                { settlementId: { $exists: settlementId ? true : false } },
                { settlementId: null }
            ]
        },
        {
            opportunityId: 1,
            adjustmentNote: 1,
        }
    ).lean();
}
