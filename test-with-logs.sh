#!/bin/bash

# Kill any existing processes
pkill -f "remotion studio"
pkill -f "vite"
pkill -f "node src/server.js"

# Start servers in background
./start-with-logs.sh

# Wait for servers to start
echo "Waiting for servers to start..."
sleep 10

# Show logs in background
tail -f logs/server.log &
TAIL_PID=$!

# Function to check if a server is ready
check_server() {
    curl -s "http://localhost:$1/health" > /dev/null 2>&1
    return $?
}

# Wait until servers are ready
echo "Checking if servers are ready..."
RETRIES=0
MAX_RETRIES=30

until check_server 3001; do
    RETRIES=$((RETRIES + 1))
    if [ $RETRIES -eq $MAX_RETRIES ]; then
        echo "Timeout waiting for servers"
        kill $TAIL_PID
        exit 1
    fi
    echo "Waiting for servers... (Attempt $RETRIES/$MAX_RETRIES)"
    sleep 2
done

echo "All servers are ready. Sending test request..."
./test-render.sh

# Keep showing logs for a while
sleep 20

# Clean up
kill $TAIL_PID
