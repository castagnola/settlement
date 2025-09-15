
import { ValidateService } from '../service'
import { SettlementBasicData, ValidateEmailResponse } from '../type/validate.type'
import { ValidateDomain, IValidateDomain } from './index'

describe("should validate domain", () => {
    it("should validate validEmailApprove", async () => {
        const settlementData: SettlementBasicData = {
          classType: 'testData',
          creationDate: 'testData',
          lastStatusDate: 'testData',
          orders: 'testData',
          settlementId: 'testData',
          state: 'testData'
        }

        const data: ValidateEmailResponse = {
          valid: true,
          date: settlementData.creationDate
        }
    
        jest.spyOn(ValidateService.prototype, 'ValidApprovedUserEmail').mockResolvedValue(data.valid)
        jest.spyOn(ValidateService.prototype, 'GetSettlementData').mockResolvedValue(settlementData)
    
        const validateDomain: IValidateDomain = new ValidateDomain();
        const response = await validateDomain.validEmailApprove('testData' ,'01-testData');
    
        expect(response).toEqual(data)
      })
})