import ExcelJS from 'exceljs';
import { BucketService } from "../../../helpers/bucket/bucket.service";
import { EmailService, IEmailService } from "../service";
import { EmailType, GetEmailViewOptions, UploadResponse, CreateEmailsColums, FormatEmailCsvColumn, UploadEmail } from "../type/email.type";
import { IEmailDomain } from "./email.domain.interface";
import streamifier from 'streamifier';
import csvParser from 'csv-parser';
import { AppError } from 'vanti-utils/lib';


const { CREATE_EMAILS_TEMPLATE } = process.env

export class EmailDomain implements IEmailDomain {

    async getEmails(options: GetEmailViewOptions): Promise<EmailType[]> {
        let emailService: IEmailService = new EmailService()
        return await emailService.getEmails(options);
    }

    /**
     * @see IEmailDomain.UploadEmails
     */
    async UploadEmails(file: Buffer): Promise<UploadResponse>{
        const emailData: UploadEmail[] = await this._GetEmailDataCSV(file);
        const emailService: IEmailService = new EmailService();

        let response
        if(emailData.length > 0) {
            let response = await emailService.sendUploadEmail(emailData);
            return await this._createErrorExcel(response);
        } else {
            return await this._createErrorExcel(response, true)

        }
    }

    /**
     * @see IEmailDomain.GetUploadFile
     */
    async GetUploadFile(): Promise<string>{
        const bucketService = new BucketService();
        let file = await bucketService.getFile(CREATE_EMAILS_TEMPLATE)
        return file.toString('base64');
    }

    private async _GetEmailDataCSV(file: Buffer): Promise<UploadEmail[]> {
        const emailList: UploadEmail[] = [];
        const columns = Object.keys(CreateEmailsColums);
        const resultData: FormatEmailCsvColumn[] = [];
    
        const fileContent = file.toString().replace(/^\uFEFF/, '');
        const readableStream = streamifier.createReadStream(fileContent);
    
        return new Promise((resolve, reject) => {
            const jsonData: any[] = [];
            let isHeaderValid = true;
            let headers: string[] = [];
    
            readableStream
                .pipe(csvParser({ separator: ';' }))
                .on('data', (row) => {
                    if (Object.values(row).some(cell => typeof cell === 'string' && cell.trim() !== '')) {
                        jsonData.push(row);
                    }
                })
                .on('headers', (csvHeaders) => {
                    headers = csvHeaders.map(header => header.trim());
                    isHeaderValid = this._validateHeaders(headers, columns);
                    if (!isHeaderValid) {
                        reject(new AppError({message: `Encabezados inválidos`}));
                    }
                })
                .on('end', () => {
                    resultData.push(...this._formatData(jsonData, columns));
                    for (let value of resultData) {
                        emailList.push({
                            bp: value.BP,
                            nit: value.NIT,
                            alliedName: value['NOMBRE ALIADO FIRMA'],
                            active: value.ACTIVO == '1',
                            email: value.CORREO,
                            recipitentName: value['NOMBRE DESTINATARIO'],
                            identification: value.CEDULA,
                            position: value.CARGO,
                            mobileNumber: value.TELEFONO
                        });
                    }
    
                    resolve(emailList);
                })
                .on('error', (error) => {
                    reject(new AppError({message: error.message}));
                });
        });
    }

    private _validateHeaders(csvHeaders: string[], expectedHeaders: string[]): boolean {
        return expectedHeaders.every(header => csvHeaders.includes(header));
    }

    private _formatData(excelData: any[], columns: any[]) {
        return excelData.reduce((acc: any[], el: any) => {
            columns.forEach((column) => {
                if (typeof el[column] === 'object' && el[column] !== null) {
                    el[column] = el[column].text ?? JSON.stringify(el[column]);
                } else if (typeof el[column] === 'undefined' || el[column] === null) {
                    el[column] = '';
                } else {
                    el[column] = String(el[column]);
                }
            });
    
            acc.push({
                ...el,
                error: [],
            });
    
            return acc;
        }, []);
    }

    private async _createErrorExcel(data: UploadResponse, nullValidate: boolean = false): Promise<UploadResponse> {

        if(nullValidate) {

            data = {
                success: 0,
                totalData: 0,
                error: []
            }

            data.error.push({
                bp: '',
                nit: '',
                alliedName: '',
                active: false,
                email: '',
                recipitentName: '',
                identification: '',
                position: '',
                mobileNumber: '',
                error: 'No se encontro ningun registro',
            })
        }

        if (!data.error || data.error.length === 0) {
            log.info("Cargue de excel sin errores");
            
            delete data.error;
            data.errorValid = false;

            return data;
        }
    
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Errores');
    
        worksheet.columns = [
            { header: "BP" , key: 'bp'},
            { header: "NIT" , key: 'nit'},
            { header: "NOMBRE" , key: 'alliedName'},
            { header: "ACTIVO" , key: 'active'},
            { header: "CORREO" , key: 'email'},
            { header: "NOMBRE" , key: 'recipitentName'},
            { header: "CEDULA" , key: 'identification'},
            { header: "CARGO" , key: 'position'},
            { header: "TELEFONO" , key: 'mobileNumber'},
            { header: "ERROR" , key: 'error'}
        ];
    
        data.error.forEach(error => {
            worksheet.addRow({
                bp: error.bp,
                nit: error.nit,
                alliedName: error.alliedName,
                active: error.active ? '1' : '0',
                email: error.email,
                recipitentName: error.recipitentName,
                identification: error.identification,
                position: error.position,
                mobileNumber: error.mobileNumber,
                error: error.error,
            });
        });
    
        const buffer = await workbook.csv.writeBuffer();
        const csvContent = Buffer.from(buffer).toString('utf-8');
    
        const modifiedCsvContent = csvContent.replace(/,/g, ';');
        
        delete data.error
        data.base64 = Buffer.from(modifiedCsvContent).toString('base64');
        data.errorValid = true;

        return data
    }
}