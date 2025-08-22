#!/usr/bin/env python3
"""
Simple HTTP server to serve the Database Connection String Builder
"""
import http.server
import socketserver
import os
import sys
import webbrowser
from pathlib import Path

PORT = 8888
HOST = 'localhost'

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Serve the working connection builder for root path
        if self.path == '/' or self.path == '/connection-builder':
            self.path = '/working-connection-builder.html'
        return super().do_GET()

def main():
    # Change to the directory containing the HTML file
    os.chdir('/Users/kandakumarv/boot/mssc-brewery')
    
    try:
        with socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler) as httpd:
            print(f"🚀 Database Connection String Builder Server")
            print(f"📡 Server running at: http://{HOST}:{PORT}")
            print(f"🔗 Direct link: http://{HOST}:{PORT}/connection-builder")
            print(f"📁 Serving from: {os.getcwd()}")
            print(f"⚡ Press Ctrl+C to stop the server")
            print(f"")
            print(f"✅ The Database Connection String Builder is now LIVE!")
            
            # Try to open browser automatically
            try:
                webbrowser.open(f'http://{HOST}:{PORT}/connection-builder')
                print(f"🌐 Opening browser automatically...")
            except:
                pass
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        print(f"💡 You can still open the HTML file directly:")
        print(f"   file:///Users/kandakumarv/boot/mssc-brewery/working-connection-builder.html")
        sys.exit(1)

if __name__ == "__main__":
    main()