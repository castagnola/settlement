/**
 * @name IAuthDomain Interface of AuthDomain
 * @description Interface of AuthDomain
 * @abstract 
 */
export interface IAuthDomain {

    /**
     *  @name validateToken Method to validate token
     * @param token token to validate
     * @param application application to validate
     */
    validateToken(token: string, application: string): Promise<boolean>;
}