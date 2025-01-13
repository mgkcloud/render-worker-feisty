#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Server URL
SERVER_URL="http://localhost:3001"

# Test data
JSON_DATA='{
  "type": "video_generation",
  "data": {
    "background_url": "https://s3.fy.studio/sunset.mp3",
    "media_list": [
      "https://fal.media/files/kangaroo/yjMIdueONzzQeyFahD7Mo_output.mp4",
      "https://fal.media/files/lion/Jbp5DAdxY5UJyi7R4GgpC_output.mp4",
      "https://fal.media/files/zebra/gsFHokDhYrrOLu80-B63h_output.mp4",
      "https://fal.media/files/zebra/NqoQM97rV4d5yF9ssEo1y_output.mp4",
      "https://fal.media/files/zebra/Y9Jr9BfAI75PRqqTF4qxB_output.mp4",
      "https://fal.media/files/koala/y3XGWElP82U-rZq9lrZZ2_output.mp4",
      "https://fal.media/files/elephant/kWhWYz0q0n5PuWJ6wP9pp_output.mp4",
      "https://fal.media/files/monkey/e0VQjAtSA78KqVMK9puMn_output.mp4"
    ],
    "voice_url": "https://s3.fy.studio/audio-1736660624963.mp3",
    "transcripts": [
      {"words": "Did you know", "start": 0, "end": 0.5199999809265137},
      {"words": "that women played", "start": 0.5199999809265137, "end": 1.2200000286102295},
      {"words": "a crucial role", "start": 1.2200000286102295, "end": 2.059999942779541}
    ]
  }
}'

echo -e "${YELLOW}Testing webhook endpoint...${NC}"

# Check if server is healthy
echo -e "\n${YELLOW}Checking server health...${NC}"
HEALTH_RESPONSE=$(curl -s "${SERVER_URL}/health")
if [[ $HEALTH_RESPONSE == *"\"status\":\"ok\""* ]]; then
    echo -e "${GREEN}Server is healthy${NC}"
else
    echo -e "${RED}Server is not responding properly${NC}"
    exit 1
fi

# Submit webhook request
echo -e "\n${YELLOW}Submitting video generation request...${NC}"
RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$JSON_DATA" \
  "${SERVER_URL}/api/webhook")

# Extract job ID
JOB_ID=$(echo $RESPONSE | grep -o '"job_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$JOB_ID" ]; then
    echo -e "${RED}Failed to get job ID from response${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

echo -e "${GREEN}Job submitted successfully. Job ID: $JOB_ID${NC}"

# Poll job status
echo -e "\n${YELLOW}Polling job status...${NC}"
MAX_ATTEMPTS=30
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    STATUS_RESPONSE=$(curl -s "${SERVER_URL}/api/jobs/${JOB_ID}")
    JOB_STATUS=$(echo $STATUS_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    
    echo -e "${YELLOW}Attempt $ATTEMPT: Status - $JOB_STATUS${NC}"
    
    if [ "$JOB_STATUS" = "completed" ]; then
        echo -e "${GREEN}Job completed successfully!${NC}"
        echo "Final response: $STATUS_RESPONSE"
        exit 0
    elif [ "$JOB_STATUS" = "failed" ]; then
        echo -e "${RED}Job failed${NC}"
        echo "Error details: $STATUS_RESPONSE"
        exit 1
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    sleep 5
done

echo -e "${RED}Timeout waiting for job completion${NC}"
exit 1
