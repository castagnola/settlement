import { Request, Response, Router } from "express";
import { upload } from "../../../middleware/uploads/multer-upload.middlewares";
import { EmailDomain, IEmailDomain } from "../domain";
import { handleResponse, HttpCode } from "vanti-utils/lib";
import { verifytoken } from "../../../middleware/verifyToken/verifyToken.middleware";

export const EmailController = Router();

EmailController.post('/upload', verifytoken, upload.single('emails') ,async (req: Request, res: Response) => {
    const emailDomain: IEmailDomain = new EmailDomain();
    const data = await emailDomain.UploadEmails(req.file.buffer);

    handleResponse(res, HttpCode.OK, data);
})

EmailController.get('/upload/file', verifytoken ,async (req: Request, res: Response) => {
    const emailDomain: IEmailDomain = new EmailDomain();
    const file = await emailDomain.GetUploadFile();

    handleResponse(res, HttpCode.OK, file);
})
    

EmailController.get('/list',
    verifytoken,
    async (req: Request, res: Response) => {
        let options: any = req.query;
        let emailDomain: IEmailDomain = new EmailDomain();
        let response = await emailDomain.getEmails(options);
        handleResponse(res, 200, response);
    })
