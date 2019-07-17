import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';
import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';

const routes = Router();
const uploads = multer(multerConfig);

routes.post('/users', UserController.store);
routes.get('/users', UserController.index);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/files', uploads.single('file'), FileController.store);

routes.post('/meetups', MeetupController.store);
routes.get('/meetups', MeetupController.index);

export default routes;
