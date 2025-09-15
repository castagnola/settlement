
//************ configurations *******************//
import app from "./src/config/app";
import { loadLogger, SwaggerSpec, DBMongo, HandlerException } from "vanti-utils/lib";
import cors from "cors";
import { OptionSwagger } from "vanti-utils/lib/src/utils/swagger/swagger.type";
import { URI_SETTLEMENT_CORE } from "src/helpers/constans.type";
import { initWorkers } from "./src/helpers/workers/workers";
// import { runCrons } from "./src/config/cron/cron";

const port = process.env.PORT;
const { DIRECT_CONNECTION_MONGO, ALLOW_INVALID_HOSTNAME_MONGO, URL_ALB, PREFIX }: any = process.env;
//declare global logs use
loadLogger();

//Cors configuration
app.use(cors());

//rabbit MQ
initWorkers()

//handlerException
app.use(HandlerException);

const swaggerOptions: OptionSwagger = {
  title: "liquidaciones",
  description: "API de liquidaciones",
  security: {
    BearerAuth: {
      type: "http",
      scheme: "bearer",
    }
  },
  servers: [
    {
      url: `${URL_ALB}${PREFIX}/api`,
      description: "Servidor",
    }
  ],
};

//Swagger
SwaggerSpec(app, __dirname, swaggerOptions);

//DB connection
DBMongo(DIRECT_CONNECTION_MONGO ? DIRECT_CONNECTION_MONGO : false, ALLOW_INVALID_HOSTNAME_MONGO ? ALLOW_INVALID_HOSTNAME_MONGO : false);

//CRON
// runCrons()
app.listen(port, () => {
  log.info(`[server]: Server is running at http://localhost:${port}`);
});

