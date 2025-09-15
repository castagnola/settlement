import { IApproverDomainInterface } from "./approver.interface";
import { AdjustmentNoteStatus, ApprovedStatus } from "../../../../models/adjustmentNoteSettlement";
import { getBySettlementId, updateAjusmentSettlement } from "../../repository/adjustmentNoteSettlement/settlement.repository";
import { getOrdersBySettlementId } from "../../../../modules/adjustmentNote/repository/adjustmentNoteOrder/adjustmentNoteOrder.repository";
import { SettlementService } from "../../service/settlement.service";
import { AdjusmentNoteApprover } from "../../type/settlement.type";
import { AppError } from "vanti-utils/lib";

export class ApproverDomain implements IApproverDomainInterface {
	async updateApproverStatus(settlementId: string, status: ApprovedStatus, userEmail: string, message?: string) {
		try {
			const adjustedStatus = status as unknown as AdjustmentNoteStatus;
			const statusConvert = ApprovedStatus[adjustedStatus];
			const settlement = await getBySettlementId(settlementId);

			if (settlement.lastState?.status === AdjustmentNoteStatus.APPROVED) {
				return { status: 400, data: AdjustmentNoteStatus.APPROVED };
			}

			if (statusConvert === AdjustmentNoteStatus.APPROVED) {
				const settlementService = new SettlementService();
				const { createdAt } = await getBySettlementId(settlementId);
				const orders = await getOrdersBySettlementId(settlementId);
				const body: AdjusmentNoteApprover = {settlement: {createDate: createdAt, state: status}, orders };
				await settlementService.approveSettlement(settlementId, body);
			}
			await updateAjusmentSettlement(settlementId, statusConvert, userEmail, message);
			return 'SUCCESS';
		} catch (error) {
			throw new AppError({ message: `Error updating approver status - ${error.message}` });
		}
	}
}
