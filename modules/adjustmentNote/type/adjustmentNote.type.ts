export type AdjustmentNoteType = {
  orders?: number;
  settlementId?: string;
  state?: string;
  creationDate?: Date;
  lastStatusDate?: Date;
};

export type GetAdjustmentViewOptions = {
  dateRequest?: string;
  page?: number;
  limit?: number;
  fieldOrder?: string;
  orderType?: string;
  settlementId?: string;
};

export type GetPaginatedResults = {
  firmName: string;
  clientSignature: string;
  cxcClient: number;
  cxcSignature: number;
  totalGeneral: number;
};

export type TotalBySociety = {
  firmName: string;
  clientSignature: string;
  totalClient: number;
  totalSignature: number;
  totalSettlement: number;
};

export type AdjustmentPartnerWithoutSettlementNote = {
  id: number;
  salesOrderCustomer: string;
  documentClass: string;
  campaingId: string;
  interestRate: number;
  quotas: number;
  ticket: string;
  oportunityId: string;
  collaboratorIdentification: string;
  collaboratorName: string;
  accountingDocument: string;
  ClFac: string;
  invoicedDate: string;
  StRF: string;
  society: string;
  clientBp: string;
  contractAccount: string;
  value: number;
  vatCommission: number;
  rebateTotal: number;
  invoiceId: string;
  idRediscountInvoice: string;
  customerIdentification: string;
  pre_settlement: string;
  settlement: string;
  adjustmentNote: string;
  adjustmenReference: string;
  remarks: string;
  adjustmentNoteType: string;
  include: string;
  noteType?: string;
};

export type GetAdjustmentNotesSettlement = {
  settlementId: string;
  creationDate: Date;
  lastStatusDate: Date;
  orders: number;
  state: string;
}

export type GetAdjustmentNotesSettlementResponse = {
  data: {
    total: number;
    resultAdjustmentNotesSettlement: GetAdjustmentNotesSettlement[];
  };
};

export const HeaderSettlementNoteReportGeneral = [
  "DOC. VENTA",
  "CLVT",
  "ID DE CAMPAÑA",
  "TASA DE INTERES",
  "PLAZO",
  "ID TICKET",
  "ID OPORTUNIDAD",
  "CLIENTE/FIRMA",
  "NOMBRE FIRMA",
  "DOC. FAC.",
  "CLFAC",
  "FECHA FACTURA",
  "STRF",
  "SOC.",
  "SOLIC.",
  "CTA. CONTRATO",
  "VALOR NETO SIN IVA",
  "IVA 19%",
  "VALOR NETO CON IVA",
  "N DOC",
  "REFERENCIA",
  "CC CLIENTE",
  "CONSECUTIVO LIQUIDACION PREVIA",
  "CONSECUTIVO LIQUIDACION AJUSTE",
  "NOTA DE AJUSTE",
  "REFERENCIA 2",
  "OBSERVACION",
  "TIPO DE NOTA DE AJUSTE",
  "INCLUIR EN LIQUIDACION",
];

export enum HeaderKeyValueSettlementNoteReportGeneral {
  "DOC. VENTA" = "salesOrderCustomer",
  "CLVT" = "documentClass",
  "ID DE CAMPAÑA" = "campaingId",
  "TASA DE INTERES" = "interestRate",
  "PLAZO" = "quotas",
  "ID TICKET" = "ticket",
  "ID OPORTUNIDAD" = "oportunityId",
  "CLIENTE/FIRMA" = "collaboratorIdentification",
  "NOMBRE FIRMA" = "collaboratorName",
  "DOC. FAC." = "accountingDocument",
  "CLFAC" = "ClFac",
  "FECHA FACTURA" = "invoicedDate",
  "STRF" = "StRF",
  "SOC." = "society",
  "SOLIC." = "clientBp",
  "CTA. CONTRATO" = "contractAccount",
  "VALOR NETO SIN IVA" = "value",
  "IVA 19%" = "vatCommission",
  "VALOR NETO CON IVA" = "rebateTotal",
  "N DOC" = "invoiceId",
  "REFERENCIA" = "idRediscountInvoice",
  "CC CLIENTE" = "customerIdentification",
  "CONSECUTIVO LIQUIDACION PREVIA" = "pre_settlement",
  "CONSECUTIVO LIQUIDACION AJUSTE" = "settlement",
  "NOTA DE AJUSTE" = "adjustmentNote",
  "REFERENCIA 2" = "adjustmenReference",
  "OBSERVACION" = "remarks",
  "TIPO DE NOTA DE AJUSTE" = "adjustmentNoteType",
  "INCLUIR EN LIQUIDACION" = "include",
}

export enum headerKeyBySociety {
  "NOMBRE FIRMA" = "firmName",
  "CLIENTE/FIRM" = "clientSignature",
  "CXC CLIENTE" = "totalCliente",
  "CXC FIRMA" = "totalFirma",
  "TOTAL GENERAL" = "totalLiquidacion",
}

export enum allHeaderKeys {
  "DOC.VENTA" = "salesDocument",
  "CLVT" = "salesClient",
  "ID DE CAMPAÑA" = "campaignId",
  "TASA DE INTERÉS" = "interestRate",
  "PLAZO" = "term",
  "ID TICKET" = "ticketId",
  "ID OPORTUNIDAD" = "opportunityId",
  "FUNC." = "function",
  "CLIENTE/FIRMA" = "clientSignature",
  "NOMBRE FIRMA" = "firmName",
  "DOC.FACT." = "invoiceDocument",
  "CLFAC" = "invoiceClient",
  "STRF" = "statusRf",
  "SOC." = "society",
  "SOLIC." = "request",
  "CTA.CONTRATO" = "contractAccount",
  "VALOR NETO SIN IVA" = "netValueWithoutVat",
  "IVA 19%" = "vat19",
  "VALOR NETO CON IVA" = "netValueWithVat",
  "Nº DOC." = "documentNumber",
  "REFERENCIA" = "reference",
  "CC CLIENTE" = "clientCc",
  "CONSECUTIVO LIQUIDACION PREVIA" = "previousSettlementConsecutive",
  "CONSECUTIVO LIQUIDACION AJUSTE" = "adjustmentSettlementConsecutive",
  "NOTA DE AJUSTE" = "adjustmentNote",
  "REFERENCIA 2" = "secondaryReference",
  "OBSERVACIÓN" = "observation",
  "TIPO DE NOTA DE AJUSTE" = "adjustmentNoteType",
  "INCLUIR EN LIQUIDACION" = "includeInSettlement",
}

export type AdjustmentMessageReturn = {
  message: string;
  status: boolean;
}

export enum AdjustmentNoteOrderStatusPostgres {
  CREATED = 'CREATED',
  BLOCK = 'BLOCK'
}

export enum SettlementStateEnum {
  CREATED = 'CREATED',
  INVOICED = 'INVOICED',
  PROCESS_BILLING = 'PROCESS_BILLING',
  BILLING_ERROR = 'BILLING_ERROR',
  SETTLED_CLEARED = 'SETTLED_CLEARED',
  APPROVED_SETTLED = 'APPROVED_SETTLED',
  SETTLEMENT_REJECTED = 'SETTLEMENT_REJECTED',
  PENDING_APROVAL = 'PENDING_APROVAL'
}

export type SettlementFilter = {
  page: number,
  limit: number,
  society: string,
}

export type AdjustmentNoteMongo = {
  id: number;
  salesDocument: string;
  salesClient: string;
  campaignId: string;
  interestRate: number;
  term: number;
  ticketId: string;
  opportunityId: string;
  clientSignature: string;
  firmName: string;
  invoiceDocument: string;
  invoiceClient: string;
  invoiceDate: string;
  statusRf: string;
  society: string;
  request: string;
  contractAccount: string;
  netValueWithoutVat: number;
  vat19: number;
  netValueWithVat: number;
  documentNumber: string;
  reference: string;
  clientCc: string;
  previousSettlementConsecutive: string;
  adjustmentSettlementConsecutive: string;
  adjustmentNote: string;
  secondaryReference: string;
  observation: string;
  adjustmentNoteType: string;
  includeInSettlement: string;
  noteType: string;
};

export type AdjustmentNoteByChunks = {
  adjustmentNotedocumentNumber: string;
  includeSettlement: string;
}