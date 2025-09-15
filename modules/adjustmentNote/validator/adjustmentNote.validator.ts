import { body, param, query } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { handleValidator } from 'vanti-utils/lib';

//************** helpers *******************//


/**
 * Valida el society, page y limit
 * @function validateAvailabilityRequest Devuelve un middleware de validación
 */

export const validateGetPaginatedResultsParam = [
    query('society').exists().notEmpty().withMessage('society is required'),
    query('page').exists().notEmpty().withMessage('page is required'),
    query('limit').exists().notEmpty().withMessage('limit is required'),
    (req: Request, res: Response, next: NextFunction) => {
        handleValidator(req, res, next);
    }
];

/**
 * Valida el society
 * @function validateAvailabilityRequest Devuelve un middleware de validación
 */
export const validateGetTotalBySocietyParam = [
    query('society').exists().notEmpty().withMessage('society is required'),
    (req: Request, res: Response, next: NextFunction) => {
        handleValidator(req, res, next);
    }
];

/**
 * Valida el page y limit
 * @function validate Devuelve un middleware de validación
 */

export const validateGetAdjustmentNotesSettlement = [
    query('page').exists().notEmpty().withMessage('page is required'),
    query('limit').exists().notEmpty().withMessage('limit is required'),
    (req: Request, res: Response, next: NextFunction) => {
        handleValidator(req, res, next);
    }
];

/**
 * Valida los datos para marcar órdenes
 */
export const validateMarkOrders = [
  body("orders")
    .exists()
    .withMessage("orders is required")
    .bail()
    .notEmpty()
    .withMessage("orders cannot be empty"),

  body("fileName")
    .exists()
    .notEmpty()
    .withMessage("fileName is required"),

  (req: Request, res: Response, next: NextFunction) => {
    handleValidator(req, res, next);
  },
];

export const validateNewSettlement = [
  query("fileName")
    .exists()
    .notEmpty()
    .withMessage("fileName is required"),

  (req: Request, res: Response, next: NextFunction) => {
    handleValidator(req, res, next);
  },
];