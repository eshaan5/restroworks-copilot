import { Router } from 'express';
import { uploadDocument } from './uploadDocs.controller.js';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });
router.post('/uploadDoc', upload.single('file'), uploadDocument);

export default router;