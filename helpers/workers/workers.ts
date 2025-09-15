import { AmqplibService } from "@grupovanti/vanti-mq";
import { ISendEmailByCollaboratorDomain } from "../../modules/worker/sendEmailByCollaborator/domain/sendEmailBycollaborator.interface";
import { SendEmailByCollaboratorDomain } from "../../modules/worker/sendEmailByCollaborator/domain/sendEmailBycollaborator.domain";

const { SEND_EMAIL_BY_COLLABORATOR_QUEUE_NAME, RABBITMQ_USERNAME, RABBITMQ_PWD, RABBITMQ_PORT, RABBITMQ_HOST, CONFIG_ENV }: any = process.env;

const rabbitConfig = {
  host: RABBITMQ_HOST,
  port: RABBITMQ_PORT,
  username: RABBITMQ_USERNAME,
  password: RABBITMQ_PWD
};

export const AmqpService = new AmqplibService(rabbitConfig)

export const initWorkers = async () => {
  try {
    const sendEmailByCollaboratorDomain: ISendEmailByCollaboratorDomain = new SendEmailByCollaboratorDomain();
    await AmqpService.workerRegister(SEND_EMAIL_BY_COLLABORATOR_QUEUE_NAME, sendEmailByCollaboratorDomain.processEmailToSend, null, 1000);
    log.info('[initWorkers] Se registraron correctamente los workers');
  } catch (error) {
    log.error('[initWorkers] Error al registrar worker', error);
  }
};