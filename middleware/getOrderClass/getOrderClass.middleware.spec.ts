import { getMockRes } from "@jest-mock/express";
import { getOrderClass } from './getOrderClass.middleware';

const { res } = getMockRes();


describe('getOrderClass Middleware', () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
        req = { headers: {} };
        res = {};
        next = jest.fn();
    });

    it('debe setear el header x-orderclass a ZMF6 si no está presente', () => {
        getOrderClass(req, res, next);
        
        expect(req.headers['x-orderclass']).toBe('ZFM6');
        
        expect(next).toHaveBeenCalled();
    });

    it('no debe sobreescribir x-orderclass si ya existe', () => {
        req.headers['x-orderclass'] = 'testData';
        getOrderClass(req, res, next);
        
        expect(req.headers['x-orderclass']).toBe('testData');
        
        expect(next).toHaveBeenCalled();
    });
});
