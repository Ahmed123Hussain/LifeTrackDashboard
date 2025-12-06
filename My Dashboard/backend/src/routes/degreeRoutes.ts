import { Router } from 'express';
import * as degreeController from '../controllers/degreeController.js';
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
	destination: uploadsDir,
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('Only PDF and image files are allowed'));
		}
	},
});

const router = Router();

router.use(authMiddleware);
router.get('/', degreeController.getDegrees);
router.get('/:id', degreeController.getDegree);
router.post('/', upload.single('file'), degreeController.createDegree);
router.put('/:id', upload.single('file'), degreeController.updateDegree);
router.delete('/:id', degreeController.deleteDegree);

export default router;
