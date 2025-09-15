import {ICatalogsService} from "../service/catalogs.service.interface";
import {CatalogsService} from "../service/catalogs.service";
import {configData, ListData} from "../type/catalogs.type";
import {AppError} from "vanti-utils/lib";
import {ICatalogsDomain} from "./catalogs.domain.interface";
const { CONFIG_ENV } = process.env;

/**
 * Catalogs Domain
 * @class CatalogsDomain
 * @implements {ICatalogsDomain}
 * @exports
 * @type {ICatalogsDomain}
 * @property {ICatalogsService} catalogsService - Catalogs service
 * @function OptionsMenu - Get options menu by group
 * @function getCatalogList - Get list by catalog name
 * @memberof CatalogsDomain
 */
export class CatalogsDomain implements ICatalogsDomain {
    private readonly catalogsService: ICatalogsService;
    constructor() {
        this.catalogsService = new CatalogsService();
    }

    /**
     * @see ICatalogsDomain.OptionsMenu
     */
    async OptionsMenu(groups: string[], catalog: string): Promise<ListData[]> {
        let config: configData[] = await this.catalogsService.getCatalogList('configCatalogs')
        const listInfo =  config.find(item => item.type == catalog) || null;
        if(!listInfo){
            throw new AppError({message:"catalog not found"})
        }
        let listData: ListData[] = await this.catalogsService.getCatalogList(listInfo.fileName)
        listData = listData.filter(item=>item.environments.includes(CONFIG_ENV))

        //if(groups) {
        //    const set = new Set(groups)
        //    listData = listData.filter(item => item[listInfo.filter].some((r: string) => set.has(r)))
        //}

        return listData.map(item => {
            return {
                name: `${(item as any)[listInfo.name]}`,
                code: `${(item as any)[listInfo.code]}`,
                class: `${(item as any)[listInfo.value]}`
            };
        });
    }

    /**
     * @see ICatalogsDomain.getCatalogList
     * @implements {ICatalogsDomain.getCatalogList}
     */
    async getCatalogList(catalog: string): Promise<ListData[]> {
        let config: configData[] = await this.catalogsService.getCatalogList('configCatalogs')
        const listInfo =  config.find(item => item.type == catalog) || null;

        if(!listInfo){
            throw new AppError({message:"catalog not found"})
        }
        let listData: ListData[] = await this.catalogsService.getCatalogList(listInfo.fileName)
        return listData.map(item => {
            let convert = {
                name: `${(item as any)[listInfo.name]}`,
                code: `${(item as any)[listInfo.code]}`
            }
            return convert;
        });
    }
}