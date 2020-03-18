/* eslint-disable no-console */
import * as Koa from 'koa';
// import * as Router from 'koa-router';
import { apiRouter } from './src/router';
import * as cors from 'koa-cors';

const app = new Koa();

app.use(cors({ credentials: true }));

// const router = new Router();

// router.get('/*', async ctx => {
//   ctx.body = 'Hello World!';
// });

app.use(apiRouter.routes());

const PORT = process.env.PORT || '3001';

app.listen(PORT);

console.log(`\n\n\n🚀  Node Server running at http://localhost:${PORT}.\n\n\n`);
