import { describe, it } from '@jest/globals';
import { dataXlsx, OptionProtectXlsx } from './xlsx.type';
import { GenerateMultiviewXlsx, GenerateMultiviewXlsxWithProtect } from './xlsx';

describe("Validacion de funcionamiento del helper - creacion de excel", ()  => {
    it("validacion de conversion correcta", async () => {

        enum headerKeyTest {
            'IDENTIFICADOR' = 'id',
            'VALOR' = 'value'
        } 

        const dataXlsxTest: dataXlsx[] = [
            {
                data: [
                    {
                        id: 'testData',
                        value: 'testData'
                    }
                ],
                headers: ['IDENTIFICADOR','VALOR'],
                headersKey: headerKeyTest,
                name: 'testData'
            }
        ] 

        const result = await GenerateMultiviewXlsx(dataXlsxTest);

        expect(result).toBeDefined()
    })

    it("validacion de conversion xlsx protegido", async () => {

        enum headerKeyTest {
            'IDENTIFICADOR' = 'id',
            'VALOR' = 'value'
        } 

        const dataXlsxTest: dataXlsx[] = [
            {
                data: [
                    {
                        id: 'testData',
                        value: 'testData'
                    }
                ],
                headers: ['IDENTIFICADOR','VALOR'],
                headersKey: headerKeyTest,
                name: 'testData'
            }
        ] 

        const options: OptionProtectXlsx = {
            password: '',
            unlockedColumns: ['VALOR']
        }

        const result = await GenerateMultiviewXlsxWithProtect(dataXlsxTest,options);

        expect(result).toBeDefined()
    })
})