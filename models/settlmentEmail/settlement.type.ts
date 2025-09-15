export type SettlementEmail = {
    settlementId: string,
    collaboratorBp: string,
    emailStatus: SettlementEmailStatusEnum,
    _id?: string,
}

export enum SettlementEmailStatusEnum {
    SEND_OK = 'SEND_OK',
    PENDING_CREATE = 'PENDING_CREATE',
    ERROR_CREATE = 'ERROR_CREATE',
    ERROR_SEND = 'ERROR_SEND',
    NOT_EMAILS = 'NOT_EMAILS'
}