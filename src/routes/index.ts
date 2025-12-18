import { Hono } from 'hono';
import { authRouter } from '../modules/auth/routes.js';
import { authPublicRouter } from '../modules/auth/public-routes.js';
import { userRouter } from '../modules/users/routes.js';
import { catalogPublicRouter, catalogRouter } from '../modules/catalog/routes.js';
import { logsRouter } from '../modules/app-logs/routes.js';
import { mediaRouter } from '../modules/media/routes.js';
import { blogPostPublicRouter, blogPostRouter } from '../modules/blog/routes.js';
import { therapistsRouter } from '../modules/agenda/therapists/routes.js';
import { schedulesRouter } from '../modules/agenda/schedules/routes.js';
import { appointmentsRouter } from '../modules/agenda/appointments/routes.js';
import { patientRecordsRouter } from '../modules/agenda/patient-records/routes.js';
import { sessionNotesRouter } from '../modules/agenda/session-notes/routes.js';
import { customersRouter } from '../modules/clients/routes.js';

export const apiPrivateRouter = new Hono().basePath('/private');
apiPrivateRouter.get('/', (c) => {
  return c.json({
    name: 'Kumelen API',
    version: '0.1.0',
  });
});

apiPrivateRouter.route('/auth', authRouter);
apiPrivateRouter.route('/users', userRouter);
apiPrivateRouter.route('/customers', customersRouter);
apiPrivateRouter.route('/catalog', catalogRouter);
apiPrivateRouter.route('/logs', logsRouter);
apiPrivateRouter.route('/media', mediaRouter);
apiPrivateRouter.route('/blog', blogPostRouter);
apiPrivateRouter.route('/therapists', therapistsRouter);
apiPrivateRouter.route('/schedules', schedulesRouter);
apiPrivateRouter.route('/appointments', appointmentsRouter);
apiPrivateRouter.route('/patient-records', patientRecordsRouter);
apiPrivateRouter.route('/session-notes', sessionNotesRouter);

export const apiPublicRouter = new Hono().basePath('/public');

apiPublicRouter.route('/auth', authPublicRouter);
apiPublicRouter.route('/catalog', catalogPublicRouter);
apiPublicRouter.route('/blog', blogPostPublicRouter);
