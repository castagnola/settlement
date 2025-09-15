export type AdjusmentNoteOrder = {
    salesDocument: string;
    salesClient: string;
    campaignId: string;
    interestRate: string;
    term: string;
    ticketId: string;
    opportunityId: string;
    function: string;
    clientSignature: string;
    firmName: string;
    invoiceDocument: string;
    invoiceClient: string;
    invoiceDate: Date;
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
    settelemnetId?: string;
    fileHistory: FileHistory[];
    fileName?: string;
    consecutive?: number;
    settlementId?: string;
};

export type FileHistory = {
    fileName: string;
    include: string;
    type: string;
}