import { describe, expect, it, jest } from '@jest/globals';

import { AuthDomain } from './auth.domain';
import { IAuthDomain } from './auth.domain.interface';
import {AuthService} from "../services/auth.service";

describe('should validate AuthDomain', () => {


	it('should validate validateToken method', async () => {
		const authDomain: IAuthDomain = new AuthDomain();
		jest.spyOn(AuthService.prototype, 'validateToken').mockResolvedValue(true)
		let tokenApp =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQW5kcmVzIiwiZW1haWwiOiJhbmRyZXNAZ21haWwuY29tIiwiaWF0IjoxNjY3MzIyMTg5fQ.9qz1VTTUZf8PJcYiCK7-YRuuDUcJeMniaCwhHVeQGJA';
		let isValid = authDomain.validateToken(tokenApp, 'test');

		expect(isValid).toBeTruthy();
	});

});
