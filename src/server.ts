import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { requestLogger } from './middleware/logger.js';
import { serve } from '@hono/node-server';

export const app = new Hono();

app.use('*', requestLogger);
app.use('*', cors());
app.use('*', secureHeaders());

app.get('/health', (c) => {
  return c.json({ status: 'ok', env: env.NODE_ENV });
});

app.route('/api', apiRouter);

serve(
  {
    fetch: app.fetch,
    port: parseInt(env.PORT),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
