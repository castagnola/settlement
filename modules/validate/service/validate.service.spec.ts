import { Axios } from "vanti-utils/lib";
import { ValidateService } from './index'
import { SettlementBasicData, SettlementListResponse } from "../type/validate.type";
jest.mock("vanti-utils/lib");
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

describe("should validate service", () => {

    let service: ValidateService;

    beforeAll(() => {
      service = new ValidateService();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should validate ValidApprovedUserEmail", async () => {
      const email: string = 'testData';
      const valid: boolean = true
      const settlementId = '01-testData'
  
      mockedAxios.get.mockResolvedValueOnce({ data: {data: valid} });
  
      const result = await service.ValidApprovedUserEmail(email,settlementId);
  
      expect(result).toEqual(valid)
    })

    it("should validate GetSettlementData", async () => {
      const settlementId: string = '123';
      const settlementData: SettlementBasicData = {
        classType: 'testData',
        creationDate: 'testData',
        lastStatusDate: 'testData',
        orders: 'testData',
        settlementId: 'testData',
        state: 'testData'
      }
      const settlementList: SettlementListResponse = {
        settlements: [settlementData],
        total: 1
      }

      mockedAxios.get.mockResolvedValueOnce({ data: {data: settlementList} });

      const result = await service.GetSettlementData(settlementId);

      expect(result).toEqual(settlementData)
    })
})