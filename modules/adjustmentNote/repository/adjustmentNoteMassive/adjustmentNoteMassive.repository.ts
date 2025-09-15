import { AdjustmentNoteHashMassive, AdjustmentNoteHashMassiveModel } from "../../../../models/adjustmentNoteHashMassive";

export const getLastUpload = async () => {
  return await AdjustmentNoteHashMassiveModel.findOne(
    {status: 'USED'},
    { createdAt: 1, updatedAt: 1, _id: 0 }
  ).sort({ createdAt: -1 });
};

export const saveMassiveHash = async (hash: AdjustmentNoteHashMassive) => {
    return await AdjustmentNoteHashMassiveModel.create(hash);
}

export const getMassiveHash = async (fileName: string) => {
  const fixedFileName = Buffer.from(fileName, 'latin1').toString('utf8');
  const nameWithoutExtension = fixedFileName.split('.')[0];

  const hash = await AdjustmentNoteHashMassiveModel.findOne(
    { fileName: { $regex: `^${nameWithoutExtension}`, $options: 'i' } },
    { hash: 1, _id: 0 }
  );
  return hash;
};
