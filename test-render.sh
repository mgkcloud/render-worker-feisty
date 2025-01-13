#!/bin/bash
curl -X POST http://localhost:3001/api/render?api_key=dev_api_key_123 \
-H "Content-Type: application/json" \
-d '{
  "compositionId": "TikTok",
  "inputProps": {
    "background_url": "https://s3.fy.studio/sunset.mp3",
    "media_list": [
      "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg"
    ],
    "voice_url": "https://s3.fy.studio/audio-1736660624963.mp3",
    "transcripts": [
      {"words": "Test caption", "start": 0, "end": 2}
    ]
  },
  "codec": "h264"
}'
