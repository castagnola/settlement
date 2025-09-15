export type AdjustmentNoteHashMassive = {
    fileName: string,
    hash: string,
    status: HashStatusMassive
}

export enum HashStatusMassive {
    CREATED = 'CREATED',
    USED = 'USED'
}