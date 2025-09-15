export type AdjustmentNoteHash = {
    signatures: SignaturesHash[],
    fileName: string,
    status: HashStatus
}

export type SignaturesHash = { 
    clientSignature: string,
    hash: string,
}

export enum HashStatus {
    CREATED = 'CREATED',
    USED = 'USED'
}