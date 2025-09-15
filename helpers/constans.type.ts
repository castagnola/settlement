const { URL_ALB, PORT_CORE, PATH_SETTLEMENT_SAP, PATH_SETTLEMENT_CORE ,PORT_SAP, PREFIX, API_CORE_URI} = process.env;

export const URI_SETTLEMENT_SAP = `${URL_ALB}${PORT_SAP || ''}${PATH_SETTLEMENT_SAP}/api`;
export const URI_SETTLEMENT_CORE = `${URL_ALB}${PORT_CORE || ''}${PATH_SETTLEMENT_CORE}/api`;
export const URI_SETTLEMENT_RESPONSE = `${URL_ALB}${PREFIX || ''}/api/vantilisto/update-settlement`;
export const URI_CORE_API = API_CORE_URI;