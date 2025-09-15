export type EmailData = {
    email: string,
    name: string,
    subject: string,
    message?: string,
    template: string,
    parameters?: any,
    copiesEmailList?: string[],
    copiesBlindEmailList?: string[],
    attachments?: attachment[],
}

export  type attachment = {
    filename: string,
    content: string,
    contentType?: string,
}

export type MultiSendEmailData = {
    to: {
        email: string,
        name: string
    }[],
    subject: string,
    message?: string,
    template: string,
    parameters?: any,
    copiesEmailList?: string[],
    copiesBlindEmailList?: string[],
    attachments: attachment[],
}