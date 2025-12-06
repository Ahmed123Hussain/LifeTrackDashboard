import { Router } from 'express';
import * as certController from '../controllers/certificationController.js';
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
router.get('/', certController.getCertifications);
router.get('/:id', certController.getCertification);
router.post('/', upload.single('file'), certController.createCertification);
router.put('/:id', certController.updateCertification);
router.delete('/:id', certController.deleteCertification);

export default router;
