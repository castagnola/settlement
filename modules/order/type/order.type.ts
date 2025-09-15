export type Order = {
    type: string;
    collaboratorBp: string;
    collaboratorName: string;
    salesOrganization: string;
    contractAccount: string;
    documentClassZFM6: string;
    documentNumberZFM6: string;
    totalValueZFM6: number;
    campaignId: string;
    campaignName: string;
    rediscount: number;
    rediscountZFM6: number;
    vatCommission: number;
    rediscountZP12: number;
    documentClassZP12: string;
    documentNumberZP12: string;
    totalValueZP12: number;
    invoiceId?: string;
    accountingDocument?: string;
    no: string;
    ticketId: string;
    cufe?: string;
    oportunityId: string;
    sapStatus?: string;
    errorMessage?: string;
    errorType?: string;
    orderStatus: string;
    settlementId: string;
};

export type SearchOrdersRes = {
    settlementId: string,
    orders: boolean // verdadero si la liquidacion creada tiene ordenes
}

export type GetOrdersRes = {
    settlementId: string,
    orders: Order[] // verdadero si la liquidacion creada tiene ordenes
}

export type OrderDownLoad = {
    id: string,
    settlementDate: string,
    oportunityId: string,
    documentClass: string,
    documentNumber: string,
    collaboratorIdentification: string,
    collaboratorName: string,
    society: string,
    contractAccount: string,
    campaignId: string,
    value: string,
    vat: string,
    totalValue: string,
    rediscount: string,
    invoiceRediscount: string,
    invoiceDocumentId: string,
    state: string,
    interestRate: string,
    quotas: string,
    ticketId: string,
    invoiceDocument: string,
    invoiceDate: string,
    clientIdentification: string,
    clientName: string,
    societyName: string,
}



export enum OrderTypeEnum {
    VANTI_LISTO = '01',
    OTHER = '02',
}

export enum OrderStatusEnum {
    UNBILLED = 'UNBILLED',
    PROCESS_BILLING = 'PROCESS_BILLING',
    INCIDENCE = 'INCIDENCE',
    REMOVED = 'REMOVED',
    INVOICED = 'INVOICED',
    CREATED = 'CREATED',
}

export type ResponseOrderOrphan = {
    rows: OrdersOrphan[],
    count: number,
}

export type OrdersOrphan = {
    id: number;
    type: string;
    oportunityId: string;
    dateRequest: string;
    collaboratorId: string;
    collaborator: string;
    contractAccount: string;
    society: string;
    documentClass: string;
    documentNumber: string;
    totalAmount: number,
}

export type OrderReportType = {
    id: string,
    settlement_id: string,
    settlement_date: string,
    oportunity_id: string,
    document_class: string,
    document_number: string,
    collaborator_identification: string,
    collaborator_name: string,
    society_code: string,
    contract_account: string,
    campaing_id: string,
    amount: string,
    vat: string,
    total_amount: string,
    rediscount: string,
    invoice_id_rediscount: string,
    invoice_document_id: string,
    state: string,
    interest_rate: string,
    quotas: string,
    ticket: string,
    invoice_document: string,
    invoice_date: string,
    client_name: string,
    client_identification: string,
    society_name: string,
}

export type OrderSettlementDuplicate = {
    id: string,
    settlementId: string,
    settlementDate: string,
    oportunityId: string,
    documentClass: string,
    documentNumber: string,
    collaboratorIdentification: string,
    collaboratorName: string,
    societyCode: string,
    contractAccount: string,
    campaingId: string,
    amount: string,
    vat: string,
    totalAmount: string,
    rediscount: string,
    state: string,
    interestRate: string,
    quotas: string,
    ticket: string,
    clientName: string,
    clientIdentification: string,
    societyName: string,
} 

/**
 * @typedef {object} orderDuplicateDb
 * @property {number} count - Cantidad de resultados en base de datos
 * @property {OrderSettlementDuplicate[]} rowa - Lista de ordenes duplicadas
 */
export type orderDuplicateDb = {
    count: number,
    rows: OrderSettlementDuplicate[]
}

export type OrderDuplicate = {
    count: number,
    rows: OrderDuplicateFront[]
}

export type OrderDuplicateFront = {
    id: string,
    oportunityId: string,
    documentClass: string,
    documentNumber: string,
    collaboratorIdentification: string,
    collaboratorName: string,
    clientIdentification: string,
    societyCode: string,
    contractAccount: string,
    amount: string,
    totalAmount: string,
    vat: string,
    rediscount: string,
}

/**
 * @typedef {object} ValidateDuplicateResponse
 * @property {boolean} valid - Validador de que en la base de datos quede la pareja formada (true en caso de si, false en caso de huerfano o mas de una pareja posible)
 * @property {string} oportunityId - Identificador de la oportunidad validada
 * @property {CaseValidate} message - Caso de validacion encontrata (ORPHANED-MORE_DUPLICATE-SUCCESS)
 */
export type ValidateDuplicateResponse = {
    valid: boolean,
    message: CaseValidate,
    oportunityId: string
}

export enum CaseValidate {
    ORPHANED = 'ORPHANED',
    DUPLICATED = 'DUPLICATED',
    SUCCESS = 'SUCCESS'
}

/**
 * @typedef {object} ValidateDuplicate
 * @property {ValidateDuplicateResponse[]} details - detalles de todas las oportunidades a validar
 * @property {boolean} allValid - validacion en conjunto de toda la solicitud
 */
export type ValidateDuplicate = {
    details: ValidateDuplicateResponse[],
    allValid: boolean
}

export type OrdersPairedResponse = {
    rows: OrderPairedType[],
    dateRequest: string | Date,
    count: number,
    total?: TotalValueResponse;
    state:OrderStatusEnum;

}

export type OrderPairedType = {
    id: string
    typeBusiness: OrderTypeEnum
    collaboratorId: string
    collaboratorName: string
    society: string
    societyName: string
    contractAccount: string
    salesOrderTypeCustomer: OrderClassEnum
    salesOrderCustomer: string
    value: string
    campaingId: string
    rediscountPercentage: string
    rediscountValue: string
    rebateTotal: string
    vatCommission: string
    salesCollaboratorTypeDocument: OrderClassEnum
    orderIdRediscount: string
    invoiceId: string
    accountingDocument: string
    invoicedDate: string
    cufe: boolean
    oportunityId: string
    settlementId: string
    settlementDate: string
    datalakeDate: string
    createdOrderDate: string
}

export enum OrderClassEnum {
    ZFM4 = 'ZFM4',
    ZFM6 = 'ZFM6',
    ZFM8 = 'ZFM8',
    ZP12 = 'ZP12'
}

export type FilterTotalValues = {
    society?: string, 
    field?: string, 
    value?: string
}

export type TotalValueResponse = {
    totalOrders: number;
    totalClient: number;
    totalFirm: number;
    totalValue: number;
}

export type ResponseOrdersSociety = {
    rows: OrdersSociety[],
    count: number,
    total: TotalValueResponse,
}

export type OrdersSociety = {
    allied: string,
    allied_name: string,
    customer_sum: number,
    allied_sum: number,
    total: number,
}

export type OrderSettlementSocietiesResponse = {
    data: OrderSettlementReportSociety[],
    name: string
}

/**
 * @typedef {Object} OrderSettlementReportSociety
 * @property {string} allied - identificador de aliado
 * @property {string} allied_name - nombre del aliado
 * @property {number} customer_sum - suma total de cliente
 * @property {number} allied_sum - suma total de alidado
 * @property {number} total - operacion resultante entre suma de cliente y aliado
 */
export type OrderSettlementReportSociety = {
    allied_name: string,
    allied: string,
    order_type: string,
    customer_sum: number,
    allied_sum: number,
    total: number,
}

/**
 * @typedef {Object} OrderSettlementReportGeneral
 * @property {string} id - identificador de orden
 * @property {string} oportunity_id - identificador de oportunidad
 * @property {string} document_number - numero de liquidacion
 * @property {string} document_class - clase de liquidacion
 * @property {string} collaborator_identification - identificacion de colaborador
 * @property {string} collaborator_name - nombre de colaborador
 * @property {string} society_code - codigo de sociedad
 * @property {string} contract_account - cuenta contrato
 * @property {string} campaing_id - identificador de campaña
 * @property {number} amount - valor de liquidacion
 * @property {number} vat - valor de iva
 * @property {number} total_amount - valor total con iva
 * @property {number} rediscount - valor redescuento
 * @property {string} state - estado de orden
 * @property {number} interest_rate - interes
 * @property {string} ticket - ticket
 * @property {string} client_name - nombre de cliente
 * @property {string} client_identification - identificacion de cliente
 * @property {string} society_name - nombre de sociedad
 * @property {string} date_request - fecha de solicitud
 */
export type OrderSettlementReportGeneral = {
    id: string,
    date_invoice: Date,
    oportunity_id: string,
    document_class: string,
    document_number: string,
    collaborator_identification: string,
    collaborator_name: string,
    society_code: string,
    contract_account: string,
    campaing_id: string,
    amount: number,
    vat: number,
    total_amount: number,
    rediscount: number,
    accounting_document_id: string,
    id_invoice_rediscount: string
    state: string,
    interest_rate: number,
    quotas: number,
    ticket: string,
    invoice_document: string,
    date_request: Date,
    client_name: string,
    client_identification: string,
    society_name: string,
}

export const HeaderOrderSettlementReportSociety = [
    'NOMBRE FIRMA',
    'NEGOCIO - TIPO DE PEDIDO',
    'CLIENTE/FIRMA',
    'CXC CLIENTE',
    'CXC FIRMA',
    'TOTAL GENERAL'
]

export enum HeaderKeyValueOrderSettlementReportSociety  {
    'NOMBRE FIRMA'='allied_name',
    'NEGOCIO - TIPO DE PEDIDO'='order_type',
    'CLIENTE/FIRMA'='allied',
    'CXC CLIENTE'='customer_sum',
    'CXC FIRMA'='allied_sum',
    'TOTAL GENERAL'='total'
}

export const HeaderOrderSettlementReportGeneral = [
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
    'FECHA FACTURA',
    'NOMBRE DEL CLIENTE',
    'CÉDULA DEL CLIENTE',
    'FILIAL'
]

export enum HeaderKeyValueOrderSettlementReportGeneral {
    'ID LIQUIDACION' = 'id',
    'FECHA LILQUIDACION' = 'date_request',
    'ID OPORTUNIDAD' = 'oportunity_id',
    'CLASE (TIPO) DE PEDIDO DE VENTA CLIENTE' = 'document_class',
    'ID PEDIDO DE VENTA CLIENTE  / ID PEDIDO REDESCUENTO' = 'document_number',
    'ID FIRMA INSTALADORA/ALIADO' = 'collaborator_identification',
    'FIRMA INSTALADORA/ALIADO' = 'collaborator_name',
    'SOCIEDAD' = 'society_code',
    'CUENTA CONTRATO' = 'contract_account',
    'ID CAMPAÑA' = 'campaing_id',
    'VALOR  NETO SIN IVA' = 'amount',
    'VALOR IVA 19%(COMISIÓN)' = 'vat',
    'VALOR NETO CON IVA' = 'total_amount',
    '% DE REDESCUENTO/COMISION' = 'rediscount',
    'ID DOCUMENTO CONTABLE' = 'accounting_document_id',
    'REFERENCIA' = 'id_invoice_rediscount',
    'ESTADO' = 'state',
    'TASA DE INTERÉS' = 'interest_rate',
    'PLAZO' = 'quotas',
    'ID TICKET' = 'ticket',
    'ID FACTURA REDESCUENTO' = 'invoice_document',
    'FECHA FACTURA' = 'date_invoice',
    'NOMBRE DEL CLIENTE' = 'client_name',
    'CÉDULA DEL CLIENTE' = 'client_identification',
    'FILIAL' = 'society_name'
}

export type OrderSettlementPairedType = {
    typeBusiness: OrderTypeEnum;
    id: string;
    collaboratorId: string;
    collaboratorName: string;
    society: string;
    contractAccount: string;
    salesOrderTypeCustomer: string;
    salesOrderCustomer: string;
    value: number;
    campaingId: string;
    rediscountPercentage: number;
    rediscountValue: number;
    rebateTotal: number;
    vatCommission: number;
    salesCollaboratorTypeDocument: string;
    orderIdRediscount: string;
    invoiceId: string;
    accountingDocument: string;
    oportunityId: string;
    settlementId: string;
    settlementDate : string;
    datalakeDate: string;
    createdOrderDate: string;
    cufe: boolean
}

export type OrderNotCufeListResponse = {
    rows: OrderSettlementPairedType[],
    count: number,
    total: TotalValueResponse
}

/**
 * @typedef {Object} OrdersSettlementTotal
 * @property {string} selected - Ordenes seleccionadas
 * @property {string} couples - Parejas seleccionadas
 * @property {string} excluded - Ordenes excluidas
 * @property {string} totalClient - Sumatoria total de cliente
 * @property {string} totalFirm - Sumatoria total de aliado
 * @property {string} totalValue - Valor total de liquidacion
 */
export type OrdersSettlementTotal = {
    selected: string,
    couples: string,
    excluded: string,
    totalClient: string,
    totalFirm: string,
    totalValue: string
}