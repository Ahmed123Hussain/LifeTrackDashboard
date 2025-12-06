# Productivity Dashboard - Full Stack Application

A modern, production-ready web application for managing personal productivity with support for certifications, degrees, todos, and goals.

## Project Structure

```
├── backend/                 # Express.js REST API
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth & custom middleware
│   │   ├── utils/          # Helper utilities
│   │   └── server.ts       # Main entry point
│   └── uploads/            # File storage directory
│
└── frontend/               # Next.js 15 Web App
    ├── app/
    │   ├── auth/          # Login/Register pages
    │   ├── dashboard/     # Protected dashboard pages
    │   └── layout.tsx     # Root layout
    ├── components/        # Reusable UI components
    ├── lib/              # Utilities, API, state management
    └── public/           # Static assets
```

## Tech Stack

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt password hashing
- Multer file uploads

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- TailwindCSS
- ShadCN UI Components
- Zustand state management
- Recharts for visualizations
- Axios for API calls

## Features

✅ **User Authentication**
- Register & Login with JWT
- Password hashing with bcrypt
- Protected routes
- Profile management

✅ **Dashboard**
- Overview cards with statistics
- Charts (pie & bar) using recharts
- Today's tasks view
- Responsive design

✅ **Certifications Module**
- Full CRUD operations
- File upload support (PDF/Images)
- Issue & expiry date tracking

✅ **Degrees Module**
- Full CRUD operations
- GPA tracking
- Date range management
- Notes field

✅ **Todos Module**
- Full CRUD operations
- Priority levels (Low, Medium, High)
- Status tracking (Pending, In Progress, Done)
- Deadline management
- Filtering by status & priority

✅ **Goals Module**
- Full CRUD operations
- Milestone tracking
- Automatic progress calculation
- Target date management
- Description field

✅ **User Profile**
- Edit name and email
- Theme preference (Light/Dark)
- Avatar management

## Getting Started

### Prerequisites
- Node.js v16+ 
- MongoDB Atlas account
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create .env file
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/productivity-dashboard
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Development
npm run dev

# Production build
npm run build
npm start
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env.local file
NEXT_PUBLIC_API_URL=http://https://lifetrackdashboard.onrender.com/api

# Development
npm run dev

# Production build
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Certifications
- `GET /api/certs` - Get all certifications (protected)
- `POST /api/certs` - Create certification (protected)
- `GET /api/certs/:id` - Get certification (protected)
- `PUT /api/certs/:id` - Update certification (protected)
- `DELETE /api/certs/:id` - Delete certification (protected)

### Degrees
- `GET /api/degrees` - Get all degrees (protected)
- `POST /api/degrees` - Create degree (protected)
- `GET /api/degrees/:id` - Get degree (protected)
- `PUT /api/degrees/:id` - Update degree (protected)
- `DELETE /api/degrees/:id` - Delete degree (protected)

### Todos
- `GET /api/todos` - Get all todos (protected)
- `POST /api/todos` - Create todo (protected)
- `GET /api/todos/:id` - Get todo (protected)
- `PUT /api/todos/:id` - Update todo (protected)
- `DELETE /api/todos/:id` - Delete todo (protected)

### Goals
- `GET /api/goals` - Get all goals (protected)
- `POST /api/goals` - Create goal (protected)
- `GET /api/goals/:id` - Get goal (protected)
- `PUT /api/goals/:id` - Update goal (protected)
- `DELETE /api/goals/:id` - Delete goal (protected)
- `GET /api/goals/dashboard/stats` - Get dashboard statistics (protected)

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set `NEXT_PUBLIC_API_URL` environment variable
4. Deploy automatically on push

### Backend (Render)
1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables
4. Deploy from `backend` directory

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Add IP whitelist
3. Get connection string
4. Use in `MONGODB_URI` environment variable

## Development Notes

- All endpoints return consistent JSON response format with `success`, `message`, and `data` fields
- All user data is scoped by `userId` for security
- File uploads stored in `/backend/uploads` directory
- Frontend uses client-side state management with Zustand
- Dark/light theme persisted in localStorage
- Authentication tokens stored in localStorage and added to API requests

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt (10 rounds)
- CORS enabled with configurable origin
- Protected routes require valid JWT
- User data isolation by userId
- File upload validation (PDF & images only)

## License

MIT
