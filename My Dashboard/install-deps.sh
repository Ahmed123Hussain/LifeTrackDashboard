#!/bin/bash
# Install dependencies for both frontend and backend

echo "Installing dependencies..."
echo ""

echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

cd ..
echo ""

echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..
echo ""
echo "✅ All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure .env files in both backend and frontend directories"
echo "2. Run: npm run dev (in backend) and npm run dev (in frontend)"
echo "3. Open http://localhost:3000 in your browser"
