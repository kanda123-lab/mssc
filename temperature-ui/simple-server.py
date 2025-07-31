#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 3000
Handler = http.server.SimpleHTTPRequestHandler

# Change to the directory containing the HTML files
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("=" * 60)
print("🌡️  TEMPERATURE CHECKER UI SERVER")
print("=" * 60)
print(f"🚀 Starting server on http://localhost:{PORT}")
print(f"📂 Serving files from: {os.getcwd()}")
print("=" * 60)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"✅ Server started successfully!")
    print(f"🌐 Open your browser to: http://localhost:{PORT}/temperature-checker.html")
    print("🔧 Backend API should be running on: http://localhost:8080")
    print("=" * 60)
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        # Try to open browser automatically
        webbrowser.open(f'http://localhost:{PORT}/temperature-checker.html')
    except:
        pass
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)