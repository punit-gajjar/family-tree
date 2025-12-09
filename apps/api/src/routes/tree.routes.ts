import { Router } from 'express';
import { getTreeData } from '../controllers/tree.controller';

const router = Router();

router.get('/', getTreeData);

export default router;
