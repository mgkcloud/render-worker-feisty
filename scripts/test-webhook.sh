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
      "https://fal.media/files/zebra/gsFHokDhYrrOLu80-B63h_output.mp4"
    ],
    "voice_url": "https://s3.fy.studio/audio-1736660624963.mp3",
    "transcripts": [
      {"words": "Did you know", "start": 0, "end": 0.5199999809265137},
      {"words": "that women played", "start": 0.5199999809265137, "end": 1.2200000286102295},
      {"words": "a crucial role", "start": 1.2200000286102295, "end": 2.059999942779541}
    ]
  }
}'

# Function to check if services are ready
check_services() {
    echo -e "${YELLOW}Checking if services are ready...${NC}"
    
    # Check API server
    if ! curl -s "${SERVER_URL}/health" > /dev/null; then
        echo -e "${RED}API server is not running. Please start services first with: ./scripts/services.sh start${NC}"
        exit 1
    fi

    # Check Remotion Studio
    if ! curl -s "http://localhost:3002" > /dev/null; then
        echo -e "${RED}Remotion Studio is not running. Please start services first with: ./scripts/services.sh start${NC}"
        exit 1
    fi

    echo -e "${GREEN}All services are running${NC}"
}

# Function to run the test
run_test() {
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
    MAX_ATTEMPTS=60
    ATTEMPT=1

    while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
        STATUS_RESPONSE=$(curl -s "${SERVER_URL}/api/jobs/${JOB_ID}")
        JOB_STATUS=$(echo $STATUS_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
        
        echo -e "${YELLOW}Attempt $ATTEMPT: Status - $JOB_STATUS${NC}"
        
        if [ "$JOB_STATUS" = "completed" ]; then
            echo -e "${GREEN}Job completed successfully!${NC}"
            echo -e "\nFinal response:"
            echo $STATUS_RESPONSE | python3 -m json.tool
            return 0
        elif [ "$JOB_STATUS" = "failed" ]; then
            echo -e "${RED}Job failed${NC}"
            echo -e "\nError details:"
            echo $STATUS_RESPONSE | python3 -m json.tool
            return 1
        fi
        
        ATTEMPT=$((ATTEMPT + 1))
        sleep 5
    done

    echo -e "${RED}Timeout waiting for job completion${NC}"
    return 1
}

# Main execution
echo -e "${YELLOW}Starting webhook test...${NC}"

# Check if services are running
check_services

# Run the test
if run_test; then
    echo -e "\n${GREEN}Test completed successfully!${NC}"
    exit 0
else
    echo -e "\n${RED}Test failed!${NC}"
    echo -e "Check the logs for more details: ./scripts/services.sh logs"
    exit 1
fi
