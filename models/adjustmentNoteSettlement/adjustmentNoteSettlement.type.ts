export enum AdjustmentNoteStatus {
    PROCESS = 'PROCESS',
    REVIEW = 'REVIEW',
    APPROVAL = 'APPROVAL',
    APPROVED = 'APPROVED'
}

export enum ApprovedStatus {
    SETTLEMENT_REJECTED = 'REVIEW',
    APPROVED_SETTLED = 'APPROVED',
}

export type AdjustmentNoteSettlement = {
    settlementId: string;
    createdAt?: Date;
    updatedAt?: Date;
    consecutive?: number;
    lastState: {
        status: AdjustmentNoteStatus;
        createdAt: Date;
        updatedAt: Date;
        message?: string;
    };
    statusHistory: {
        status: AdjustmentNoteStatus;
        createdAt: Date;
        updatedAt: Date;
        message?: string;
    }[];
    owner?: string;
    approver?: string;
    updatedBy?: string;
    expirationDate?: Date;
};
