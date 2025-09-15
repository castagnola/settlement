import jwt from 'jsonwebtoken'


/**
 * Crea un token con llave jwt
 * @param data información contenida en el token jwt
 * @return string con token generado
 * */
export const createToken = (data:any, secret:string, limitTime: string):string=>{
	let token = jwt.sign({ user: data }, secret, { expiresIn: limitTime });
	return token;
}

/**
 * Desencripta la información de un token
 * @param token string con el token encriptado
 * @return información decodificada del token
 * */
export const verifyToken = (token:string, secret:string):any=>{
	try {
		let decoded = jwt.verify(token, secret);
		return decoded;	
	} catch (error) {
		return null
	}
}

/**
 * Desencripta la información de un token
 * @param token string con el token encriptado
 * @return información decodificada del token
 * */
export const decodeToken = (token: string) : any => {
	return jwt.decode(token);
}
