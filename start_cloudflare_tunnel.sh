#!/bin/bash

# IBC-Versuchskläranlage Cloudflare Tunnel Startup Script
# Hochschule Koblenz

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  IBC-Versuchskläranlage - Cloudflare Tunnel Starter          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Stop any existing cloudflared processes
echo "🔄 Checking for existing cloudflared processes..."
if pgrep -f "cloudflared tunnel" > /dev/null; then
    echo "   Stopping existing cloudflared tunnel..."
    pkill -f "cloudflared tunnel"
    sleep 2
fi

# Make sure backend is running
echo "🔍 Checking backend status..."
if ! curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "⚠️  Backend is not running on port 5000!"
    echo "   Please start the backend first:"
    echo "   cd backend && sudo venv/bin/python app.py"
    exit 1
fi
echo "✅ Backend is running"

# Start cloudflared tunnel
echo ""
echo "🚀 Starting Cloudflare Tunnel..."
echo "   This will create a public URL for your application"
echo ""

# Start tunnel in background and capture output
cloudflared tunnel --url http://localhost:5000 > /tmp/cloudflared.log 2>&1 &
TUNNEL_PID=$!

# Wait for tunnel to establish
echo "⏳ Waiting for tunnel to establish..."
sleep 8

# Extract and display the public URL
PUBLIC_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflared.log | head -1)

if [ -n "$PUBLIC_URL" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ TUNNEL SUCCESSFULLY ESTABLISHED!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "   🌐 PUBLIC URL:"
    echo "   $PUBLIC_URL"
    echo ""
    echo "   📋 Access your application:"
    echo "      Dashboard:    $PUBLIC_URL"
    echo "      API Health:   $PUBLIC_URL/api/health"
    echo "      Expert Menu:  Available in the web interface"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "   Process ID: $TUNNEL_PID"
    echo "   Log File:   /tmp/cloudflared.log"
    echo ""
    echo "   To stop the tunnel:"
    echo "   pkill -f 'cloudflared tunnel'"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "❌ Failed to establish tunnel"
    echo "   Check /tmp/cloudflared.log for details"
    echo "   Last 10 lines of log:"
    tail -10 /tmp/cloudflared.log
    exit 1
fi
