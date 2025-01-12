import { renderMediaOnLambda } from '@remotion/lambda/client';

export const invokeLambda = async (body) => {
  console.log('Invoking Remotion Lambda function...');

  const { region, functionName, siteName, compositionId, inputProps, codec } = body;

  try {
    const response = await renderMediaOnLambda({
      region: region || process.env.REMOTION_AWS_REGION,
      functionName: functionName || process.env.REMOTION_AWS_LAMBDA_FUNCTION,
      siteName: siteName,
      compositionId: compositionId,
      inputProps: inputProps,
      codec: codec,
    });

    console.log('Remotion Lambda response:', response);
    return response;
  } catch (error) {
    console.error('Remotion Lambda invocation error:', error);
    throw error;
  }
};
