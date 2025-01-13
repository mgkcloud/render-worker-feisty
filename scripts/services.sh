#!/bin/bash

# Stop any running services
pkill -f "node src/server.js"

# Start the services
node src/server.js &

# Start the Remotion studio
remotion studio --port 3002 &
