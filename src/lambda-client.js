export const invokeLambda = async (body) => {
  console.log('Invoking Lambda function...')

  try {
    console.log('Lambda request body:', JSON.stringify(body, null, 2))

    console.log('Sending request to Lambda endpoint:', process.env.LAMBDA_INVOKE_URL)
    const response = await fetch(process.env.LAMBDA_INVOKE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.LAMBDA_API_KEY
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.error('Lambda invocation failed:', response.statusText)
      throw new Error(`Lambda invocation failed: ${response.statusText}`);
    }

    const responseData = await response.json()
    console.log('Lambda response:', JSON.stringify(responseData, null, 2))
    return responseData
    
  } catch (error) {
    console.error('Lambda invocation error:', error)
    throw error
  }
};
