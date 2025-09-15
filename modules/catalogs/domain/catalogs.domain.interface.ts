import {ListData} from "../type/catalogs.type";

/**
 * Catalogs Domain Interfac
 * @interface ICatalogsDomain
 * @exports
 * @type {ICatalogsDomain}
 * @property {Promise<ListData[]>} OptionsMenu - Get options menu by group
 * @property {Promise<ListData[]>} getCatalogList - Get list by catalog name
 */
export interface ICatalogsDomain {
    /**
     * Get options menu by group
     * @param group user group
     * @param catalog catalog name
     * @returns {Promise<ListData[]>} List of options menu
     * @memberof ICatalogsDomain
     * @function OptionsMenu
     */
    OptionsMenu(group: string[], catalog: string): Promise<ListData[]>;

    /**
     * Get list by catalog name
     * @param catalog catalog name
     * @returns {Promise<ListData[]>} List of catalogs
     * @memberof ICatalogsDomain
     * @function getCatalog
     */
    getCatalogList(catalog: string): Promise<ListData[]>;
}