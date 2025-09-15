import { query } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { handleValidator } from 'vanti-utils/lib';
//************** helpers *******************//


/**
 * Valida la direccion del cliente
 * @function validateAvailabilityRequest Devuelve un middleware de validación
 */

export const validateGetOrdersParam = [
    query('limit').exists().notEmpty().withMessage('limit is required'),
    query('page').exists().notEmpty().withMessage('page is required'),
    (req: Request, res: Response, next: NextFunction) => {
        handleValidator(req, res, next);
    }
];;
