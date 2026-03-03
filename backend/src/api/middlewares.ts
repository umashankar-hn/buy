import { defineMiddlewares } from '@medusajs/framework/http';
import { cognitoAuthMiddleware } from './middlewares/cognito-auth';
import cors from 'cors';
import { parseCorsOrigins } from '@medusajs/framework/utils';


export default defineMiddlewares({
  routes: [
    {
      matcher: '/subscriptions*',
      middlewares: [
        cors({
          origin: parseCorsOrigins(process.env.AUTH_CORS || ''),
          credentials: true,
        }),
        cognitoAuthMiddleware,
      ],
    },
    {
      matcher: '/me',
      middlewares: [
        cors({
          origin: parseCorsOrigins(process.env.AUTH_CORS || ''),
          credentials: true,
        }),
        cognitoAuthMiddleware,
      ],
    },
  ],
});
