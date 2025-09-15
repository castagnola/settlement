import { IOrderDomainInterface, OrderDomain } from '../../../modules/order/domain';
import { Status } from '../../../models/settlement';
import { createSettlement, getSettlement, updateExpirationTime, updateSettlement } from '../repository/settlement.repository';
import { ISettlementServiceInterface } from '../service/settlement.interface';
import { SettlementService } from '../service/settlement.service';
import {
	ApiCoreResponse,
	ResponseCheckSettlement,
	SettlementStateEnum,
	SettlementViewType,
	UpdateSettlementState
} from '../type/settlement.type';
import { ISettlementDomainInterface } from './settlement.interface';
import { AppError } from 'vanti-utils/lib';
import { ItransversalService } from '../../transversales/service/itransversal.interface';
import { TransversalService } from '../../transversales/service/transversal.service';
import { EmailData } from '../../../modules/transversales/type/transversales.type';
import { createToken } from '../../../helpers/jwt/jwt';
import { add } from 'date-fns';
import { SettlementEmail, SettlementEmailStatusEnum } from '../../../models/settlmentEmail/settlement.type';
import { createSettlementEmail } from '../repository/settlementEmail/settlementEmail.repository';
import { AmqpService } from '../../../helpers/workers/workers';
const { FRONT_URI, SECRET_APPROVAL_TOKEN, TOKEN_LIVETIME, SEND_EMAIL_BY_COLLABORATOR_QUEUE_NAME }: any = process.env

export class SettlementDomain implements ISettlementDomainInterface {
	async getSettlements(options: SettlementViewType): Promise<SettlementViewType[]> {
		let settlementService: ISettlementServiceInterface = new SettlementService()
		return await settlementService.getSettlements(options);
	}

	/**
 * Create new settlement
 * @param data orders array
 * @param orderClass order class
 * @returns settlementId of the created settlement
 */
	async createNewSettlement(data: Buffer, orderClass: string, user: string): Promise<string> {
		let ordersService: ISettlementServiceInterface = new SettlementService()
		const settlementId = await ordersService.createNewSettlement(data, orderClass, user);
        log.info('[new-settlement-vantilisto] Creacion de la liquidacion %s creada por el correo: %s', settlementId, user);
		await createSettlement({ settlementId });
		return settlementId
	}

	/**
	 * Update settlement status
	 * @param settlementId settlement id
	 * @param status status
	 * @returns success message
	 */
	async updateSettlement(settlementId: string, status: string): Promise<string> {
		await updateSettlement(settlementId, status as Status);
		return 'Settlement updated successfully';
	}

	async checkSettlemnt(settlementId: string): Promise<ResponseCheckSettlement> {
		const settlementData = await getSettlement(settlementId);
		let returnValidate: ResponseCheckSettlement = {
			status: settlementData.status,
			validate: false
		};
		if([Status.COMPLETED, Status.ASSIGNED].includes(settlementData.status)) {
			returnValidate.validate = true;
		}
		return returnValidate
	}

	/**
	 * @see ISettlementDomainInterface.approvalSettlement
	 */
	async approvalSettlement(settlementId: string): Promise<string> {
		try {
			const settlementService: ISettlementServiceInterface = new SettlementService();
			const orderSettlementDomain: IOrderDomainInterface = new OrderDomain();
			const transversalService: ItransversalService = new TransversalService();

			const emailData = await settlementService.getUserLineData(settlementId);
			const xlsxBase64 = await orderSettlementDomain.downloadOrdersSettlementBase64(settlementId);

			const tokenUrl = createToken({settlementId}, SECRET_APPROVAL_TOKEN, TOKEN_LIVETIME);
			const hourToAdd = TOKEN_LIVETIME.split('h');
			const URL = `${FRONT_URI}approve?token=${tokenUrl}&settlementId=${settlementId}`
			const currentYear = new Date().getFullYear().toString();
			console.log('URL:', URL);
			const email_template_new_settlement='new-settlement'
			
			const emailSendData: EmailData = {
				email: emailData.userEmail,
				name: emailData.name,
				subject: `Liquidación ID ${settlementId} Generada para su Revisión y Aprobación`,
				template: email_template_new_settlement,
				copiesEmailList: emailData.copyEmail,
				parameters: {
					userName: emailData.name,
					id: `Resumen pagos Liquidación Vantilisto N° ${settlementId}`,
					link: URL,        
       				year: currentYear
				},
				attachments: [
					{	
						content: xlsxBase64,
						filename: `Detalle-liquidacion-${settlementId}.xlsx`,
						contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					}
				]
			}
			
			let response = await transversalService.sendEmail(emailSendData);

			const expirationTime = add(new Date(), { hours: Number(hourToAdd[0]) });
			const validUpdateMongo = await updateExpirationTime(settlementId, expirationTime);
			log.info('[approvalSettlement] Se actualizo fecha de vencimiento del token para liquidacion %s expira: %s', settlementId, validUpdateMongo.expirationTime.toISOString())

			const updateData: UpdateSettlementState = {
				status: SettlementStateEnum.PENDING_APROVAL
			}
			const updateStatus = await settlementService.UpdateSettlementState(settlementId, updateData);
			log.info(`[approvalSettlement] Actualizacion de estado de liquidacion %s y correo enviado con estado %s`, updateStatus, response);
			return SettlementStateEnum.PENDING_APROVAL
		} catch (error) {
			log.error(`[approvalSettlement] Error en el envio de correo ${error.message}`);
			throw new AppError({message: `[approvalSettlement] Error en el envio de correo ${error.message}`})
		}
	}

	async getEmailReport(): Promise<string> {
		const settlementService: ISettlementServiceInterface = new SettlementService();
		const emailData = await settlementService.getUserLineData('R1');
		return emailData.userEmail
	}

	async UpdateSettlementStatus(settlementId: string, updateData: UpdateSettlementState): Promise<ApiCoreResponse> {
		try {
			const settlementService: ISettlementServiceInterface = new SettlementService();
			const response = await settlementService.UpdateSettlementState(settlementId, updateData);
			if(updateData.status == SettlementStateEnum.APPROVED_SETTLED){
				this.UploadRabbitApproveSettlement(settlementId);
			}
			log.info(`[UpdateSettlementStatus] Respuesta completa de core: ${JSON.stringify(response)}`);
            log.info('[update-settlement-vantilisto] La liquidacion %s cambio a estado %s por el correo: %s', settlementId, updateData.status, updateData.user);
			return response as unknown as ApiCoreResponse;
		} catch (error) {
			log.error(`[UpdateSettlementStatus] Error de actualizacion - ${error.message}`);
			throw new AppError({message: `[UpdateSettlementStatus] Error de actualizacion - ${error.message}`})
		}
	}

	async UploadRabbitApproveSettlement(settlementId: string): Promise<string> {
		const settlementService: ISettlementServiceInterface = new SettlementService();
		const listCollaborator = await settlementService.getCollaboratorBySettlementId(settlementId);
		log.info('[UploadRabbitApproveSettlement] Se comienza encolamiento para correos de liquidacion %s para %s colaboradores', settlementId, listCollaborator.length);

		listCollaborator.forEach(async item => {
			const mongoData: SettlementEmail = {
				collaboratorBp: item,
				emailStatus: SettlementEmailStatusEnum.PENDING_CREATE,
				settlementId: settlementId
			}
			const mongo = await createSettlementEmail(mongoData);
			await AmqpService.addTask(SEND_EMAIL_BY_COLLABORATOR_QUEUE_NAME, mongo._id, null);
		})
		log.info('[UploadRabbitApproveSettlement] Se termina envio a colas de liquidacion %s', settlementId);
		return 'SUCCESSFUL PROCESSING'
	}
}
