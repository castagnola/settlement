export interface ISendEmailByCollaboratorDomain {

    processEmailToSend(id: string):Promise<void>

}