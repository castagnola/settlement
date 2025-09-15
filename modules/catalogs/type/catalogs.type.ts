/**
 * Estructura general
 * @typedef {object} ListData
 * @property {string} name - Valor que representa el nombre a mostrar en la linea
 * @property {string} code - Valor para tomar al seleccionar el nombre de la lista
 * @property {string} filter - Valor para filtrar la lista
 * @property {string} fileName - Valor para obtener el nombre del archivo
 */
export type ListData = {
    name: string;
    code: string;
    class?: string;
    filter?: string;
    fileName?: string;
    environments?: string[];
};

/**
 * Estructura general
 * @typedef {object} configData
 * @property {string} type - Valor que representa el tipo de configuracion
 * @property {string} name - Valor que representa el nombre a mostrar en la linea
 * @property {string} code - Valor para tomar al seleccionar el nombre de la lista
 * @property {string} filter - Valor para filtrar la lista
 * @property {string} fileName - Valor para obtener el nombre del archivo
 * @property {string} obtencionType - Valor para obtener el tipo de obtencion
 */
export type configData = {
    type: string,
    name: string,
    code: string,
    value?: string,
    filter?: string,
    fileName?: string,
    obtencionType: string
}
