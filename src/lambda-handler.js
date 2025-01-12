import { renderMediaOnLambda } from '@remotion/lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  try {
    const { inputProps, compositionId } = JSON.parse(event.body);
    
    const render = await renderMediaOnLambda({
      region: process.env.AWS_REGION,
      functionName: process.env.REMOTION_LAMBDA_FUNCTION,
      inputProps,
      compositionId,
      codec: 'h264',
      serveUrl: process.env.REMOTION_SERVE_URL,
    });

    // Upload result to S3
    const uploadParams = {
      Bucket: process.env.OUTPUT_BUCKET,
      Key: `renders/${render.renderId}.mp4`,
      Body: render.output,
      ContentType: 'video/mp4'
    };

    await s3.send(new PutObjectCommand(uploadParams));

    return {
      statusCode: 200,
      body: JSON.stringify({
        renderId: render.renderId,
        outputUrl: `https://${process.env.OUTPUT_BUCKET}.s3.amazonaws.com/renders/${render.renderId}.mp4`
      })
    };
  } catch (error) {
    console.error('Error rendering video:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
