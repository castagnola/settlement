import { describe, it, jest, expect } from '@jest/globals';
import { ItransversalService } from './itransversal.interface';
import { TransversalService } from './transversal.service';
import { Axios } from 'vanti-utils/lib';
import { EmailData } from "../type/transversales.type";

//******************* mocks ******************************//
jest.mock("vanti-utils/lib");
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

describe('validate generate transversal', () => {

    it('validate send email', async ()=> {
        
        let emailSendData: EmailData = {
            email: 'testData',
            name: 'testData',
            subject: 'testData',
            message: 'testData',
            template: 'testData',
            parameters: {
                projectName:  'testData',
                consecutive: 'testData'
            },
            attachments: [
                {
                    filename: 'testData',
                    content: 'testData',
                }
             ]
        }

        mockedAxios.post.mockResolvedValue({
            data: {
                data: true,
                status: 200
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {},
        });

        let documentGenerator: ItransversalService = new TransversalService();
        let dataResponse = await documentGenerator.sendEmail(emailSendData);

        expect(dataResponse).toBe(true)
    })
})