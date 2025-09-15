import { Request, Response, Router } from "express";
import { handleResponse } from "vanti-utils/lib";
import {verifytoken} from "../../../middleware/verifyToken/verifyToken.middleware";
import {ICatalogsDomain} from "../domain/catalogs.domain.interface";
import {CatalogsDomain} from "../domain/catalogs.domain";
import {ListData} from "../type/catalogs.type";

export const CatalogsController = Router();

/**
 * Response Success
 * @typedef { object } handleResponse
 * @property { number } status - Status code: 200
 * @property { Array<ListData> } data - Data response: [{code: string, name: string}]
 */
/**
 * Response Error
 * @typedef { object } ResponseError
 * @property { number } status - Status code: 400
 * @property { string } message - Error message
 */
/**
 * GET /settlement/api/catalogs/options-menu
 * @tags Catalogs
 * @summary Get options menu by group
 * @param { string } query.required - Catalog name
 * @return {handleResponse} 200 - Success response - application/json
 * @return {ResponseError} 400 - Error response - application/json
 * @security Bearer
 * @example response - 200 - Success response example
 * {
 * "status": 200,
 * "data": [{"code": "1","name": "Option 1"}]
 * }
 * @example response - 400 - Error response example
 * {
 * "status": 400,
 * "message": "Error message"
 * }
 */
CatalogsController.get('/options-menu', verifytoken, async (req: Request, res: Response) => {
        const groups = req.body.groups;
        const catalog = req.query.catalog;
        const listDomain: ICatalogsDomain = new CatalogsDomain();
        const data: ListData[] = await listDomain.OptionsMenu(groups, catalog as string);
        handleResponse(res, 200, data);
})

/**
 * GET /settlement/api/catalogs/list
 * @tags Catalogs
 * @summary Get list by catalog name
 * @param { string } query.required - Catalog name
 * @return {handleResponse} 200 - Success response - application/json
 * @return {ResponseError} 400 - Error response - application/json
 * @security JWT
 * @example response - 200 - Success response example
 * {
 * "status": 200,
 * "data": [{"code": "1", "name": "Option 1"}]
 * }
 * @example response - 400 - Error response example
 * {
 * "status": 400,
 * "message": "Error message"
 * }
 */
CatalogsController.get('/list', verifytoken, async (req: Request, res: Response) => {
    const catalog = req.query.catalog;
    const listDomain: ICatalogsDomain = new CatalogsDomain();
    const data: ListData[] = await listDomain.getCatalogList(catalog as string);
    handleResponse(res, 200, data);
})
