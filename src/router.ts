import * as router from 'koa-router';
import { GoogleOAuth, AzureOAuth } from './oauth';

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
  switch (ctx.params.provider) {
    case 'google': {
      const { login_hint, scope, redirect_uri, prompt, state } = ctx.query;
      const url = new GoogleOAuth({ redirect_uri, scope }).getAuthURLToken({
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

export { apiRouter };
