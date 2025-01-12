import { Composition } from 'remotion';
import { TikTokComposition, InputPropsSchema } from './compositions/TikTok';
import { VideoGenerator } from './compositions/VideoGenerator';

const sampleProps = {
  background_url: 'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg',
  media_list: [
    'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg',
    'https://images.pexels.com/photos/1366907/pexels-photo-1366907.jpeg'
  ],
  voice_url: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
  transcripts: [
    {words: 'Welcome to our demo', start: 0, end: 2},
    {words: 'Check out these amazing images', start: 2, end: 4}
  ]
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TikTok"
        component={TikTokComposition}
        durationInFrames={30 * 60}
        fps={30}
        width={1080}
        height={1920}
        schema={InputPropsSchema}
        defaultProps={sampleProps}
      />
      <Composition
        id="VideoGenerator"
        component={VideoGenerator}
        durationInFrames={30 * 60}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
