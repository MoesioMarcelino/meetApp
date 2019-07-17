import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

const routes = Router();

routes.post('/users', UserController.store);
routes.get('/users', UserController.index);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

export default routes;
