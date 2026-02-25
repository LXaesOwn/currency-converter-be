import { Router } from 'express';
import { userController } from './user.controller';

const router = Router();

router.get('/', userController.getUser.bind(userController));
router.post('/', userController.updateUser.bind(userController));

export default router;