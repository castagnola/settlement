import { ApproverDomain } from "./approver.domain";
import { ApprovedStatus } from "../../../../models/adjustmentNoteSettlement";
import { getBySettlementId, updateAjusmentSettlement } from "../../repository/adjustmentNoteSettlement/settlement.repository";
import { getOrdersBySettlementId } from "../../../../modules/adjustmentNote/repository/adjustmentNoteOrder/adjustmentNoteOrder.repository";
import { SettlementService } from "../../service/settlement.service";
import { jest } from "@jest/globals";

// Mockeamos los módulos
jest.mock("../../repository/adjustmentNoteSettlement/settlement.repository");
jest.mock("../../../../modules/adjustmentNote/repository/adjustmentNoteOrder/adjustmentNoteOrder.repository");
jest.mock("../../service/settlement.service");

const getBySettlementIdMock = jest.mocked(getBySettlementId);
const getOrdersBySettlementIdMock = jest.mocked(getOrdersBySettlementId);
const updateAjusmentSettlementMock = jest.mocked(updateAjusmentSettlement);

describe("ApproverDomain", () => {
    let approverDomain: ApproverDomain;
    let settlementServiceMock: jest.Mocked<SettlementService>;

    beforeEach(() => {
        settlementServiceMock = new SettlementService() as jest.Mocked<SettlementService>;

        // 🔥 Aquí reemplazamos la instancia de SettlementService dentro de ApproverDomain
        approverDomain = new ApproverDomain();
        (approverDomain as any).settlementService = settlementServiceMock;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("updateApproverStatus should approve settlement when status is APPROVED", async () => {
        const settlementId = "12345";
        const status = ApprovedStatus.APPROVED_SETTLED;
        const createdAt = new Date();
        const orders = [{ orderNumber: "001", orderClass: "A" }];
        const userEmail = "test@gmail.com"

        getBySettlementIdMock.mockResolvedValue({ createdAt } as any);
        getOrdersBySettlementIdMock.mockResolvedValue(orders);
        settlementServiceMock.approveSettlement.mockResolvedValue("APPROVED");
        updateAjusmentSettlementMock.mockResolvedValue({ _id: "mockId" } as any);

        const result = await approverDomain.updateApproverStatus(settlementId, status, userEmail);

        expect(result).toBe("SUCCESS");
    });
});
