import { ResponseApi, Axios } from 'vanti-utils/lib'
import { ActiveToken } from '../types/auth.type';
import { IAuthService } from './auth.service.interface';
const { SHARED_SERVICES,URI_AUTH }: any = process.env;

/**
 * @class AuthService Clase que implementa los métodos del servicio de autenticación
 * @implements IAuthService Interface que define los métodos que debe implementar el servicio de autenticación
 */
export class AuthService implements IAuthService {
    private readonly BASE_URL: string = `${SHARED_SERVICES}${URI_AUTH}`;

    async validateToken(token: string, application: string): Promise<boolean> {
        try {
                const url = `${this.BASE_URL}/verify`;
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-application': application,
                };
                const { data } = await Axios.get<ResponseApi<ActiveToken>>(url, { headers });
                return data.data.active;
        }catch (error) {
            log.error("Error al validar el token, %s", error);
            return false;
        }
    }
}