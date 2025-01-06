import { Composition } from 'remotion'
import { TikTokComposition } from './TikTok'

export const Root = () => {
  const inputProps = getInputProps()

  return (
    <>
      <Composition
        id="TikTokVideo"
        component={TikTokComposition}
        durationInFrames={Math.ceil(inputProps.data.voice_url.duration * 30)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={inputProps.data}
      />
    </>
  )
}
