import express, { Application } from 'express';
import 'express-async-errors';
import bodyParser from 'body-parser';
import environment from 'dotenv-flow';
import helmet from "helmet";
import cors from 'cors';
import permission from 'permissions-policy'
import compression from 'compression';

const app: Application = express();


environment.config({
  silent: true,
});

import morgan from 'morgan';
const { PREFIX, URL_ALB }: any = process.env;

app.enable('trust proxy');
app.use(cors());
app.use(helmet.frameguard({ action: 'sameorigin' }));
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
app.use(helmet());
app.use(compression());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        URL_ALB
      ],
      upgradeInsecureRequests: null
    },
  })
);
app.use(permission(
  {
    features: {
      fullscreen: ["self"],
      vibrate: ["none"],
      payment: ["self", '"example.com"'],
      syncXhr: [],
    },
  }
));

const PREFIX_API = PREFIX+'/api';

//************ routes ***********************//
import { HealthCheck } from 'vanti-utils/lib';
import { OrdersRouter } from '../modules/order/router';
import { SettlementRouter } from '../modules/settlement/router';
import {CatalogsRouter} from "../modules/catalogs/router";
import { ValidateRouter } from '../modules/validate/router';
import { EmailRouter } from '../modules/email/router';
import { AdjustmentRouter } from '../modules/adjustmentNote/router';


app.use(morgan('dev', {
  skip: function (req, res) { return res.statusCode < 400 }
}))
// body-parser
app.use(bodyParser.json({ limit: '5mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

app.use('/healthcheck', HealthCheck);
app.use(PREFIX+'/api/vantilisto', OrdersRouter);
app.use(PREFIX+'/api/vantilisto', SettlementRouter);
app.use(PREFIX_API+'/catalogs', CatalogsRouter);
app.use(PREFIX+'/api/validate', ValidateRouter);
app.use(PREFIX+'/api/email', EmailRouter);
app.use(PREFIX+'/api/adjustment-note', AdjustmentRouter);


export default app;