import { Schema, model } from "vanti-utils/lib/mongoose";

//********************* types *************************//
import { AdjusmentNoteOrder, FileHistory } from "./adjusmentNoteOrder.type";

const fileHistorySchema = new Schema<FileHistory>(
  {
    fileName: { type: String, required: true },
    include: { type: String, required: true },
    type: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

const AdjusmentNoteOrderSchema = new Schema<AdjusmentNoteOrder>(
  {
    salesDocument: { type: String, required: true, unique: true },
    salesClient: { type: String, required: true },
    campaignId: { type: String, required: true },
    interestRate: { type: String },
    term: { type: String },
    ticketId: { type: String },
    opportunityId: { type: String, required: true },
    clientSignature: { type: String, required: true },
    firmName: { type: String },
    invoiceDocument: { type: String },
    invoiceClient: { type: String, required: false },
    invoiceDate: { type: Date, required: true },
    statusRf: { type: String },
    society: { type: String, required: true },
    request: { type: String },
    contractAccount: { type: String },
    netValueWithoutVat: { type: Number, required: true },
    vat19: { type: Number },
    netValueWithVat: { type: Number, required: true },
    documentNumber: { type: String },
    reference: { type: String },
    clientCc: { type: String },
    previousSettlementConsecutive: { type: String, required: true },
    adjustmentSettlementConsecutive: { type: String, required: false },
    adjustmentNote: { type: String },
    secondaryReference: { type: String },
    observation: { type: String },
    adjustmentNoteType: { type: String },
    includeInSettlement: { type: String },
    fileName: { type: String, required: false },
    fileHistory: { type: [fileHistorySchema], required: false },
    settlementId: { type: String, required: false },
  },
  {
    timestamps: true,
    collection: "adjustmentnoteorder",
  }
);

const adjusmentNoteOrderModel = model<AdjusmentNoteOrder>(
  "AdjustmentNoteOrder",
  AdjusmentNoteOrderSchema
);
adjusmentNoteOrderModel.syncIndexes();

export const AdjusmentNoteOrderModel = adjusmentNoteOrderModel;
