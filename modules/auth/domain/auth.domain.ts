import { AuthService } from '../services/auth.service';
import { IAuthService } from '../services/auth.service.interface';
import { IAuthDomain } from './auth.domain.interface';

/**
 * @name AuthDomain Domain of Auth
 * @description Domain of Auth
 */
export class AuthDomain implements IAuthDomain{
    private readonly authServices: IAuthService;

    constructor() {
        this.authServices = new AuthService();
    }

    /**
     * @see IAuthDomain.validateToken Method to validate token
     */
    async validateToken(token: string, application: string): Promise<boolean> {
        return await this.authServices.validateToken(token, application);
    }

}