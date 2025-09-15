import { Request, Response, Router } from "express";
import { handleResponse, HttpCode } from "vanti-utils/lib";
import { IOrderDomainInterface, OrderDomain } from "../domain";
import { OrdersPairedResponse, ResponseOrderOrphan, ResponseOrdersSociety } from "../type/order.type";
import { GetOrdersOptions } from "src/models/order";
import { verifytoken } from "../../../middleware/verifyToken/verifyToken.middleware";
import { validateGetOrdersParam } from "../validator/order.validator";
import { getOrderClass } from '../../../middleware/getOrderClass/getOrderClass.middleware';
import multer from "multer";

export const OrdersController = Router();

OrdersController.post('/orders',
  verifytoken,
  validateGetOrdersParam,
  multer().single('filter'),
  async (req: Request, res: Response) => {
    const buffer: Buffer = req.file.buffer;
    let options: GetOrdersOptions = req.query;
    let ordersDomain: IOrderDomainInterface = new OrderDomain();
    let response: OrdersPairedResponse = await ordersDomain.getFilterOrders(options, buffer);
    handleResponse(res, 200, response);
  })

OrdersController.get('/orders',
  verifytoken,
  validateGetOrdersParam,
  async (req: Request, res: Response) => {
    let options: GetOrdersOptions = req.query;
    let ordersDomain: IOrderDomainInterface = new OrderDomain();
    let response: OrdersPairedResponse = await ordersDomain.getFilterOrdersSettlementId(options);
    handleResponse(res, 200, response);
  })

/**
 * Response Success
 * @typedef { object } handleResponse
 * @property { number } status - Status code: 200
 * @property { string } data - data response: "base64"
 */
/**
 * Response Error
 * @typedef { object } ResponseError
 * @property { number } status - Status code: 400
 * @property { string } message - Error message
 */
/**
 * GET /settlement/api/vantilisto/download-orders/:filter
 * @tags Order
 * @summary Download orders
 * @return {handleResponse} 200 - Success response - application/json
 * @return {ResponseError} 400 - Error response - application/json
 * @security Bearer
 * @example response - 200 - Success response example
 * {
 * "status": 200,
 * "data": "base64"
 * }
 * @example response - 400 - Error response example
 * {
 * "status": 400,
 * "message": "Error message"
 * }
 */
OrdersController.post('/download-orders', multer().single('filter') ,verifytoken, async (req: Request, res: Response) => {
  log.info('[download-orders] Inicia proceso envio csv')
  const settlementId = String(req.headers['x-settlement']);
  let ordersDomain: IOrderDomainInterface = new OrderDomain();
  ordersDomain.getOrdersDownload(settlementId, req.file.buffer);
  log.info('[download-orders] Response a front')
  handleResponse(res, 200, 'SUCCESS');
})

/**
 * Response Success
 * @typedef { object } handleResponse
 * @property { number } status - Status code: 200
 * @property { ResponseOrderOrphan } data - data response: { rows: [], count: 0 }
 */
/**
 * Response Error
 * @typedef { object } ResponseError
 * @property { number } status - Status code: 400
 * @property { string } message - Error message
 * @property { string } error - Error type
 */
/**
 * GET /settlement/api/vantilisto/orphan-orders
 * @tags Order
 * @summary Get orphan orders
 * @param { Date } dateRequest.query - Date of request
 * @param { number } limit.query - Limit of orders
 * @param { number } page.query - Page of orders
 * @param { string } field.query - Field of orders
 * @param { string } value.query - Value of orders
 * @param { string } orderField.query - Order field of orders
 * @param { string } orderType.query - Order type of orders
 * @param { string } marked.query - Marked of orders
 * @param { string } unmarked.query - Unmarked of orders
 * @return {handleResponse} 200 - Success response - application/json
 * @return {ResponseError} 400 - Error response - application/json
 * @security Bearer
 */
OrdersController.get('/orphan-orders', verifytoken, getOrderClass, async (req: Request, res: Response) => {
    let options: GetOrdersOptions = req.query;
	  let orderClass: string = String(req.headers['x-orderclass']);
    let ordersDomain: IOrderDomainInterface = new OrderDomain();
    let response: ResponseOrderOrphan = await ordersDomain.getOrdersOrphan(options, orderClass);
    handleResponse(res, 200, response);
})

OrdersController.get('/orders-duplicate', verifytoken, async (req: Request, res: Response) => {
  let options: GetOrdersOptions = req.query;
  let ordersDomain: IOrderDomainInterface = new OrderDomain();
  let response = await ordersDomain.getOrderDuplicate(options);
  handleResponse(res, HttpCode.OK, response);
})

OrdersController.get('/validate-orders-duplicate', async (req: Request, res: Response) => {
  const { oportunityId, duplicate }: { oportunityId?: string; duplicate?: string } = req.query;
  const ordersDomain: IOrderDomainInterface = new OrderDomain();
  const response = await ordersDomain.validateOrdersDuplicate(oportunityId, duplicate)
  handleResponse(res, HttpCode.OK, response); 
})

/**
 * Response Success
 * @typedef { object } handleResponse
 * @property { number } status - Status code: 200
 * @property { ResponseOrdersSociety } data - data response: { rows: [], count: 0 }
 */
/**
 * Response Error
 * @typedef { object } ResponseError
 * @property { number } status - Status code: 400
 * @property { string } message - Error message
 */
/**
 * GET /settlement/api/vantilisto/orders-society/:settlementId
 * @tags Order
 * @summary Get orders society
 * @param { string } settlementId.path - Settlement id
 * @param { Date } dateRequest.query - Date of request
 * @param { number } limit.query - Limit of orders
 * @param { number } page.query - Page of orders
 * @param { string } field.query - Field of orders
 * @param { string } value.query - Value of orders
 * @param { string } orderField.query - Order field of orders
 * @param { string } orderType.query - Order type of orders
 * @param { string } society.query - society of orders
 * @return {handleResponse} 200 - Success response - application/json
 * @return {ResponseError} 400 - Error response - application/json
 * @security Bearer
 * @example response - 200 - Success response example
 * {
 * "status": 200,
 * "data": { rows: [{}], count: 0 }
 * }
 * @example response - 400 - Error response example
 * {
 * "status": 400,
 * "message": "Error message"
 * }
 */
OrdersController.get('/orders-society/:settlementId', verifytoken, async (req: Request, res: Response) => {
  const settlementId: string = req.params.settlementId;
  let options: GetOrdersOptions = req.query;
  let ordersDomain: IOrderDomainInterface = new OrderDomain();
  let response: ResponseOrdersSociety = await ordersDomain.getOrdersSociety(options, settlementId);
  handleResponse(res, HttpCode.OK, response);
})

OrdersController.get('/download-orders-settlement/:settlementId', async (req: Request, res: Response) => {
  log.info('[download-orders-settlement] Inicio proceso de descarga xlsx')
  const settlementId: string = req.params.settlementId;
  const ordersDomain: IOrderDomainInterface = new OrderDomain();
  ordersDomain.downloadOrdersSettlementBase64(settlementId, true);
  handleResponse(res, HttpCode.OK, 'SUCCESS');
})

OrdersController.get('/orders-not-cufe', verifytoken ,async (req: Request, res: Response) => {
  const settlementId: string = String(req.query.settlementId);
  let options: GetOrdersOptions = req.query;
  const ordersDomain: IOrderDomainInterface = new OrderDomain();
  const response = await ordersDomain.getOrderNotCufe(settlementId, options)

  handleResponse(res, HttpCode.OK, response);
})

/**
 * Response Success
 * @typedef { object } handleResponseTotals
 * @property { number } status - Status code: 200
 * @property { OrdersSettlementTotal } data - Totalizador de cuenta
 */
/**
 * Response Error
 * @typedef { object } ResponseError
 * @property { number } status - Status code: 400
 * @property { string } message - Error message
 */
/**
/**
 * GET /settlement/api/vantilisto/orders-totals
 * @tags Order
 * @summary Consultar valores de totalizadores para vista de iniciar liquidacion
 * @param {file} request.formData.filter - Archivo con los filtros
 * @return {handleResponseTotals} 200 - Success response - application/json
 * @return {ResponseError} 400 - Error response - application/json
 * @security Bearer
 */
OrdersController.post('/orders-totals', verifytoken, multer().single('filter'), async (req: Request, res: Response) => {
  const buffer: Buffer = req.file.buffer;
  const ordersDomain: IOrderDomainInterface = new OrderDomain();
  const response = await ordersDomain.getOrdersTotals(buffer)

  handleResponse(res, HttpCode.OK, response)
})