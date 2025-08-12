#!/bin/bash

# DevTools Platform - Stop Development Server Script

echo "🛑 Stopping DevTools Platform Development Server..."

# Kill Next.js processes
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

# Kill any processes using port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "📦 Killing processes on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

# Clean up log file
if [ -f "next.log" ]; then
    echo "🧹 Cleaning up log file..."
    rm -f next.log
fi

echo "✅ Development server stopped successfully!"