
/**
 * Middleware para setear el header de la clase de orden
 * @param {object} req - Objeto de peticion de Express
 * @param {object} res - Objeto de respuesta de Express
 * @param {function} next - Funcion next de Express
 */
export const getOrderClass = (req: any, res: any, next: any) => {
    req.headers['x-orderclass'] = req.headers['x-orderclass'] || 'ZFM6';
    next();
}