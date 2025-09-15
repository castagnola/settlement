import { describe, it, jest, expect, beforeEach } from '@jest/globals';
import { GetObjectCommandOutput, S3, S3Client } from '@aws-sdk/client-s3';
import { BucketService } from './bucket.service';
import { AppError } from 'vanti-utils/lib';

describe('Validacion de conversion de objetos', ()=>{

    it('should validate asStream', ()=>{
        let imputData = {Body:{}} as GetObjectCommandOutput;

        let bucketService = new BucketService;
        const result = bucketService.asStream(imputData);
        expect(result).toBeDefined();
    })

    it("validate asBuffer function", async () => {
        let imputData = {Body:{}} as GetObjectCommandOutput;
        const stream = {
            on: (event: string, callback: any) => {
                if (event === "data") {
                    callback(Buffer.from("Hola mundo!"));
                } else if (event === "end") {
                    callback();
                }
            },
        };

        jest.spyOn(BucketService.prototype, 'asStream').mockReturnValue(stream as any)

        let bucketService = new BucketService;
        const result = await bucketService.asBuffer(imputData);

        expect(result).toBeDefined()
    });
})

describe('Validacion de conexion con AWS', ()=> {
    let bucketService: BucketService;
    let mockS3Client: S3Client;

    beforeEach(() => {
        mockS3Client = {} as S3Client;
        bucketService = new BucketService();
    });

    afterEach(() => {
        mockS3Client = {} as S3Client;
        bucketService = new BucketService();
    });

    it('should validate get file', async () => {
        const bucketService = new BucketService();
        let buffer = Buffer.from('testData')

        jest.spyOn(S3.prototype, 'getObject').mockReturnValue()
        jest.spyOn(BucketService.prototype, 'asBuffer').mockResolvedValue(buffer)

        const result = await bucketService.getFile('test');

        expect(Buffer.isBuffer(result)).toBe(true)
    });

    it('should validate get file error', async ()=>{
        const bucketService = new BucketService();

        jest.spyOn(S3.prototype, 'getObject').mockReturnValue()
        jest.spyOn(BucketService.prototype, 'asBuffer').mockImplementation(()=>{
            throw Error('Error en S3')
        })

        await expect(bucketService.getFile('test')).rejects.toThrow(
            new AppError({ message: '[getFileS3] key test no se encuentra en Bucket' })
        );
    })

})