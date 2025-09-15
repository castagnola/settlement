import fs from 'fs';
import { join } from 'path';
import { ICatalogsService } from "./catalogs.service.interface";
import {configData, ListData} from "../type/catalogs.type";

/**
 * Servicio de catalogos
 * @class CatalogsService
 * @implements {ICatalogsService}
 * @exports
 * @type {ICatalogsService}
 * @property {Promise<configData[] | ListData[]>} getCatalogList - Obtiene el json correspondiente al catalogo
 * @memberof CatalogsService
 */
export class CatalogsService implements ICatalogsService {

    /**
     * @see ICatalogsService.getCatalogList
     * @implements {ICatalogsService.getCatalogList}
     */
    async getCatalogList(name: string){

        const listJson = await fs.promises.readFile(
            join('src', `datajson/${name}.json`),
            'utf-8'
        );

        return JSON.parse(listJson);
    }
}
