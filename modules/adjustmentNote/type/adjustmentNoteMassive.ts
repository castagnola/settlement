export enum OrderValidationStatus {
    PENDING_INVOICING = 'PENDING_INVOICING',
    NON_EXIST_ORDER = 'NON_EXIST_ORDER',
    RELATION_EXIST = 'RELATION_EXIST',
    VALID = 'VALID',
    FILE_ERROR = 'FILE_ERROR',
    EMPTY_ORDES = 'EMPTY_ORDES',
}

export type OrderMassive = {
    id: number,
    amount: string,
    vat: string,
    totalAmount: string,
    datalakeDate: string,
    adjustmentNoteSettlementId: string,
    typeLoad: string,
    lastState: string,
    lastStateDate: string,
    orderAlliedId: number,
    orderAlliedDatalakeDate: string,
    StRF: string,
    createdAt: string,
    updatedAt: string,
    adjustmentType: string,
    documentNumber: string
    documentNumberAdjustmentNote?: string
}

export type OrderMassiveValidate = {
    ordersVantilisto: ValidateOrder[],
    ordersMassively: ValidateOrder[]
}

export type ValidateOrder = {
    documentNumber: string,
    documentClass: string,
    status: OrderValidationStatus
}

export type DocumentNumberToValidate = {
    ordersVantilisto: string[],
    ordersMassively: string[]
}

export type OrdersToSaveRelation = {
    vantilisto: string,
    adjusment_note: string
}

export const HeaderOrdersToAssingMassiveNote = [
    "PEDIDO ZP12",
    "NOTA DE AJUSTE",
];

export enum HeadersKeyOrdersToAssingMassiveNote {
    "PEDIDO ZP12" = "documentNumberToAssign",
    "NOTA DE AJUSTE" = "documentNumber",
}

export type ReturnFileData = {
    fileName: string,
    base64: string
}

export type AdjustmentNoteMassive = {
    documentNumber: string,
    documentNumberAdjustmentNote: string
};

export type AdjustmentNoteMassiveResponse = {
    save: boolean
    responseType: OrderValidationStatus
}