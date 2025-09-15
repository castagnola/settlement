import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { dataXlsx, OptionProtectXlsx } from './xlsx.type';

/**
 * Metodo para crear un excel con varias pestañas con informacion diferente
 * @param data - Objeto con la pareja de informacion, el nombre de la pestaña y la informacion que agregara 
 * (tener en cuenta que el nombre de cada pestaña deben ser diferentes - tener en cuenta que el objeto debe tener los nombres como se quieren mostrar en el excel)
 * @returns string con el base64 del archivo resultante
 */
const unlinkAsync = promisify(fs.unlink);

export const GenerateMultiviewXlsx = async (data: dataXlsx[]): Promise<string> => {
    const tempFilePath = path.join(__dirname, `temp_${Date.now()}.xlsx`);
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
        filename: tempFilePath,
        useStyles: true,
        useSharedStrings: true
    });

    log.info('[GenerateMultiviewXlsx] - Inicio de recorrido por pestaña del Excel');

    data.forEach(item => {
        const worksheet = workbook.addWorksheet(item.name);

        worksheet.columns = item.headers.map(header => ({
            header: header,
            key: item.headersKey[header],
            width: header.length + 2
        }));

        item.data.forEach(row => {
            const rowData: Record<string, any> = {};
            item.headers.forEach(header => {
                const key = item.headersKey[header];
                let value = row[key];

                if (value instanceof Date) {
                    value = value.toISOString().split('T')[0];
                } else if (!isNaN(Number(value))) {
                    value = Number(value);
                } else {
                    value = value || "";
                }

                rowData[key] = value;
            });

            worksheet.addRow(rowData).commit();
        });

        worksheet.commit();
    });

    log.info('[GenerateMultiviewXlsx] - Fin de recorrido por pestaña del Excel - Inicio de escritura en archivo');

    await workbook.commit();

    const fileBuffer = await fs.promises.readFile(tempFilePath);
    const base64Excel = fileBuffer.toString('base64');

    await unlinkAsync(tempFilePath);

    log.info('[GenerateMultiviewXlsx] - Archivo convertido a base64 y archivo temporal eliminado');

    return base64Excel;
};

export const GenerateMultiviewXlsxWithProtect = async (data: dataXlsx[], options: OptionProtectXlsx): Promise<string> => {
    const workbook = new ExcelJS.Workbook();
    log.info('[GenerateMultiviewXlsxWithProtect] - Inicio de recorrido por pestaña del Excel');

    for (const item of data) {
        const worksheet = workbook.addWorksheet(item.name);

        worksheet.columns = item.headers.map(header => ({
            header: header,
            key: item.headersKey[header],
            width: header.length + 2
        }));

        for (const row of item.data) {
            const rowData = item.headers.map((header) => {
                const value = row[item.headersKey[header]];
                if (!isNaN(Number(value))) {
                    return Number(value);
                } else {
                    return value || "";
                }
            });

            worksheet.addRow(rowData);
        }

        worksheet.protect(options.password, { selectLockedCells: true });

        worksheet.columns.forEach(column => {
            if (options.unlockedColumns.includes(column.header as string)) {
                column.eachCell(cell => {
                    cell.protection = { locked: false };
                });
            }
        });
    }

    log.info('[GenerateMultiviewXlsxWithProtect] - Fin de recorrido por pestaña del Excel - Inicio de escritura en archivo');

    const tempFilePath = path.join(__dirname, `temp_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(tempFilePath);

    const fileBuffer = await fs.promises.readFile(tempFilePath);
    const base64Excel = fileBuffer.toString('base64');

    await unlinkAsync(tempFilePath);
    log.info('[GenerateMultiviewXlsxWithProtect] - Archivo convertido a base64 y archivo temporal eliminado');

    return base64Excel;
};
