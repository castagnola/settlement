import { Schema, model } from 'vanti-utils/lib/mongoose'

//********************* types *************************//
import {
  SettlementAdjustment
} from './adjustmentNote.type';

const OrderSchema = new Schema<SettlementAdjustment>(
  {
    salesDocument: { type: String, required: true },
    salesClient: { type: String, required: true },
    campaignId: { type: String, required: true },
    interestRate: { type: String, required: true },
    term: { type: String, required: true },
    ticketId: { type: String, required: true },
    opportunityId: { type: String, required: true },
    function: { type: String, required: true },
    clientSignature: { type: String, required: true },
    firmName: { type: String, required: true },
    invoiceDocument: { type: String, required: true },
    invoiceClient: { type: String, required: true },
    invoiceDate: { type: Date, required: true },
    statusRf: { type: String, required: true },
    society: { type: String, required: true },
    request: { type: String, required: true },
    contractAccount: { type: String, required: true },
    netValueWithoutVat: { type: Number, required: true },
    vat19: { type: Number, required: true },
    netValueWithVat: { type: Number, required: true },
    documentNumber: { type: String, required: true },
    reference: { type: String, required: true },
    clientCc: { type: String, required: true },
    previousSettlementConsecutive: { type: String, required: true },
    adjustmentSettlementConsecutive: { type: String, required: true },
    adjustmentNote: { type: String, required: true },
    secondaryReference: { type: String, required: true },
    observation: { type: String, required: true },
    adjustmentNoteType: { type: String, required: true },
    includeInSettlement: { type: String, required: true },
  },
  { timestamps: true }
);

const orderModel = model<SettlementAdjustment>('Order', OrderSchema);
orderModel.syncIndexes();

export const OrderModel = orderModel;