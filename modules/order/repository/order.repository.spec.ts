import { describe, expect, it, jest } from '@jest/globals';
import { Order } from "../type/order.type";
import * as repositoryAvailability from '../repository/order.repository'
import { OrderModel } from '../../../models/order';
import { SettlementModel, Status } from '../../../models/settlement';



describe('validate order repository', () => {
    it('should insert orders and return the result', async () => {
        const ordersArray: Order[] = [
            {
                type: "01",
                collaboratorBp: "987654321",
                collaboratorName: "María Gómez",
                salesOrganization: "Org2",
                contractAccount: "CA654321",
                documentClassZFM6: "Clase3",
                documentNumberZFM6: "DOC789",
                totalValueZFM6: 2000.00,
                campaignId: "CAMP02",
                campaignName: "Campaña de Invierno",
                rediscount: 15.00,
                rediscountZFM6: 7.00,
                vatCommission: 19.00,
                rediscountZP12: 5.00,
                documentClassZP12: "Clase4",
                documentNumberZP12: "DOC101",
                totalValueZP12: 2500.00,
                invoiceId: "INV002",
                accountingDocument: "ACC002",
                no: "10",
                ticketId: "TICK010",
                cufe: "CUFE010",
                oportunityId: "OPP010",
                sapStatus: "Completado",
                errorMessage: "Error en la conexión",
                errorType: "Conexión",
                orderStatus: "CREATED",
                settlementId: "01-00000010-30.07.2024",
              }
        ];

        const mockResult = [
            {
                ...ordersArray[0],
                _id: 'mocked-id'
            }
        ];

        jest.spyOn(OrderModel, 'insertMany').mockResolvedValue(mockResult as any);

        const result = await repositoryAvailability.insertManyOrders(ordersArray);

        expect(result).toEqual(mockResult);
        expect(OrderModel.insertMany).toHaveBeenCalledWith(ordersArray);
    });

    it('should create and save a settlement', async () => {
        const mockSettlement = {
            _id: 'mocked-id',
            status: 'CREATE'
        };

        jest.spyOn(SettlementModel.prototype, 'save').mockResolvedValue(mockSettlement as any);

        const result = await repositoryAvailability.createSettlement();

        expect(result).toEqual(mockSettlement);
        expect(SettlementModel.prototype.save).toHaveBeenCalled();
    });

    it('should find a settlement with status CREATE', async () => {
        const mockSettlement = {
            _id: 'mocked-id',
            status: Status.CREATED
        };

        jest.spyOn(SettlementModel, 'findOne').mockResolvedValue(mockSettlement as any);

        const result = await repositoryAvailability.findSettlement();

        expect(result).toEqual(mockSettlement);
        expect(SettlementModel.findOne).toHaveBeenCalledWith({ status: Status.CREATED });
    });

    it('should update a settlement with new data', async () => {
        const mockSettlement = {
            _id: 'mocked-id',
            status: Status.CREATED
        };

        const updateData = {
            status: Status.PROCESS_BILLING
        };

        const updatedSettlement = {
            ...mockSettlement,
            ...updateData
        };

        jest.spyOn(SettlementModel, 'findByIdAndUpdate').mockResolvedValue(updatedSettlement as any);

        const result = await repositoryAvailability.updateSettlement(mockSettlement, updateData);


        // Expect findByIdAndUpdate to be called with the correct parameters
        expect(SettlementModel.findByIdAndUpdate).toHaveBeenCalledWith(
            mockSettlement,
            { $set: updateData },  // Ensure $set is used here
            { new: true }           // Ensure options include { new: true }
        );
        expect(result).toEqual(updatedSettlement);

    });

    it('should handle errors during update', async () => {
        const mockSettlement = {
            _id: 'mocked-id',
            status: Status.CREATED
        };

        const updateData = {
            status: Status.PROCESS_BILLING
        };

        jest.spyOn(SettlementModel, 'findByIdAndUpdate').mockRejectedValue(new Error('Update failed'));

        await expect(repositoryAvailability.updateSettlement(mockSettlement, updateData)).rejects.toThrow('Update failed');
    });

});