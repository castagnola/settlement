import { Schema, model } from 'vanti-utils/lib/mongoose'

//********************* types *************************//
import {
  Order
} from './order.type';

const OrderSchema = new Schema<Order>(
  {
    type: { type: String, required: true },
    collaboratorBp: { type: String, required: true },
    collaboratorName: { type: String, required: true },
    salesOrganization: { type: String, required: true },
    contractAccount: { type: String, required: true },
    documentClassZFM6: { type: String, required: true },
    documentNumberZFM6: { type: String, required: true },
    totalValueZFM6: { type: Number, required: true },
    campaignId: { type: String, required: true },
    campaignName: { type: String, required: true },
    rediscount: { type: Number, required: true },
    rediscountZFM6: { type: Number, required: true },
    vatCommission: { type: Number, required: true },
    rediscountZP12: { type: Number, required: true },
    documentClassZP12: { type: String, required: true },
    documentNumberZP12: { type: String, required: true },
    totalValueZP12: { type: Number, required: true },
    invoiceId: { type: String },
    accountingDocument: { type: String },
    no: { type: String, required: true },
    ticketId: { type: String, required: true },
    cufe: { type: String },
    oportunityId: { type: String, required: true },
    sapStatus: { type: String },
    errorMessage: { type: String },
    errorType: { type: String },
    orderStatus: { type: String, required: true },
    settlementId: { type: String, required: true },
  },
  { timestamps: true }
);

const orderModel = model<Order>('Order', OrderSchema);
orderModel.syncIndexes();

export const OrderModel = orderModel;