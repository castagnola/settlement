import { ApprovedStatus } from "src/models/adjustmentNoteSettlement";

export interface IApproverDomainInterface {
    /**
     * Method to update approver status
     * @param settlementId 
     * @param status 
     */
    updateApproverStatus(settlementId: string, status: ApprovedStatus, userEmail: string, message?: string);
}