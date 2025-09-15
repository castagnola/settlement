import {describe, expect, it } from '@jest/globals';

//************* helpers *********************************//
import { createToken, decodeToken, verifyToken } from "./jwt";

let tokenTest ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InRva2VuIjoidG9rZW4ifSwiaWF0IjoxNjY5MDU5MzEyfQ.WdV85lSEAmRvewMIQ-0Gr-_Wex1QeZJHxWUEWAN3emI";

 describe("jwt methods token", () => {

   it("response success validate token", () => {
   	let data = decodeToken(tokenTest);
   	expect(data.user.token).toEqual("token")
   })

   it("response success create token", () => {
   	let info = {
   		token:"token"
   	}
	const secret = "sdaasdasdjabsbdsad"

   	let token = createToken(info, secret, '1h');
   	expect(token).toBeDefined();
   })

   it("response success validate token", () => {
	
	  const secret = "sdaasdasdjabsbdsad"

   	let data = verifyToken(tokenTest, secret);
   	expect(data.user.token).toEqual("token")
   })
})