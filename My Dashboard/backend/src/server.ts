import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/authRoutes.js';
import certRoutes from './routes/certRoutes.js';
import degreeRoutes from './routes/degreeRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// NOTE: load dotenv after computing __dirname so we can explicitly point
// at the backend/.env file. This makes the backend resilient if started
// from a different working directory (e.g., from the repo root).
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env explicitly
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Ensure preflight requests are handled with the same CORS settings
app.options('*', cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
// Serve uploaded files from the uploads folder
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));
console.log('Serving uploads from:', uploadsPath);

// Database Connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri || typeof uri !== 'string') {
      console.error('Fatal: MONGODB_URI is not set. Please create backend/.env with MONGODB_URI.');
      console.error('Expected a MongoDB connection string, got:', uri);
      process.exit(1);
    }

    // Mask the uri for logging
    const masked = uri.length > 20 ? uri.slice(0, 12) + '...' + uri.slice(-8) : uri;
    console.log('Connecting to MongoDB using URI:', masked);

    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/certs', certRoutes);
app.use('/api/degrees', degreeRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
