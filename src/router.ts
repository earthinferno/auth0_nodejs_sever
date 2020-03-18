import * as router from 'koa-router';
import { GoogleOAuth, AzureOAuth } from './oauth';
import { v4 as uuidv4 } from 'node-uuid';

import * as jwt from 'jsonwebtoken';

const apiRouter = new router({
  prefix: '/api'
});

apiRouter.get('/', async ctx => {
  ctx.body = 'Hello World!';
});

apiRouter.get('/peace/:whom', async ctx => {
  console.log(ctx.params);
  switch (ctx.params.whom) {
    case 'bob': {
      ctx.body = `Peace ${ctx.params.whom}!`;
      return;
    }
  }
});

apiRouter.get('/auth-url/:provider', async ctx => {
  console.log(ctx.params);
  console.log('here auth-url');
  switch (ctx.params.provider) {
    case 'google': {
      const { login_hint, scope, redirect_uri, prompt, state } = ctx.query;
      const url = new GoogleOAuth({ redirect_uri, scope }).getAuthURL({
        login_hint,
        prompt,
        state
      });
      ctx.response.status = 200;
      ctx.response.body = url;
      return;
    }
    case 'azure': {
      const { login_hint, scope, redirect_uri, prompt, state } = ctx.query;
      const url = new AzureOAuth({ redirect_uri, scope }).getAuthURL({
        login_hint,
        prompt,
        state
      });
      ctx.response.status = 200;
      ctx.response.body = url;
      return;
    }
  }
  ctx.response.status = 400;
});

// // user-claims
// apiRouter.get('/user-claims/:provider', async ctx => {
//   console.log(ctx.params);
//   switch (ctx.params.provider) {
//     case 'google': {
//       try {
//         const { token } = ctx.query;
//         const decodedResponse: any = jwt.decode(token);
//         console.log(decodedResponse);

//         const session = uuidv4();
//         ctx.cookies.set('session', session);
//         ctx.cookies.set('token', token);
//         ctx.response.body = {
//           session: session,
//           token: token
//         };
//       } catch (e) {
//         ctx.status = e.statusCode || 500;
//         ctx.response.body = `error ${e.error}`;
//       }
//       return;
//     }
//   }
// });

apiRouter.get('/auth-from-code/:provider', async ctx => {
  console.log(`here auth-from-code. ${ctx.params.provider}`);
  if (ctx.params.provider === 'google') {
    const { code, redirect_uri, scope } = ctx.query;
    const GoogleOAuthInstance = new GoogleOAuth({ redirect_uri, scope });
    const { response, error } = await GoogleOAuthInstance.getTokenFromCode(
      code
    );
    if (response) {
      ctx.response.status = 200;
      console.log(response);
      const decodedResponse: any = GoogleOAuthInstance.parseJWTToken(
        response && response.id_token
      );
      if (decodedResponse) {
        const session = uuidv4();
        // addOrUpdateUser({
        //   emailId: decodedResponse.email,
        //   tokenInfo: parsedResponse,
        //   session
        // });
        ctx.cookies.set('session', session);
        ctx.response.body = {
          session: session,
          token: response.access_token,
          email: decodedResponse.email
        };
      }
    }
    if (error) {
      console.log(error);
      ctx.response.status = error.statusCode || 500;
      ctx.response.body = error.error;
    }
  }
});

export { apiRouter };
