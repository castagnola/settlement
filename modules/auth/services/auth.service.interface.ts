import { ResponseDataAuthService } from '../types/auth.type';

/**
 * @interface IAuthService Interface que define los métodos que debe implementar el servicio de autenticación
 * @method login Método que obtiene el token de autenticación
 * @returns Promise<string> Retorna una promesa con el token de autenticación
 * @method getData Método que obtiene los datos del usuario autenticado
 * @returns Promise<ResponseDataAuthService> Retorna una promesa con los datos del usuario autenticado
 * @throws AppError Retorna un error si ocurre un error al obtener los datos de la API de autenticación
 */
export interface IAuthService {

    /**
     *  Valida la existencia de un token de usuario valido
     * @param token token del usuario
     * @param application aplicacion que hace la solicitud
     * @param typeOrigin origen del login
     * @returns Promise<boolean> Retorna una promesa con el resultado de la validación
     */
    validateToken(token: string, application: string): Promise<boolean>;
}