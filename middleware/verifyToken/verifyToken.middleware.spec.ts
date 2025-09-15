import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { NextFunction } from 'express';
import { getMockReq, getMockRes } from '@jest-mock/express';

const { res } = getMockRes();

//*************** meddlewares ************************//
import { verifytoken, MessageError, verifyTokenApproval } from './verifyToken.middleware';

//********************** types *******************************//
import { HttpCode } from 'vanti-utils/lib'
import { AuthService } from '../../modules/auth/services/auth.service';
import * as JWT from '../../helpers/jwt/jwt';

describe('should validate autorization middleware', () => {
	let nextFunction: NextFunction = jest.fn();

	it('validate not authorization token', async () => {
		const expectedResponse = {
			message: MessageError.ERROR_TOKEN_AUTHORIZATION,
			status: HttpCode.UNAUTHORIZED,
		};

		verifytoken(getMockReq(), res, nextFunction);

		expect(res.json).toBeCalledWith(expectedResponse);
	});

	it('validate authorization token', async () => {
		let user = {
			name: 'test',
			email: 'test@test.com',
			iat: 1667322189,
		};
		let tokenJwt =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVzIjpbImluc3RhbGxlcl9zaWduYXR1cmUiXSwiZ3JvdXBzIjpbInRlc3QiXSwiZGF0YSI6eyJpZCI6IjEyMyJ9fSwiaWF0IjoxNzAwNjcxMzgwfQ.M7g0FDY8yeNQnOEn7mHI80_z8Baa5VeKrTXvEXzANCQ';
		let token = 'Bearer ' + tokenJwt;

		let req = getMockReq({
			headers: { authorization: token },
		});
		jest.spyOn(AuthService.prototype, 'validateToken').mockResolvedValue(true);
		verifytoken(req, res, nextFunction);
		expect(req.body.userToken).toEqual(tokenJwt);
	});

	it('validate token approval', async () => {
		let user = {
			name: 'test',
			email: 'test@test.com',
			iat: 1667322189,
		};
		let tokenJwt =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVzIjpbImluc3RhbGxlcl9zaWduYXR1cmUiXSwiZ3JvdXBzIjpbInRlc3QiXSwiZGF0YSI6eyJpZCI6IjEyMyJ9fSwiaWF0IjoxNzAwNjcxMzgwfQ.M7g0FDY8yeNQnOEn7mHI80_z8Baa5VeKrTXvEXzANCQ';
		let token = 'Bearer ' + tokenJwt;

		let req = getMockReq({
			headers: { authorization: token },
		});
		jest.spyOn(JWT, 'verifyToken').mockResolvedValue({user});
		verifyTokenApproval(req, res, nextFunction);
		expect(req.body.userToken).toEqual(tokenJwt);
	})

	it('validate not authorization token', async () => {
		const expectedResponse = {
			message: MessageError.ERROR_TOKEN_AUTHORIZATION,
			status: HttpCode.UNAUTHORIZED,
		};

		verifyTokenApproval(getMockReq(), res, nextFunction);

		expect(res.json).toBeCalledWith(expectedResponse);
	});
});
