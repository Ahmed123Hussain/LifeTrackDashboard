#!/bin/bash
# Setup Verification Script for Productivity Dashboard

echo "=================================================="
echo "🔍 PRODUCTIVITY DASHBOARD - SETUP VERIFICATION"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    exit 1
fi

# Check npm
echo ""
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Check backend
echo ""
echo "🔧 Checking Backend..."
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${RED}✗${NC} Backend dependencies not found"
fi

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env configured"
else
    echo -e "${YELLOW}⚠${NC} Backend .env not found (create from .env.example)"
fi

if [ -f "backend/src/server.ts" ]; then
    echo -e "${GREEN}✓${NC} Backend server.ts found"
else
    echo -e "${RED}✗${NC} Backend server.ts not found"
fi

# Check frontend
echo ""
echo "🎨 Checking Frontend..."
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${RED}✗${NC} Frontend dependencies not found"
fi

if [ -f "frontend/.env.local" ]; then
    echo -e "${GREEN}✓${NC} Frontend .env.local configured"
else
    echo -e "${YELLOW}⚠${NC} Frontend .env.local not found (create from .env.example)"
fi

if [ -f "frontend/app/page.tsx" ]; then
    echo -e "${GREEN}✓${NC} Frontend app/page.tsx found"
else
    echo -e "${RED}✗${NC} Frontend app/page.tsx not found"
fi

echo ""
echo "=================================================="
echo "📋 SETUP CHECKLIST"
echo "=================================================="
echo ""

echo "✅ Install Dependencies"
echo "   Run: npm install (in backend and frontend)"
echo ""

echo "✅ Configure Environment"
echo "   Backend: Create backend/.env with MongoDB URI"
echo "   Frontend: Create frontend/.env.local"
echo ""

echo "✅ Start Development Servers"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo ""

echo "✅ Access Application"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""

echo "✅ Create Test Account"
echo "   1. Click 'Sign up' on login page"
echo "   2. Fill in name, email, password"
echo "   3. Create account"
echo ""

echo "=================================================="
echo "🚀 READY TO START!"
echo "=================================================="
echo ""
echo "Backend:  npm install && npm run dev"
echo "Frontend: npm install && npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
