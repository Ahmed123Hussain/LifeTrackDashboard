#!/bin/bash
# Quick development startup script for Windows (PowerShell)

echo "Starting Productivity Dashboard..."
echo ""

# Start backend in background
Write-Host "Starting Backend..." -ForegroundColor Blue
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "./backend"

Start-Sleep -Seconds 2

# Start frontend in background
Write-Host "Starting Frontend..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "./frontend"

Write-Host ""
Write-Host "✅ Both services starting..." -ForegroundColor Yellow
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop services" -ForegroundColor Gray
