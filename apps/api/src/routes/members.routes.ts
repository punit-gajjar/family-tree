import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { createMember, deleteMember, getMember, getMembers, updateMember } from '../controllers/members.controller';
import { exportMembers } from '../controllers/export.controller';
// import { authenticateToken } from '../middleware/auth.middleware'; // TODO: Implement middleware

const router = Router();

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/members/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// TODO: Add Auth Middleware
router.get('/export', exportMembers); // Place before /:id
router.get('/', getMembers);
router.get('/:id', getMember);
router.post('/', upload.single('image'), createMember);
router.patch('/:id', upload.single('image'), updateMember);
router.delete('/:id', deleteMember);

export default router;
