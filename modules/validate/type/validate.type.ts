export type ValidateEmailResponse = {
    valid: boolean,
    date?: string
} 

export type SettlementBasicData = {
    settlementId: string,
    creationDate: string,
    classType: string,
    lastStatusDate: string,
    orders: string,
    state: string
}

export type SettlementListResponse = {
    settlements: SettlementBasicData[],
    total: number
}