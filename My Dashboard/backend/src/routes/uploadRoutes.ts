import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Use memory storage so we can upload to S3 if configured
const storage = multer.memoryStorage();

const upload = multer({
  fileFilter: (req, file, cb) => {
    // Allow PDFs and images
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  },
});

// POST /api/uploads/cv
router.post('/cv', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;

    // If S3 is configured, upload to S3 for persistent storage
    const bucket = process.env.S3_BUCKET_NAME;
    const region = process.env.S3_REGION;

    if (bucket && region && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      const s3 = new S3Client({ region });
      const key = `uploads/${Date.now()}-${originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;

      const put = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: req.file.buffer,
        ContentType: mimeType,
        ACL: 'public-read',
      });

      await s3.send(put);

      // Construct public URL (works for standard AWS S3 buckets)
      const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`;

      return res.status(201).json({ success: true, data: { fileUrl, fileName: originalName, fileType: mimeType } });
    }

    // If S3 not configured, and mongoose is connected, use GridFS to persist file in MongoDB
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const bucketName = 'uploads';
        const gridBucket = new (mongoose.mongo as any).GridFSBucket(mongoose.connection.db, { bucketName });

        const filenameSafe = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;

        const uploadResult: any = await new Promise((resolve, reject) => {
          const uploadStream = gridBucket.openUploadStream(filenameSafe, {
            contentType: mimeType,
          });
          uploadStream.end(req.file.buffer);
          uploadStream.on('finish', resolve);
          uploadStream.on('error', reject);
        });

        const fileId = uploadResult._id.toString();
        const fileUrl = `/api/uploads/grid/${fileId}`;
        return res.status(201).json({ success: true, data: { fileUrl, fileName: originalName, fileType: mimeType } });
      } catch (err: any) {
        console.error('GridFS upload failed', err);
        // continue to disk fallback
      }
    }

    // Fallback to local disk storage for environments without S3 configured
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}${path.extname(originalName)}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);

    const fileUrl = `/uploads/${fileName}`;

    return res.status(201).json({ success: true, data: { fileUrl, fileName: originalName, fileType: mimeType } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

export default router;

// Serve GridFS files by id: GET /api/uploads/grid/:id
router.get('/grid/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).send('Missing id');

    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return res.status(500).send('MongoDB not connected');
    }

    const bucket = new (mongoose.mongo as any).GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });

    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch (e) {
      return res.status(400).send('Invalid id');
    }

    const downloadStream = bucket.openDownloadStream(objectId);
    downloadStream.on('error', (err: any) => {
      console.error('GridFS download error', err);
      res.status(404).send('Not found');
    });
    downloadStream.pipe(res);
  } catch (error: any) {
    res.status(500).send(error.message || 'Download failed');
  }
});
