import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('--- env check script ---');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('script __filename:', __filename);
console.log('script __dirname:', __dirname);
console.log('process.cwd():', process.cwd());

console.log('\nprocess.env.MONGODB_URI (before):', process.env.MONGODB_URI ? '[REDACTED]' : process.env.MONGODB_URI);

const explicitDotenvPath = path.join(__dirname, '..', '.env');
console.log('explicitDotenvPath:', explicitDotenvPath);
console.log('exists explicit .env?:', fs.existsSync(explicitDotenvPath));
console.log('exists backend/.env?:', fs.existsSync(path.join(process.cwd(), 'backend', '.env')));

// Try loading dotenv both from CWD and explicit path
try {
  // import dynamically to avoid top-level require issues
  const dotenv = await import('dotenv');
  console.log('\nLoading dotenv without path (default)');
  const r1 = dotenv.config();
  console.log('dotenv.config() returned:', !!r1.parsed, r1.error ? r1.error.message : '');
  console.log('dotenv.config() parsed keys (sample):', r1.parsed ? Object.keys(r1.parsed) : null);
  console.log('process.env.MONGODB_URI (after default load):', process.env.MONGODB_URI ? '[REDACTED]' : process.env.MONGODB_URI);

  console.log('\nRaw .env file contents:\n');
  try {
    const raw = fs.readFileSync(explicitDotenvPath, { encoding: 'utf8' });
    console.log(raw);
    const stat = fs.statSync(explicitDotenvPath);
    console.log('file size (bytes):', stat.size);
    const buf = fs.readFileSync(explicitDotenvPath);
    console.log('buffer length:', buf.length);
    console.log('first 200 bytes (hex):', buf.slice(0, 200).toString('hex'));
  } catch (e:any) {
    console.log('Unable to read .env file:', e?.message || e);
  }

  console.log('\nLoading dotenv with explicit path to backend/.env');
  const r2 = dotenv.config({ path: explicitDotenvPath });
  console.log('dotenv.config({path}) returned:', !!r2.parsed, r2.error ? r2.error.message : '');
  console.log('dotenv.config({path}) parsed keys:', r2.parsed ? Object.keys(r2.parsed) : null);
  const uri = process.env.MONGODB_URI;
  console.log('process.env.MONGODB_URI (after explicit load):', uri ? (uri.length > 20 ? uri.slice(0,12) + '...' + uri.slice(-8) : uri) : uri);
} catch (err:any) {
  console.error('Error loading dotenv:', err?.message || err);
}

console.log('\nList of env keys (sample):');
console.log(Object.keys(process.env).slice(0,50));

console.log('--- end env check ---');
