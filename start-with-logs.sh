#!/bin/bash
mkdir -p logs
npm run start > logs/server.log 2>&1 &
echo "Servers started in background. View logs with: tail -f logs/server.log"
