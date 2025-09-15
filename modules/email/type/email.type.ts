
/**
 * @typedef {Object} UploadEmail
 * @property {string} bp - identificador de bp
 * @property {string} nit - identificador de aliado
 * @property {string} alliedName - nombre del aliado
 * @property {string} active - estado del correo
 * @property {string} email - correo
 * @property {string} recipitentName - nombre del destinatario
 * @property {string} identification - identificacion del destinatario
 * @property {string} position - cargo del destinatario
 * @property {string} mobileNumber - telefono del destinatario
 */
export type UploadEmail = {
    bp: string,
    nit: string,
    alliedName: string,
    active: boolean,
    email: string,
    recipitentName: string,
    identification: string,
    position: string,
    mobileNumber: string,
    error?: string,
} 

export const CreateEmailsColums = {
    'BP': {
        name: 'email',
        regex: '^[a-zA-Z0-9\\s]{1,50}',
    },
    'NIT': {
        name: 'nit',
        regex: '^[a-zA-Z0-9\\s]{1,50}',
    },
    'NOMBRE ALIADO FIRMA': {
        name: 'alliedName',
        regex: '^[a-zA-Z0-9\\s]{1,10}$',
    },
    'ACTIVO': {
        name: 'active',
        regex: '^[a-zA-Z0-9\\s]{1,10}$',
    },
    'CORREO': {
        name: 'email',
        regex: '^[a-zA-Z0-9\\s]{0,10}$',
    },
    'NOMBRE DESTINATARIO': {
        name: 'recipitentName',
        regex: '^[a-zA-Z0-9\\s]{0,10}$',
    },
    'CEDULA': {
        name: 'identification',
        regex: '^[a-zA-Z0-9\\s]{0,10}$',
    },
    'CARGO': {
        name: 'position',
        regex: '^[a-zA-Z0-9\\s]{0,10}$',
    },
    'TELEFONO': {
        name: 'mobileNumber',
        regex: '^[a-zA-Z0-9\\s]{0,10}$',
    }
};

export type FormatEmailCsvColumn = {
    'BP':string | undefined;
    'NIT':string | undefined;
    'NOMBRE ALIADO FIRMA':string | undefined;
    "ACTIVO":string | undefined;
    "CORREO":string | undefined;
    "NOMBRE DESTINATARIO":string | undefined;
    "CEDULA":string | undefined;
    "CARGO":string | undefined;
    "TELEFONO":string | undefined;
}
export type GetEmailViewOptions = {
    page?: number;
    limit?: number;
    fieldOrder?: string;
    orderType?: string;
    field? : string;
    value?: string;
}

export type EmailType = {
    id: string;
    recipientName: string;
    email: string;
    active: boolean;
    mobileNumber: string;
    identification: string;
    position: string;
    collaboratorId: string;
    collaboratorIdentification: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
};

/**
 * @typedef {Object} UploadResponse
 * @property {UploadEmail[]}  error - Cargas fallidas
 * @property {string}  success - total de datos cargador
 * @property {string}  totalData - datos totales a procesar
 * @property {string}  base64 - Archivo de base64 con errores
 * @property {string}  errorValid - validacion boolean de cargue exitoso
 */
export type UploadResponse = {
    error?: UploadEmail[],
    success: number,
    totalData: number,
    base64?: string,
    errorValid?: boolean,
}
