# Quick Reference Guide

## File Locations & What to Update

### 1. Backend Configuration

**File:** `backend/.env`

Create this file by copying `.env.example` and update:
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/productivity-dashboard
JWT_SECRET=generate_a_random_string_here_min_32_chars
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 2. Frontend Configuration

**File:** `frontend/.env.local`

Create this file and update:
```env
NEXT_PUBLIC_API_URL=http://https://lifetrackdashboard.onrender.com/api
```

## Database Setup (MongoDB Atlas)

1. Visit: https://www.mongodb.com/cloud/atlas
2. Sign up with Google or email
3. Create new project
4. Create free M0 cluster
5. Create database user with password
6. Add your IP to whitelist (or 0.0.0.0/0 for development)
7. Click "Connect" → "Connect your application"
8. Copy connection string
9. Replace `<password>` with your password
10. Add to `backend/.env` as `MONGODB_URI`

## Installation Steps

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install

# 3. Go back to root
cd ..
```

## Running Development Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Runs on http://https://lifetrackdashboard.onrender.com
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

## First Time Usage

1. Open http://localhost:3000 in browser
2. Click "Sign up"
3. Fill in: Name, Email, Password
4. Click "Create Account"
5. You'll be redirected to dashboard
6. Start adding your data!

## Common Commands

### Backend
```bash
npm run dev         # Development with auto-reload
npm run build       # Build for production
npm start          # Run production build
npm run lint       # Check code quality
```

### Frontend
```bash
npm run dev        # Development with hot reload
npm run build      # Build for production
npm start         # Run production build
npm run lint      # Check code quality
```

## Troubleshooting

### "Cannot connect to MongoDB"
- Check MongoDB URI is correct
- Verify whitelist includes your IP
- Ensure database user credentials are correct
- Check internet connection

### "Port 5000 already in use"
```bash
# Find process using port
lsof -i :5000  # Mac/Linux
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess  # Windows

# Kill process or use different PORT in .env
```

### "Port 3000 already in use"
```bash
# Find process using port
lsof -i :3000  # Mac/Linux

# Or use different port
npm run dev -- -p 3001
```

### Frontend can't reach backend
- Verify backend is running on 5000
- Check NEXT_PUBLIC_API_URL in .env.local
- Check CORS_ORIGIN in backend .env matches frontend URL
- Clear browser cache/localStorage

### Styles not loading
- Check tailwindcss is installed: `npm list tailwindcss`
- Check tailwind.config.ts has correct paths
- Restart dev server

## File Structure Overview

```
backend/
  ├── src/
  │   ├── models/       # Database schemas
  │   ├── controllers/  # Business logic
  │   ├── routes/       # API endpoints
  │   ├── middleware/   # Auth checks
  │   ├── utils/        # Helper functions
  │   └── server.ts     # Main app file
  ├── uploads/          # Uploaded files
  └── package.json

frontend/
  ├── app/              # Pages (App Router)
  │   ├── auth/         # Login/Register
  │   └── dashboard/    # Protected pages
  ├── components/       # Reusable UI
  ├── lib/              # API, state, theme
  ├── hooks/            # Custom hooks
  └── package.json
```

## API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* actual data */ }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details"
}
```

## Authentication Flow

1. User registers → Password hashed with bcrypt
2. User logs in → Receives JWT token
3. Token stored in localStorage
4. Token added to all API requests via Axios interceptor
5. Backend validates token with auth middleware
6. Logout clears token and redirects to login

## Important Notes

- ⚠️ Never commit `.env` files to git
- ⚠️ Use strong JWT_SECRET in production
- ⚠️ Change CORS_ORIGIN to your domain in production
- ⚠️ Use environment variables for all secrets
- ✅ All user data is private and scoped by userId
- ✅ Passwords are hashed before storage
- ✅ JWT expires after 7 days (configurable)

## Next Steps After Setup

1. ✅ Verify both servers running
2. ✅ Create test account
3. ✅ Test all CRUD operations
4. ✅ Test dark/light theme
5. ✅ Test file uploads (certificates)
6. ✅ Check responsive design on mobile
7. ✅ Then deploy to production!

## Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Backend environment variables set
- [ ] Frontend environment variables set
- [ ] Both apps tested locally
- [ ] Repository pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] API URL updated in frontend env
- [ ] CORS_ORIGIN updated in backend
- [ ] Database backups configured
- [ ] HTTPS enabled on all URLs

## Support Resources

- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`
- Setup Guide: `SETUP.md`
- Main README: `README.md`
- Project Summary: `COMPLETION_SUMMARY.md`

---

**Created:** December 2025
**Stack:** Node.js + Express + MongoDB + Next.js + React + TypeScript
**Status:** Production Ready ✅
