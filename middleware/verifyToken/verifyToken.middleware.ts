import { Request, Response, NextFunction } from 'express';

//*********************** helpers *****************************//
import { decodeToken, verifyToken } from '../../helpers/jwt/jwt';
import { HttpCode, handleError } from 'vanti-utils/lib'
const { SECRET_APPROVAL_TOKEN } = process.env

import { AuthService } from '../../modules/auth/services/auth.service';

export enum MessageError {
	ERROR_TOKEN_AUTHORIZATION = "You don't have permissions for the request",
}

/**
 * Valida la existencia de un token de usuario valido
 * @param req Request de la petición
 * @param res Respuesta de la petición
 * @param next Funcion para dar continuidad con la aplicación
 */
export const verifytoken = async (req: Request, res: Response, next: NextFunction) => {
	const bearerHeader = req.headers['authorization'];
	//Token para pruebas en postman
	const token = bearerHeader ? bearerHeader.split(' ')[1] : null;
	if (token) {
		
		const decodedToken: any = decodeToken(token);
		
		req.body.userToken = token;
		req.body.user = decodedToken.user;
		req.body.userEmail = decodedToken.user.email;
		req.body.roles = decodedToken.user.roles;
		req.body.rol = decodedToken.user.roles[0];
		req.body.groups = decodedToken.user?.groups;

		const authService = new AuthService();
		const validateToken = await authService.validateToken(token, decodedToken.user.application);
		if (validateToken) {
			next();
		} else {
			log.error("[Token] El token no es valido");
			handleError(res, HttpCode.UNAUTHORIZED, MessageError.ERROR_TOKEN_AUTHORIZATION);
		}
	} else {
		log.error("[Token] No se ha enviado el token de autorización");	
		handleError(res, HttpCode.UNAUTHORIZED, MessageError.ERROR_TOKEN_AUTHORIZATION);
	}
};

export const verifyTokenApproval = async (req: Request, res: Response, next: NextFunction) => {
	const bearerHeader = req.headers['authorization'];
	const token = bearerHeader ? bearerHeader.split(' ')[1] : null;
	if (token) {
		
		const validToken: any = verifyToken(token, SECRET_APPROVAL_TOKEN);		
		req.body.userToken = token;

		if (validToken) {
			next();
		} else {
			log.error("[Token] El token no es valido");
			handleError(res, HttpCode.UNAUTHORIZED, MessageError.ERROR_TOKEN_AUTHORIZATION);
		}
	} else {
		log.error("[Token] No se ha enviado el token de autorización");	
		handleError(res, HttpCode.UNAUTHORIZED, MessageError.ERROR_TOKEN_AUTHORIZATION);
	}
}
