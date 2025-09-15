import {OrderClassEnum} from "../../modules/order/type/order.type";

export type Settlement = {
    status?: Status,
    settlementId?: string,
    expirationTime?: Date, 
};

export enum Status {
    CREATED = 'CREATED',
    PROCESING = 'PROCESING',
    WITHOUT_PARTNER = 'WITHOUT_PARTNER',
    PROCESS_BILLING = 'PROCESS_BILLING',
    INVOICED = 'INVOICED',
    BILLING_ERROR = 'BILLING_ERROR',
    COMPLETED = 'COMPLETED',
    ASSIGNED = 'ASSIGNED'
}

export type NewSettlement = {
    serviceType: string,
    dateRequest: Date,
    unbilling: string[],
    duplicates: OrderNoteType[],
    withoutPartner: OrderNoteType[],
    bill: OrderNoteType[]
}

export type OrderNoteType = {
    order: string,
    note?: string
    classType?: OrderClassEnum
}