# Video Generator

A web application for generating TikTok-style videos with captions and media sequences.

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
VITE_API_KEY=your_api_key_here
VITE_API_BASE_URL=http://localhost:8787
```

4. Start the development server:
```bash
npm run dev
```

## Usage

1. Open the application in your browser (default: http://localhost:3000)
2. Either:
   - Click "Load Sample" to load sample data, or
   - Paste your own JSON configuration in the format:
```json
{
  "type": "string",
  "data": {
    "background_url": "URL to background music",
    "media_list": ["Array of media URLs (images/videos)"],
    "voice_url": "URL to voiceover audio",
    "transcripts": [
      {
        "words": "Text content",
        "start": 0,
        "end": 1
      }
    ]
  }
}
```

3. Preview the video composition
4. Click "Generate Video" to render the final video
5. Download the generated video when complete

## Features

- Real-time preview of video composition
- Support for multiple media types (images and videos)
- Synchronized captions with audio
- Progress tracking during video generation
- Download link for final video
- Error handling and validation

## Development

The application is built with:
- React
- TypeScript
- Remotion
- Tailwind CSS
- Vite

Key files:
- `src/main.tsx` - Main application component
- `src/compositions/TikTok.tsx` - Video composition definition
- `src/services/videoService.ts` - API integration
