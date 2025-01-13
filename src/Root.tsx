import { Composition } from 'remotion';
import { VideoGenerator, InputPropsSchema } from './compositions/VideoGenerator';

const sampleProps = {
  background_url: "https://s3.fy.studio/sunset.mp3",
  media_list: [
    "https://fal.media/files/kangaroo/yjMIdueONzzQeyFahD7Mo_output.mp4",
    "https://fal.media/files/lion/Jbp5DAdxY5UJyi7R4GgpC_output.mp4",
    "https://fal.media/files/zebra/gsFHokDhYrrOLu80-B63h_output.mp4",
    "https://fal.media/files/zebra/NqoQM97rV4d5yF9ssEo1y_output.mp4",
    "https://fal.media/files/zebra/Y9Jr9BfAI75PRqqTF4qxB_output.mp4",
    "https://fal.media/files/koala/y3XGWElP82U-rZq9lrZZ2_output.mp4",
    "https://fal.media/files/elephant/kWhWYz0n5PuWJ6wP9pp_output.mp4",
    "https://fal.media/files/monkey/e0VQjAtSA78KqVMK9puMn_output.mp4"
  ],
  voice_url: "https://s3.fy.studio/audio-1736660624963.mp3",
  transcripts: [
    { words: "Did you know", start: 0, end: 0.52 },
    { words: "that women played", start: 0.52, end: 1.22 },
    { words: "a crucial role", start: 1.22, end: 2.06 },
    { words: "in medieval warfare?", start: 2.06, end: 2.94 },
    { words: "Far beyond the", start: 2.94, end: 4.64 },
    { words: "shadows of history.", start: 4.64, end: 5.52 },
    { words: "While knights and", start: 5.96, end: 6.98 },
    { words: "kings dominate the", start: 6.98, end: 7.8 },
    { words: "tales, female warriors,", start: 7.8, end: 9.04 },
    { words: "strategists, and leaders", start: 10, end: 10.9 },
    { words: "quietly shaped the", start: 10.9, end: 12.32 },
    { words: "outcomes of battles.", start: 12.32, end: 12.88 },
    { words: "From Joan of", start: 13.56, end: 14.44 },
    { words: "Arc, who led", start: 14.44, end: 15.1 },
    { words: "armies to victory,", start: 15.1, end: 15.92 },
    { words: "to noblewomen who", start: 16.34, end: 17.3 },
    { words: "fortified castles and", start: 17.3, end: 18.38 },
    { words: "negotiated peace.", start: 18.38, end: 19.8 },
    { words: "Their contributions", start: 19.8, end: 20.94 },
    { words: "were monumental.", start: 20.94, end: 21.9 },
    { words: "One lesser-known", start: 21.9, end: 22.5 },
    { words: "figure is Matilda", start: 22.5, end: 23.54 },
    { words: "of Tuscany, a", start: 23.54, end: 25.06 },
    { words: "military commander who", start: 25.06, end: 25.82 },
    { words: "defended papal territories", start: 25.82, end: 26.84 },
    { words: "with unmatched skill.", start: 26.84, end: 27.82 },
    { words: "Yet their stories", start: 27.82, end: 28.92 },
    { words: "are often overshadowed", start: 28.92, end: 30.1 },
    { words: "by myths or", start: 30.1, end: 30.72 },
    { words: "dismissed as legends.", start: 30.72, end: 31.62 },
    { words: "What if these", start: 32.46, end: 32.96 },
    { words: "women were the", start: 32.96, end: 33.64 },
    { words: "unsung architects of", start: 33.64, end: 34.52 },
    { words: "medieval victories?", start: 34.52, end: 36.28 },
    { words: "Their legacy challenges", start: 36.28, end: 37.34 },
    { words: "our understanding of", start: 37.34, end: 38.22 },
    { words: "history and inspires", start: 38.22, end: 39.02 },
    { words: "us to rethink the", start: 39.02, end: 39.84 },
    { words: "roles women played", start: 39.84, end: 40.36 },
    { words: "in shaping the", start: 40.36, end: 40.94 },
    { words: "world. What other", start: 40.94, end: 42.28 },
    { words: "hidden stories of", start: 42.28, end: 43.02 },
    { words: "female warriors are", start: 43.02, end: 43.92 },
    { words: "waiting to be", start: 43.92, end: 44.64 },
    { words: "uncovered?", start: 44.64, end: 44.64 }
  ]
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TikTok"
        component={VideoGenerator}
        durationInFrames={1500} // Adjusted for new content
        fps={30}
        width={1080}
        height={1920}
        schema={InputPropsSchema}
        defaultProps={sampleProps}
      />
    </>
  );
};
