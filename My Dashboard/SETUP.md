# Setup & Deployment Guide

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update .env with your MongoDB URI and JWT secret
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/productivity-dashboard
# JWT_SECRET=your_jwt_secret_key_here

# Run in development
npm run dev

# Or build and run in production
npm run build
npm start
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Run in development
npm run dev

# Or build and run in production
npm run build
npm start
```

Frontend will run on `http://localhost:3000`

## Database Setup (MongoDB Atlas)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new project
4. Create a free cluster (M0)
5. Create a database user with strong password
6. Whitelist your IP address
7. Get connection string (URI)
8. Replace `<password>` and `<dbname>` in connection string
9. Use this as `MONGODB_URI` in backend `.env`

## Environment Variables

### Backend (.env)

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/productivity-dashboard
JWT_SECRET=your_very_secure_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Test the Application

1. Open http://localhost:3000 in your browser
2. Click "Sign up" to create a new account
3. Fill in name, email, and password
4. You'll be redirected to dashboard
5. Start adding certifications, degrees, todos, and goals!

## Deployment

### Deploy Backend to Render

1. Push code to GitHub
2. Go to https://render.com and sign up
3. Connect your GitHub account
4. Create new "Web Service"
5. Select your repository
6. Configure:
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Root Directory: `backend`
7. Add environment variables from `.env`
8. Click Deploy

### Deploy Frontend to Vercel

1. Push code to GitHub
2. Go to https://vercel.com and sign up
3. Import your GitHub repository
4. Select `frontend` as root directory
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL=` (your Render backend URL)/api
6. Click Deploy

### Verify Deployment

- Visit your Vercel URL
- Test login with a test account
- Try creating certifications, degrees, todos, and goals
- Check that dark/light theme works
- Verify profile updates work

## Troubleshooting

### Backend won't connect to MongoDB
- Check MONGODB_URI is correct
- Verify IP whitelist includes your machine
- Ensure database user has correct permissions

### Frontend can't reach backend
- Check NEXT_PUBLIC_API_URL is correct
- Verify backend CORS_ORIGIN matches frontend URL
- Check backend is running on correct port

### File uploads not working
- Ensure `/backend/uploads` directory exists
- Check file size limits in multer
- Verify CORS allows file uploads

### Dark mode not working
- Clear browser localStorage
- Check localStorage permissions
- Verify CSS dark mode class applied

## Performance Tips

- Use MongoDB indexes for frequently queried fields
- Enable compression on backend (add gzip middleware)
- Optimize frontend bundle size
- Use CDN for static assets
- Enable caching headers

## Security Checklist

- [ ] Update JWT_SECRET to random 32+ char string
- [ ] Enable HTTPS for all URLs
- [ ] Set secure CORS origin in production
- [ ] Use strong MongoDB passwords
- [ ] Enable MongoDB IP whitelist
- [ ] Add rate limiting to auth endpoints
- [ ] Validate file upload types and sizes
- [ ] Use environment variables for all secrets

## Additional Features to Add

- Email verification on registration
- Password reset functionality
- Export data as CSV
- Recurring todos
- Goal sharing and collaboration
- Push notifications
- Social authentication (Google, GitHub)
- API documentation with Swagger

## Support

For issues or questions, check:
- Backend README: `/backend/README.md`
- Frontend README: `/frontend/README.md`
- Main README: `/README.md`
