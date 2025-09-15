import {
  AdjustmentNoteSettlementModel,
  ApprovedStatus,
} from "../../../../models/adjustmentNoteSettlement";

export const updateAjusmentSettlement = async (
  settlementId: string,
  status: ApprovedStatus,
  userEmail: string,
  message?: string
) => {
  const now = new Date();
  const lastState: any = {
    status: status,
    createdAt: now,
    updatedAt: now,
  };

  if (message) {
    lastState.message = message;
  }

  const updateData: any = {
    $set: { lastState, approver: userEmail },
    $push: {
      statusHistory: {
        status: status,
        createdAt: now,
        updatedAt: now,
        ...(message && { message }),
      },
    },
  };

  const updatedSettlement =
    await AdjustmentNoteSettlementModel.findOneAndUpdate(
      { settlementId },
      updateData,
      { new: true }
    );

  return updatedSettlement;
};

export const getBySettlementId = async (settlementId: string) => {
  return AdjustmentNoteSettlementModel.findOne({ settlementId }, { _id: 0, createdAt: 1, "lastState.status": 1 });
};
