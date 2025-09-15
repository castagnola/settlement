import { describe, expect, it, beforeAll, jest, afterEach, beforeEach } from "@jest/globals";
import { SettlementDomain } from './settlement.domain';
import { ISettlementServiceInterface } from '../service/settlement.interface';
import { SettlementService } from '../service/settlement.service';
import { DocumentTypeEnum, ResponseCheckSettlement, SettlementStateEnum, SettlementViewType, UpdateSettlementState, UserLineData } from '../type/settlement.type';
import * as Repository from '../repository/settlement.repository';
import { Settlement, Status } from "../../../models/settlement";
import { OrderDomain } from "../../order/domain";
import { ISettlementDomainInterface } from "./settlement.interface";
import { TransversalService } from "../../transversales/service/transversal.service";
import { AppError } from "vanti-utils/lib";
const { EMAIL_XLSX_REPORT } = process.env;

import { createToken, verifyToken } from '../../../helpers/jwt/jwt';
jest.mock('../../../helpers/jwt/jwt');
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;
const mockCreateToken = createToken as jest.MockedFunction<typeof createToken>;


describe('SettlementDomain', () => {
  let settlementDomain: SettlementDomain;
  let mockSettlementService: jest.Mocked<ISettlementServiceInterface>;
  const mockOptions: SettlementViewType = {
    settlementId: '1',
    classType: DocumentTypeEnum.ZFM6,
    creationDate: new Date(),
    lastStatusDate: new Date(),
    orders: [],
    state: 'Active'
  };

  const mockResponse: SettlementViewType[] = [
    {
      settlementId: '2',
      classType: DocumentTypeEnum.ZFM6,
      creationDate: new Date(),
      lastStatusDate: new Date(),
      orders: [],
      state: 'Pending'
    },
    {
      settlementId: '3',
      classType: DocumentTypeEnum.ZFM6,
      creationDate: new Date(),
      lastStatusDate: new Date(),
      orders: [],
      state: 'Completed'
    }
  ];
  beforeEach(() => {
    settlementDomain = new SettlementDomain();
  });

  it('should return settlements list', async () => {
    jest.spyOn(SettlementService.prototype, 'getSettlements').mockResolvedValue(mockResponse);
    const result = await settlementDomain.getSettlements(mockOptions);

    expect(result).toEqual(mockResponse);
  });

  it('should handle errors', async () => {
    const mockError = new Error('Service error');
    jest.spyOn(SettlementService.prototype, 'getSettlements').mockRejectedValueOnce(mockError);

    await expect(settlementDomain.getSettlements(mockOptions)).rejects.toThrow('Service error');
  });

  it('should validate create new settlement', async () => {
    const mockBuffer = Buffer.from('test');
    jest.spyOn(SettlementService.prototype, 'createNewSettlement').mockResolvedValue("settlementId");
    jest.spyOn(Repository, 'createSettlement').mockResolvedValue({ settlementId: "settlementId" } as any);
    const result = await settlementDomain.createNewSettlement(mockBuffer, 'ZFM6', 'testUser');

    expect(result).toEqual("settlementId");
  });

  it('should validate update settlement', async () => {
    jest.spyOn(Repository, 'updateSettlement').mockResolvedValue(true as any);
    const result = await settlementDomain.updateSettlement('1', 'Active');

    expect(result).toEqual('Settlement updated successfully');
  })

  it("should validate checkSettlement PROCESING", async () => {
    
    const settlementId = 'testData';
    const returnData: ResponseCheckSettlement = {
      status: Status.PROCESING,
      validate: false
    };
    const settlement: Settlement = {
      settlementId: 'testData',
      status: Status.PROCESING
    }

    jest.spyOn(Repository, 'getSettlement').mockResolvedValue(settlement as any);
    const result = await settlementDomain.checkSettlemnt(settlementId);

    expect(result).toEqual(returnData)
  })

  it("should validate checkSettlement COMPLETED", async () => {
    
    const settlementId = 'testData';
    const returnData: ResponseCheckSettlement = {
      status: Status.COMPLETED,
      validate: true
    };
    const settlement: Settlement = {
      settlementId: 'testData',
      status: Status.COMPLETED
    }

    jest.spyOn(Repository, 'getSettlement').mockResolvedValue(settlement as any);
    const result = await settlementDomain.checkSettlemnt(settlementId);

    expect(result).toEqual(returnData)
  })

  it("should validate approvalSettlement", async () => {
    const settlementId: string = 'testData';
    const userLineResponse: UserLineData = {
      copyEmail: ['testData'],
      name: 'testData',
      userEmail: 'testData@gm.com'
    } 

    jest.spyOn(SettlementService.prototype, 'getUserLineData').mockResolvedValue(userLineResponse);
    jest.spyOn(OrderDomain.prototype, 'downloadOrdersSettlementBase64').mockResolvedValue('testDataBase64');
    mockCreateToken.mockReturnValue('token');
    jest.spyOn(TransversalService.prototype, 'sendEmail').mockResolvedValue(true);
    jest.spyOn(SettlementService.prototype, 'UpdateSettlementState').mockResolvedValue('SUCCESS')
    jest.spyOn(Repository, 'updateExpirationTime').mockResolvedValue({expirationTime: new Date()})

    const settlementDomain: ISettlementDomainInterface = new SettlementDomain();
    const response = await settlementDomain.approvalSettlement(settlementId);

    expect(response).toEqual(SettlementStateEnum.PENDING_APROVAL)
  })

  it("should validate getEmailReport", async () => {
    const data = 'testData@gm.com'

    const userLineResponse: UserLineData = {
      copyEmail: ['testData'],
      name: 'testData',
      userEmail: 'testData@gm.com'
    } 

    jest.spyOn(SettlementService.prototype, 'getUserLineData').mockResolvedValue(userLineResponse);
    const settlementDomain: ISettlementDomainInterface = new SettlementDomain();
    const response = await settlementDomain.getEmailReport();

    expect(response).toEqual(data)
  })

  it("should validate UpdateSettlementStatus", async () => {
    const settlementId: string = '123'
    const updateData: UpdateSettlementState = {
      status: SettlementStateEnum.APPROVED_SETTLED,
      message: 'testData'
    }
    const response = 'SUCCESS'
    const settlementDomain: ISettlementDomainInterface = new SettlementDomain();
    
    jest.spyOn(SettlementService.prototype, 'UpdateSettlementState').mockResolvedValue(response)
    jest.spyOn(settlementDomain as any, 'UploadRabbitApproveSettlement').mockReturnValue({})

    const result = await settlementDomain.UpdateSettlementStatus(settlementId, updateData);

    await expect(settlementDomain.UpdateSettlementStatus(settlementId, updateData))
        .resolves.toEqual("SUCCESS")
  })

  it("should validate UpdateSettlementStatus", async () => {
    const settlementId: string = '123'
    const updateData: UpdateSettlementState = {
      status: SettlementStateEnum.APPROVED_SETTLED,
      message: 'testData'
    }
    const settlementDomain: ISettlementDomainInterface = new SettlementDomain();

    jest.spyOn(SettlementService.prototype, 'UpdateSettlementState').mockImplementation(()=> {
      throw new AppError({message: 'error'})
    })
    jest.spyOn(settlementDomain as any, 'UploadRabbitApproveSettlement').mockReturnValue({})

    await expect(settlementDomain.UpdateSettlementStatus(settlementId, updateData)).rejects.toThrow(
      new AppError({message: '[UpdateSettlementStatus] Error de actualizacion - error'})
    )
  })
});
