import React from 'react';
import { Composition } from 'remotion';
import { TikTokComposition } from './TikTok';

export const Root = () => {
  return (
    <>
      <Composition
        id="TikTokStyle"
        component={TikTokComposition}
        durationInFrames={30 * 10} // 10 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          voice_url: '',
          background_url: '',
          image_list: [],
          transcripts: []
        }}
      />
    </>
  );
};
