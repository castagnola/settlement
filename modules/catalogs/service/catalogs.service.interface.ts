import {configData, ListData} from "../type/catalogs.type";

/**
 * Catalogs Service Interface
 * @interface ICatalogsService
 * @exports
 * @type {ICatalogsService}
 * @property {Promise<configData[] | ListData[]>} getCatalogList - Obtiene el json correspondiente al catalogo
 * @memberof ICatalogsService
 */
export interface ICatalogsService {

    /**
     * Obtiene el json correspondiente al catalogo
     * @param name nombre del catalogo
     * @returns {Promise<configData[] | ListData[]>} Json del catalogo
     * @memberof ICatalogsService
     * @function getCatalogList
     */
    getCatalogList(name: string);
}