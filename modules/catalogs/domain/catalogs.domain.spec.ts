import { describe, it, jest, expect } from '@jest/globals';
import { ListData, configData } from '../type/catalogs.type';
import { CatalogsService } from '../service/catalogs.service';
import { ICatalogsDomain } from './catalogs.domain.interface';
import { CatalogsDomain } from './catalogs.domain';
import { AppError } from 'vanti-utils/lib';


describe('Should validate list domain', () => {
    it('should validate option list menu method', async ()=>{
        let dataReturn: ListData[] = [
            {
                name: 'testData',
                code: 'testData',
                class: 'testData',
            }
        ]
        let retunInfo = [{
            name: 'testData',
            id: 'testData',
            class: 'testData',
            roles: ['rol'],
            environments: ['test']
        }]

        let configInfo = [
            {
                type: "OptionsListMenu",
                name: "name",
                code: "id",
                value: "class",
                filter: "roles",
                fileName: "optionsList"
            }
        ]
        let listDomain: ICatalogsDomain = new CatalogsDomain()

        jest.spyOn(CatalogsService.prototype, 'getCatalogList').mockResolvedValueOnce(configInfo);
        jest.spyOn(CatalogsService.prototype, 'getCatalogList').mockResolvedValueOnce(retunInfo);

        const res = await listDomain.OptionsMenu(['rol'], 'OptionsListMenu')

        expect(res).toEqual(dataReturn);
    })

    it('should validate option list menu method error', async ()=>{
      
        let configInfo = [
            {
                type: "OptionsListMenus",
                name: "name",
                code: "id",
                value: "class",
                filter: "roles",
                fileName: "optionsList"
            }
        ]
        let listDomain: ICatalogsDomain = new CatalogsDomain()

        jest.spyOn(CatalogsService.prototype, 'getCatalogList').mockResolvedValueOnce(configInfo);

        try {
            await listDomain.OptionsMenu(['rol'], 'OptionsListMenu')
        } catch (error) {
            expect(error).toBeInstanceOf(AppError)
        }
    })

    it('validacion de consulta de datos especificos', async ()=>{
        let dataReturn: ListData[] = [
            {
                name: 'testData',
                code: 'testData',
            }
        ]
        let retunInfo = [{
            name: 'testData',
            id: 'testData',
            roles: ['rol']
        }]

        let configInfo = [
            {
                type: "OptionsListMenu",
                name: "name",
                code: "id",
                filter: "roles",
                fileName: "optionsList"
            }
        ]
        let listDomain: ICatalogsDomain = new CatalogsDomain()

        jest.spyOn(CatalogsService.prototype, 'getCatalogList').mockResolvedValueOnce(configInfo);
        jest.spyOn(CatalogsService.prototype, 'getCatalogList').mockResolvedValueOnce(retunInfo);

        const res = await listDomain.getCatalogList('OptionsListMenu')

        expect(res).toEqual(dataReturn);
    })

    it('validacion de consulta de datos especificos error', async ()=>{
      
        let configInfo = [
            {
                type: "OptionsListMenus",
                name: "name",
                code: "id",
                filter: "roles",
                fileName: "optionsList"
            }
        ]
        let listDomain: ICatalogsDomain = new CatalogsDomain()

        jest.spyOn(CatalogsService.prototype, 'getCatalogList').mockResolvedValueOnce(configInfo);

        try {
            await listDomain.getCatalogList('OptionsListMenu')
        } catch (error) {
            expect(error).toBeInstanceOf(AppError)
        }
    })

});