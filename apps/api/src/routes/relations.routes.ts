import { Router } from 'express';
import {
    getRelationMasters,
    createRelationMaster,
    updateRelationMaster,
    deleteRelationMaster,
    getRelationships,
    createRelationship,
    deleteRelationship
} from '../controllers/relations.controller';

const router = Router();

// Masters
router.get('/masters', getRelationMasters);
router.post('/masters', createRelationMaster);
router.patch('/masters/:id', updateRelationMaster);
router.delete('/masters/:id', deleteRelationMaster);

// Edges
router.get('/', getRelationships); // ?memberId=...
router.post('/', createRelationship);
router.delete('/:id', deleteRelationship);

export default router;
