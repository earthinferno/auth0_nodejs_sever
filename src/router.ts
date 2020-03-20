import * as router from 'koa-router';
import { GoogleOAuth, AzureOAuth } from './oauth';
import { v4 as uuidv4 } from 'node-uuid';

import * as jwt from 'jsonwebtoken';

const apiRouter = new router({
  prefix: '/api'
});

// Get a URL to connect to OpenId identity provider
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

// Send code to identity provider to get token_id and access_token
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
      console.log(`here ${response}`);
      const decodedResponse: any = GoogleOAuthInstance.parseJWTToken(
        response && response.id_token
      );
      if (decodedResponse) {
        const session = uuidv4();
        ctx.cookies.set('session', session);
        ctx.response.body = {
          session: session,
          token: jwt.decode(response.access_token),
          email: decodedResponse.email
        };
      }
      ctx.redirect(
        `http://localhost:8100/oath_callback?id_token=${response.id_token}&access_token=${response.access_token}`
      );
    }
    if (error) {
      console.log('error');
      console.log(error);
      ctx.response.status = error.statusCode || 500;
      ctx.response.body = error.error;
    }
  }
});

// A redirection to the identity provider step 1 - get code.
apiRouter.get('/oath_callback', async ctx => {
  console.log(`here auth-from-code2.`);
  try {
    console.log(ctx.query);
    const code = ctx.query.code;
    const state = ctx.query.state;
    const qParams = [
      `code=${code}`,
      `redirect_uri=http://localhost:3001/api/oath_callback`,
      `scope=openid profile email`
    ].join('&');
    ctx.redirect(`/api/auth-from-code/${state}?${qParams}`);
  } catch (error) {
    ctx.response.status = error.statusCode || 500;
    ctx.response.body = error.error;
    return ctx.response;
  }
});

apiRouter.get('/authorise/:provider', async ctx => {
  if (ctx.params.provider === 'google') {
    console.log(`here authorise. ${ctx.params.provider}`);
    ctx.response.body = {
      claims: ['claim-a', 'claim-b']
    };
  }
});

export { apiRouter };
