import { IOrderDomainInterface } from './order.interface';
import {
	OrderDownLoad,
	OrderStatusEnum,
	ResponseOrderOrphan,
	OrderReportType,
	OrderDuplicate,
	OrderDuplicateFront,
	ValidateDuplicateResponse,
	ValidateDuplicate, OrdersPairedResponse,
	ResponseOrdersSociety,
	HeaderOrderSettlementReportGeneral,
	HeaderOrderSettlementReportSociety,
	HeaderKeyValueOrderSettlementReportSociety,
	HeaderKeyValueOrderSettlementReportGeneral,
	OrderNotCufeListResponse,
	OrdersSettlementTotal,
} from '../type/order.type';
import { OrderService } from '../service/order.service';
import { IOrderServiceInterface } from '../service/order.interface';
import { GetOrdersOptions } from 'src/models/order';
import {AppError} from "vanti-utils/lib";
import { dataXlsx } from '../../../helpers/xlsx/xlsx.type';
import { GenerateMultiviewXlsx } from '../../../helpers/xlsx/xlsx';
import { EmailData, MultiSendEmailData } from '../../transversales/type/transversales.type';
import { ItransversalService } from '../../transversales/service/itransversal.interface';
import { TransversalService } from '../../transversales/service/transversal.service';
import { ISettlementServiceInterface } from '../../settlement/service/settlement.interface';
import { SettlementService } from '../../settlement/service/settlement.service';
import { getSettlement } from '../../settlement/repository/settlement.repository';

export class OrderDomain implements IOrderDomainInterface {

	async getFilterOrders(options: GetOrdersOptions, buffer: Buffer): Promise<OrdersPairedResponse> {
		let ordersService: IOrderServiceInterface = new OrderService()
		let dateRequest = new Date().toISOString();
		if (!options.dateRequest) {
			options.dateRequest = dateRequest;
		}

		let ordersPromise = ordersService.getFilterOrders(options, buffer);

		const [orders] = await Promise.all([ordersPromise])

		if (!orders || orders.count === 0) {
			return {
				rows: [],
				dateRequest: options.dateRequest,
				count: 0,
				state:OrderStatusEnum.CREATED
			};
		}
		return {
			...orders,
			dateRequest: options.dateRequest
		};
	}

	async getFilterOrdersSettlementId(options: GetOrdersOptions): Promise<OrdersPairedResponse> {
		let ordersService: IOrderServiceInterface = new OrderService()
		let dateRequest = new Date().toISOString();
		if (!options.dateRequest) {
			options.dateRequest = dateRequest;
		}

		let ordersPromise = ordersService.getFilterOrdersSettlementId(options);

		const [orders] = await Promise.all([ordersPromise])

		if (!orders || orders.count === 0) {
			return {
				rows: [],
				dateRequest: options.dateRequest,
				count: 0,
				state:OrderStatusEnum.CREATED
			};
		}

		const response: OrdersPairedResponse = {
			...orders,
			dateRequest: options.dateRequest
		}

		const settlement = await getSettlement(options.settlementId);
		if(settlement?.expirationTime <= new Date()){
			response.state = OrderStatusEnum.INVOICED
		}

		return response;
	}

	/**
	 * Get orders to download
	 * @param type Type of orders to download
	 * @returns Orders to download | Order[]
	 */
	async getOrdersDownload(settlementId: string | null, filter: Buffer): Promise<string> {
		let ordersService: IOrderServiceInterface = new OrderService()
		let orders: OrderReportType[] = await ordersService.getOrdersDownload(OrderStatusEnum.CREATED, settlementId, filter);
		if (!orders || orders.length === 0) {
			throw new AppError({message: 'orders not found'});
		}
		const formatNumber = (num: number) => num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false });
		const ordersData: OrderDownLoad[] = orders.map(order => {
			return {
				id: order.settlement_id,
				settlementDate: order.settlement_date,
				oportunityId: order.oportunity_id,
				documentClass: order.document_class,
				documentNumber: order.document_number,
				collaboratorIdentification: order.collaborator_identification,
				collaboratorName: order.collaborator_name,
				society: order.society_code,
				contractAccount: order.contract_account,
				campaignId: order.campaing_id,
				value: formatNumber(Number(order.amount)),
				vat: formatNumber(Number(order.vat)),
				totalValue: formatNumber(Number(order.total_amount)),
				rediscount: order.rediscount,
				invoiceRediscount: order.invoice_id_rediscount,
				invoiceDocumentId: order.invoice_document_id,
				state: order.state,
				interestRate: order.interest_rate,
				quotas: order.quotas,
				ticketId: order.ticket,
				invoiceDocument: order.invoice_document,
				invoiceDate: order.invoice_date,
				clientName: order.client_name,
				clientIdentification: order.client_identification,
				societyName: order.society_name
			}
		});
		const newHeaders: string[] = [
			'ID LIQUIDACION',
			'FECHA LILQUIDACION',
			'ID OPORTUNIDAD',
			'CLASE (TIPO) DE PEDIDO DE VENTA CLIENTE',
			'ID PEDIDO DE VENTA CLIENTE  / ID PEDIDO REDESCUENTO',
			'ID FIRMA INSTALADORA/ALIADO',
			'FIRMA INSTALADORA/ALIADO',
			'SOCIEDAD',
			'CUENTA CONTRATO',
			'ID CAMPAÑA',
			'VALOR  NETO SIN IVA',
			'VALOR IVA 19%(COMISIÓN)',
			'VALOR NETO CON IVA',
			'% DE REDESCUENTO/COMISION',
			'ID DOCUMENTO CONTABLE',
			'REFERENCIA',
			'ESTADO',
			'TASA DE INTERÉS',
			'PLAZO',
			'ID TICKET',
			'ID FACTURA REDESCUENTO',
			'FECHA DE FACTURACION',
			'NOMBRE DEL CLIENTE',
			'CEDULA DEL CLIENTE',
			'FILIAL',
		]
		const headers = Object.keys(ordersData[0]);
		const rows = ordersData.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(';'));
		const csv = [newHeaders.join(';'), ...rows].join('\n');
		const base64 = Buffer.from(csv).toString('base64')

		log.info('[getOrdersDownload] Creacion de archivo finalizado, comienza envio de correo')

		const date = new Date();
		const hours = date.getHours()
		const minutes = date .getMinutes() ;
		const seconds = date .getSeconds() ;
		const fileName = `Pedidos_Vantilisto_${hours}_${minutes}_${seconds}.csv`;
		const settlementService: ISettlementServiceInterface = new SettlementService();
		const emailData = await settlementService.getUserLineData('R1');

		const emails = `${emailData.userEmail},${emailData.copyEmail.join(',')}`;
		const emailsSend = emails.split(',')
			.map(item => item.trim())
			.filter(item => item)
			.map(item => ({
				email: item,
				name: emailData.name
			}));

		try {
			const transversalService: ItransversalService = new TransversalService();
			const email_template_new_settlement_orders = 'new-settlement-orders'
			const emailSendData: MultiSendEmailData = {
				to: emailsSend,
				subject: `Liquidación Vantilisto previa a facturar`,
				template: email_template_new_settlement_orders,
				attachments: [
					{
						content: base64,
						filename: fileName,
						contentType: 'text/csv'
					}
				]
			}

			let response = await transversalService.sendEmail(emailSendData); 
			log.info(`[getOrdersDownload] - Correo enviado con estado: ${response}`)
		} catch (error) {
			log.error(`[Error envio correo] - correo de ordenes: ${error.message}`)
		}

		return 'SUCCESS';
	}

	/**
	 * Get orders orphan by filters
	 * @param options Filters to get orders orphan
	 */
	async getOrdersOrphan(options: GetOrdersOptions, orderClass: string): Promise<ResponseOrderOrphan> {
		let ordersService: IOrderServiceInterface = new OrderService()
		return await ordersService.getOrdersOrphan(options, orderClass);
	}

	async getOrderDuplicate(options: GetOrdersOptions): Promise<OrderDuplicate> {
		let ordersService: IOrderServiceInterface = new OrderService();
		let orderDuplicateDb = await ordersService.getOrdersDuplicate(options);

		let dataArray = orderDuplicateDb.rows.map(item => {
			let data: OrderDuplicateFront = {
				id: item.id,
				oportunityId: item.oportunityId,
				documentClass: item.documentClass,
				documentNumber: item.documentNumber,
				collaboratorIdentification: item.collaboratorIdentification,
				collaboratorName: item.collaboratorName,
				clientIdentification: item.clientIdentification,
				societyCode: item.societyCode,
				contractAccount: item.contractAccount,
				amount: item.amount,
				totalAmount: item.totalAmount,
				vat: item.vat,
				rediscount: item.rediscount
			}
			return data
		})
	
		return {
			count: orderDuplicateDb.count,
			rows: dataArray 
		};
	}

	async validateOrdersDuplicate(oportunityId: string, ordersToValidate: string): Promise<ValidateDuplicate> {
		let oportunityArray: string[] = oportunityId.split(',')
		let ordersService: IOrderServiceInterface = new OrderService();

		let responseValidate: ValidateDuplicateResponse[] = await Promise.all(
			oportunityArray.map(async item => {
				return await ordersService.validateOrdersDuplicate(item, ordersToValidate)
			})
		)

		let response: ValidateDuplicate = {
			details: responseValidate,
			allValid: responseValidate.every(item => item.valid === true)
		}
	
		return response
	}

	/**
	 * Get orders society
	 * @param options options to get orders	
	 * @param settlementId settlement id
	 * @returns Orders society
	 */
	async getOrdersSociety(options: GetOrdersOptions, settlementId: string): Promise<ResponseOrdersSociety> {
		let ordersService: IOrderServiceInterface = new OrderService()
		return await ordersService.getOrdersSociety(options, settlementId);
	}

/**
	 * @see IOrderDomainInterface.downloadOrdersSettlementBase64
	 */
	async downloadOrdersSettlementBase64(settlementId: string, sendEmail: boolean = false): Promise<string> {
		try {
			let ordersService: IOrderServiceInterface = new OrderService();

			log.info('[downloadOrdersSettlementBase64] - Inicio de proceso para enviar xlsx')
			let settlementGeneralPromise = ordersService.getOrdersSettlementGeneral(settlementId);
			let settlementSocietiesPromise = ordersService.getOrdersSettlementSociety(settlementId);

			let [settlementGeneral, settlementSocieties] = await Promise.all([settlementGeneralPromise, settlementSocietiesPromise])
			log.info('[downloadOrdersSettlementBase64] - respuesta de bases de datos')

			let dataToXlsx: dataXlsx[] = [
				{
					data: settlementGeneral,
					name: 'BBDD VALIDACIÓN',
					headers: HeaderOrderSettlementReportGeneral,
					headersKey: HeaderKeyValueOrderSettlementReportGeneral
				}
			];

			settlementSocieties.map(async item => {
				dataToXlsx.push(
					{
						data: item.data,
						name: item.name,
						headers: HeaderOrderSettlementReportSociety,
						headersKey: HeaderKeyValueOrderSettlementReportSociety
					}
				)
			})

			settlementGeneral= null 
			settlementSocieties = null

			log.info('[downloadOrdersSettlementBase64] - Envio a generar xlsx')
			let base64 = await GenerateMultiviewXlsx(dataToXlsx);
			log.info('[downloadOrdersSettlementBase64] - Finalizacion xlsx')

			if(sendEmail){
				const settlementService: ISettlementServiceInterface = new SettlementService();
				const emailData = await settlementService.getUserLineData('D1');
				const transversalService: ItransversalService = new TransversalService();
				log.info('[downloadOrdersSettlementBase64] - Comienza envio del correo')
				const email_xlsx_template = 'new-settlement-details'
				const emailSendData: EmailData = {
					email: emailData.userEmail,
					name: emailData.name,
					copiesEmailList: emailData.copyEmail,
					subject: `Liquidación número ${settlementId}`,
					template: email_xlsx_template,
					parameters: {
						id: `${settlementId}`
					},
					attachments: [
						{
							content: base64,
							filename: `Detalle-liquidacion-${settlementId}.xlsx`,
							contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
						}
					]
				}

				let response = await transversalService.sendEmail(emailSendData); 
				log.info(`[downloadOrdersSettlementBase64] - Correo enviado con estado: ${response}`)
			}

			return base64
		} catch (error) {
			log.error(`[downloadOrdersSettlementBase64] Error al crear el archivo: ${error.message}`)
			throw new AppError({message: `[downloadOrdersSettlementBase64] Error al crear el archivo: ${error.message}`})
		}
	}

	async getOrderNotCufe(settlementId: string, options: GetOrdersOptions): Promise<OrderNotCufeListResponse> {
		try {
			const ordersService: IOrderServiceInterface = new OrderService()
			return await ordersService.getOrderNotCufe(settlementId, options);
		} catch (error) {
			log.error(`[getOrderNotCufe] Error al consultar ordenes sin cufe - ${error.message}`)
			throw new AppError({message: `[getOrderNotCufe] Error al consultar ordenes sin cufe - ${error.message}`})
		}
	}

    /**
     * @see IOrderServiceInterface.IOrderDomainInterface
     */
	async getOrdersTotals(buffer: Buffer): Promise<OrdersSettlementTotal> {
		let ordersService: IOrderServiceInterface = new OrderService()
		return await ordersService.getOrdersTotals(buffer);
	}
}
