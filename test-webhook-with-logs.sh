#!/bin/bash

# Kill existing processes
pkill -f "remotion studio"
pkill -f "vite"
pkill -f "node src/server.js"

# Start servers in background and save PID
./start-with-logs.sh
sleep 5

# Show logs in background
tail -f logs/server.log &
TAIL_PID=$!

# Run the webhook test
./test-webhook.sh
TEST_RESULT=$?

# Keep showing logs for a bit if there was an error
if [ $TEST_RESULT -ne 0 ]; then
    echo "Test failed, showing logs for 10 more seconds..."
    sleep 10
fi

# Cleanup
kill $TAIL_PID
exit $TEST_RESULT
