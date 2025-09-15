import {GetObjectCommandOutput, S3} from '@aws-sdk/client-s3';
import {Readable} from "stream";
import { AppError } from 'vanti-utils/lib';

const {
    BUCKET_NAME,
    BUCKET_ACCESS_KEY,
    BUCKET_SECRET_ACCESS_KEY,
    BUCKET_REGION,
}: any = process.env;

/**
 * @description Bucket Service
 * @class BucketService - Bucket Service
 * @implements {IBucketService} - Interface for Bucket Service
 * @param {S3} s3 - S3 client
 * @param {Promise<string>} uploadFile - Upload file to bucket
 * @param {Promise<GetObjectCommandOutput>} getFile - Get file from bucket
 *
 */
export class BucketService {
    private readonly s3: S3;
    constructor() {
        this.s3 = new S3({
            region: BUCKET_REGION,
        })
    }

    /**
     * @description Get file from bucket
     * @param file path of file
     * @returns {Promise<GetObjectCommandOutput>} file
     *
     */
    async getFile(file: string): Promise<Buffer> {
        try {
            const params = {
                Bucket: BUCKET_NAME,
                Key: `${file}`,
            };
            const result:GetObjectCommandOutput = await this.s3.getObject(params);
            return await this.asBuffer(result);
        } catch (error: any) {
            throw new AppError({ message: `[getFileS3] key ${file} no se encuentra en Bucket` });
        }
    }

    asStream (response: GetObjectCommandOutput) {
        return response.Body as Readable;
    };

    /**
     * @description Convierte un Objeto AWS en Buffer
     * @param response - Objeto retornado por AWS
     * @returns Promise<Buffer> - Promesa con el archivo convertido Buffer
     */
    async asBuffer (response: GetObjectCommandOutput)  {
        const stream = this.asStream(response);
        const chunks: Buffer[] = [];
        return new Promise<Buffer>((resolve, reject) => {
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', (err) => reject(err));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
        });
    };
}