# Backend - Productivity Dashboard API

Express.js backend API with JWT authentication and MongoDB

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/productivity-dashboard
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

3. Development:
```bash
npm run dev
```

4. Build:
```bash
npm run build
```

5. Production:
```bash
npm start
```

## API Endpoints

- **Auth**: POST /api/auth/register, /api/auth/login, GET /api/auth/me
- **Certifications**: GET, POST, PUT, DELETE /api/certs
- **Degrees**: GET, POST, PUT, DELETE /api/degrees
- **Todos**: GET, POST, PUT, DELETE /api/todos
- **Goals**: GET, POST, PUT, DELETE /api/goals
