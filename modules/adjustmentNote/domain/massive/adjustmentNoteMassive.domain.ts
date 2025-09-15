import { Readable } from "stream";
import JSONStream from 'JSONStream';
import { GenerateMultiviewXlsx } from "../../../../helpers/xlsx/xlsx";
import { dataXlsx } from "../../../../helpers/xlsx/xlsx.type";
import { AdjustmentNoteHashMassive, HashStatusMassive } from "../../../../models/adjustmentNoteHashMassive";
import { getLastUpload, getMassiveHash, saveMassiveHash } from "../../repository/adjustmentNoteMassive/adjustmentNoteMassive.repository";
import { AdjustmentNoteMassiveService } from "../../service/massive/adjustmentNoteOrdersMassive.service";
import { IAdjustmentNoteMassiveService } from "../../service/massive/adjustmentNoteOrdersMassive.service.interface";
import { AdjustmentNoteMassive, AdjustmentNoteMassiveResponse, HeaderOrdersToAssingMassiveNote, HeadersKeyOrdersToAssingMassiveNote, OrderMassive, OrdersToSaveRelation, OrderValidationStatus, ReturnFileData } from "../../type/adjustmentNoteMassive";
import { IAdjustmentNoteDomainMassive } from "./adjustmentNoteMassive.domain.interface";
import crypto from 'crypto';
import { AppError } from "vanti-utils/lib";

export class AdjustmentNoteDomainMassive implements IAdjustmentNoteDomainMassive {
    private quantityOrdersToChunk: number = 100;
    async getLastUpload(): Promise<any> {
        return await getLastUpload();
    }

    async getOrderMassiveFile(): Promise<ReturnFileData> {
        const adjustmentNoteMassiveService: IAdjustmentNoteMassiveService = new AdjustmentNoteMassiveService();
        let fileData: OrderMassive[] = await adjustmentNoteMassiveService.getMassiveOrdersToFile();

        if (!fileData || fileData.length === 0) {
            log.error({ message: 'orders not found to massive assignation' });
            return {
                base64: '',
                fileName: 'orders not found'
            }
        }

        fileData = await Promise.all(
            fileData.map(async (order) => {
                return {
                    ...order,
                    documentNumberToAssign: undefined,
                };
            })
        );

        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        const fileName = `Asociación_Masiva_Notas_Ajuste_Vanti_${day}${month}${year}_${hours}${minutes}.xlsx`;

        const dataValues = fileData.map((order) => order.documentNumber);
        const hashData: AdjustmentNoteHashMassive = await this.getFileHashMassive(dataValues, fileName);
        const saveMongoData = await saveMassiveHash(hashData);

        log.info(`[getOrdersToNewSettlement] - Guardado hash en mongo con id: ${saveMongoData.id}`)

        let dataToXlsx: dataXlsx[] = [
            {
                data: fileData,
                name: 'BBDD',
                headers: HeaderOrdersToAssingMassiveNote,
                headersKey: HeadersKeyOrdersToAssingMassiveNote
            }
        ];

        log.info('[getOrdersToNewSettlement] - Envio a generar xlsx')
        let base64 = await GenerateMultiviewXlsx(dataToXlsx);
        log.info(`[getOrdersToNewSettlement] - Finalizacion xlsx`)


        return {
            fileName,
            base64
        }
    }

    async getFileHashMassive(fileData: string[], fileName: string): Promise<AdjustmentNoteHashMassive> {
        const hashData: AdjustmentNoteHashMassive = {
            fileName: fileName,
            hash: '',
            status: HashStatusMassive.CREATED
        };

        const totalDocumentNumber = fileData.reduce((sum, item) => sum + (Number(item) || 0), 0);
        const hashString = `${totalDocumentNumber}`;
        const hash = crypto.createHash('sha256').update(hashString).digest('hex');

        hashData.hash = hash;

        return hashData;
    }

    private isInvalidValue(value: any): boolean {
        if (value === null || value === undefined) return true;
        if (typeof value === 'number' && value === 0) return true;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed === '' || trimmed === '0';
        }
        return false;
    }

    private async getHashByFileName(fileName: string): Promise<AdjustmentNoteHashMassive> {
        const hashData = await getMassiveHash(fileName);
        if (!hashData) {
            throw new AppError({ message: `No se encontró hash para el archivo ${fileName}` });
        }
        return hashData;
    }

    private async validateHash(fileData:AdjustmentNoteMassive[], fileName: string): Promise<boolean> {
        const documentData = fileData.map((order) => order.documentNumberAdjustmentNote);
        const hashGenerated = await this.getFileHashMassive(documentData, fileName);
        const hashMongo = await this.getHashByFileName(fileName.split('.')[0]);

        if (hashGenerated.hash !== hashMongo.hash) {
            log.error({ message: `El archivo ${fileName} ha sido modificado` });
            return false;
        }
        return true;
    }

    private async validateOrders(fileData:AdjustmentNoteMassive[]) {
        const dataMapped = fileData.reduce((acc, item) => {
            acc.ordersVantilisto.push(String(item.documentNumber));
            acc.ordersMassively.push(String(item.documentNumberAdjustmentNote));
            return acc;
        }, { ordersVantilisto: [], ordersMassively: [] });
        log.info(`[validateOrders] - Cantidad de datos al Mapeo de datos: %s`, {"ordersVantilisto": dataMapped?.ordersVantilisto?.length,"ordersMassively": dataMapped?.ordersMassively?.length});

        const adjustmentNoteMassiveService: IAdjustmentNoteMassiveService = new AdjustmentNoteMassiveService();

        const response = await adjustmentNoteMassiveService.validateMassiveOrders(dataMapped) as OrderValidationStatus;
        return response;
    }

    private async saveMassiveOrderRelation(fileData: AdjustmentNoteMassive[]): Promise<void> {
        const dataMapperd: OrdersToSaveRelation[] = fileData.map(item => ({
            vantilisto: String(item.documentNumber),
            adjusment_note: String(item.documentNumberAdjustmentNote)
        }))
        const adjustmentNoteMassiveService: IAdjustmentNoteMassiveService = new AdjustmentNoteMassiveService();
        const response = await adjustmentNoteMassiveService.saveMassiveOrderRelation(dataMapperd);
        log.info(`[saveMassiveOrderRelation] - Respuesta del guardado: %s`, JSON.stringify(response));
    }

    private async chunksToValidate(fileData: AdjustmentNoteMassive[], chunkSize: number) {
        for (let i = 0; i < fileData.length; i += chunkSize) {
            const chunk = fileData.slice(i, i + chunkSize);
            log.info(`[chunksToValidate] - Chunk creado: %s pos: %s`, chunk.length, i);

            const val = await this.validateOrders(chunk);
            log.info(`[chunksToValidate] - Resultado de la validación del chunk: %s`, val);
            if (val !== OrderValidationStatus.VALID) {
                log.error(`[chunksToValidate] - Error en la validación del chunk: %s`, val);
                return val;
            }
        }
        return OrderValidationStatus.VALID;
    }

    private async chunksToSave(fileData: AdjustmentNoteMassive[], chunkSize: number) {
        for (let i = 0; i < fileData.length; i += chunkSize) {
            const chunk = fileData.slice(i, i + chunkSize);
            log.info(`[chunksToValidate] - Chunk creado: %s pos: %s`, chunk.length, i);

            await this.saveMassiveOrderRelation(chunk);
        }
    }

    async saveMassiveOrders(file: Buffer, fileName: string): Promise<AdjustmentNoteMassiveResponse> {
        const fileData:AdjustmentNoteMassive[] = await this._convertBufferToData(file);
        const isValidHash = await this.validateHash(fileData, fileName);
        if (!isValidHash) {
            return { save: false, responseType: OrderValidationStatus.FILE_ERROR };
        }

        const dataFiltered = fileData.filter(item => item.documentNumber !== '' && item.documentNumber !== null && item.documentNumber !== undefined);
        if (dataFiltered.length === 0) {
            return { save: false, responseType: OrderValidationStatus.EMPTY_ORDES };
        }

        log.info(`[saveMassiveOrders] - Cantidad de datos filtrados: %s`, dataFiltered.length);
        const validateData = await this.chunksToValidate(dataFiltered, this.quantityOrdersToChunk);

        if (validateData === OrderValidationStatus.EMPTY_ORDES ) {
            return { save: false, responseType: validateData };
        }

        if (validateData !== OrderValidationStatus.VALID) {
            return { save: false, responseType: validateData };
        }

        await this.chunksToSave(dataFiltered, this.quantityOrdersToChunk);
        return { save: true, responseType: OrderValidationStatus.VALID };
    };

    private async _convertBufferToData(buffer: Buffer): Promise<any> {
        const bufferToStream = (buffer: Buffer) => {
            const readable = new Readable();
            readable.push(buffer);
            readable.push(null);
            return readable;
        };

        const jsonStream = JSONStream.parse('*');
        const readStream = bufferToStream(buffer);
        readStream.pipe(jsonStream);

        return new Promise<AdjustmentNoteMassive[]>((resolve, reject) => {
            const filterDataArray: AdjustmentNoteMassive[] = [];

            jsonStream.on('data', (data: any) => {
                try {
                    const adjustmentNote = data["NOTA DE AJUSTE"];
                    if (this.isInvalidValue(adjustmentNote)) {
                        reject(new Error(`Todos los pedidos deben estar asociados a sus nota de ajuste correspondientes, por favor verifique el archivo`));
                        readStream.destroy();
                        return;
                    }

                    filterDataArray.push({
                    documentNumber: data["PEDIDO ZP12"],
                    documentNumberAdjustmentNote: adjustmentNote,
                    });
                } catch (error) {
                  reject(new Error('Error procesando línea del archivo'));
                }
              });

            jsonStream.on('end', () => resolve(filterDataArray));
            jsonStream.on('error', (error) => reject(new Error(`Error al leer archivo de settlement: ${error.message}`)));
        });
    }
}