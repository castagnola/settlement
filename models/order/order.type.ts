
export type Order = {
  type: string;
  collaboratorBp: string;
  collaboratorName: string;
  salesOrganization: string;
  contractAccount: string;
  documentClassZFM6: string;
  documentNumberZFM6: string;
  totalValueZFM6: number;
  campaignId: string;
  campaignName: string;
  rediscount: number;
  rediscountZFM6: number;
  vatCommission: number;
  rediscountZP12: number;
  documentClassZP12: string;
  documentNumberZP12: string;
  totalValueZP12: number;
  invoiceId?: string;
  accountingDocument?: string;
  no: string;
  ticketId: string;
  cufe?: string;
  oportunityId: string;
  sapStatus?: string;
  errorMessage?: string;
  errorType?: string;
  orderStatus: string;
  settlementId: string;
};

export type GetOrdersOptions = {
  field?: string;
  value?: string;
  state?: string;
  settlementId?: string;
  page?: number;
  limit?: number;
  dateRequest? : string;
  orderField?: string;
  orderType?: string;
  marked?: string;
  unmarked?: string;
  society?: string;
}