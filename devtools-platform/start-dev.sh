#!/bin/bash

# DevTools Platform - Development Server Startup Script
# This script ensures reliable startup of the Next.js development server

echo "🚀 Starting DevTools Platform Development Server..."

# Kill any existing Next.js processes
echo "📦 Cleaning up existing processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 2

# Check if port 3000 is free
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is in use, attempting to free it..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start the development server
echo "🔧 Starting Next.js development server on http://localhost:3000..."

# Start in background with logging
npx next dev --hostname localhost --port 3000 > next.log 2>&1 &

# Get the process ID
NEXT_PID=$!
echo "📡 Server started with PID: $NEXT_PID"

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
for i in {1..30}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo "✅ Server is ready!"
        echo "🌐 Application URL: http://localhost:3000"
        echo "🔧 Visual SQL Query Builder: http://localhost:3000/tools/visual-query-builder"
        echo "📋 To view logs: tail -f next.log"
        echo "🛑 To stop server: kill $NEXT_PID"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Server failed to start after 30 seconds"
        echo "📋 Check logs with: cat next.log"
        exit 1
    fi
    echo "   Attempt $i/30..."
    sleep 1
done

echo ""
echo "🎉 DevTools Platform is running successfully!"
echo "   Dashboard: http://localhost:3000"
echo "   Visual SQL Query Builder: http://localhost:3000/tools/visual-query-builder"
echo ""