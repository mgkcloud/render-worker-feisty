import { renderMedia, getCompositions, ensureBrowser } from '@remotion/renderer';
import { bundle } from '@remotion/bundler';
import { webpackOverride } from '../../remotion.config.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function handleRender(request) {
  try {
    const { compositionId, inputProps, codec } = await request.json();
    
    // Validate input props
    if (!inputProps || typeof inputProps !== 'object') {
      throw new Error('Invalid input props');
    }

    const requiredProps = ['background_url', 'media_list', 'voice_url', 'transcripts'];
    for (const prop of requiredProps) {
      if (!inputProps[prop]) {
        throw new Error(`Missing required prop: ${prop}`);
      }
    }

    // Ensure browser is ready
    console.log('Ensuring browser is ready...');
    await ensureBrowser();

    // Start the Remotion server
    console.log('Starting Remotion server...');
    console.log('Input props received:', JSON.stringify(inputProps, null, 2));
    console.log('Bundling with config:', {
      entryPoint: './src/remotion-root.ts',
      webpackOverride: 'configured'
    });

    // Use Remotion Studio for rendering
    console.log('Using Remotion Studio for rendering...');
    const serveUrl = 'http://localhost:3003';
    console.log('Remotion Studio URL:', serveUrl);

    // Bundle the composition
    console.log('Creating bundle...');
    const bundleLocation = await bundle({
      entryPoint: './src/remotion-root.ts',
      webpackOverride: webpackOverride,
      verbose: true,
    }).catch(error => {
      console.error('Bundle error:', error);
      throw error;
    });
    console.log('Bundle created successfully at:', bundleLocation);

    // Setup rendered-videos directory and cleanup old files
    const renderedDir = path.resolve(__dirname, '../../rendered-videos');
    if (!fs.existsSync(renderedDir)) {
      console.log('Creating rendered-videos directory...');
      fs.mkdirSync(renderedDir, { recursive: true });
    }

    // Clean up old rendered videos (keep last 10)
    const files = fs.readdirSync(renderedDir)
      .filter(f => f.endsWith('.mp4'))
      .map(f => ({
        name: f,
        time: fs.statSync(path.join(renderedDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 10) {
      files.slice(10).forEach(file => {
        try {
          fs.unlinkSync(path.join(renderedDir, file.name));
          console.log(`Cleaned up old video: ${file.name}`);
        } catch (err) {
          console.error(`Failed to clean up ${file.name}:`, err);
        }
      });
    }

    // Get composition details
    console.log('Getting compositions from bundle:', bundleLocation);
    const compositions = await getCompositions(bundleLocation).catch(error => {
      console.error('Get compositions error:', error);
      throw error;
    });
    console.log('Available compositions:', compositions.map(c => ({id: c.id, durationInFrames: c.durationInFrames})));
    
    const composition = compositions.find(c => c.id === compositionId);
    console.log('Selected composition:', JSON.stringify(composition, null, 2));

    if (!composition) {
      return new Response(JSON.stringify({
        success: false,
        message: `Composition ${compositionId} not found. Available compositions: ${compositions.map(c => c.id).join(', ')}`
      }), { 
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    const outputLocation = path.resolve(__dirname, '../../rendered-videos', `${compositionId}-${Date.now()}.mp4`);

    console.log('Starting render with full config:', {
      composition: {
        ...composition,
        height: composition.height,
        width: composition.width,
        fps: composition.fps,
        durationInFrames: composition.durationInFrames
      },
      serveUrl,
      codec,
      outputLocation,
      inputProps
    });

    let renderProgress = 0;
    try {
      console.log('Starting render with Chromium...');
      console.log('Browser config:', {
        disableWebSecurity: true,
        timeout: 180000,
      });
      console.log('Render config:', {
        composition: composition.id,
        durationInFrames: composition.durationInFrames,
        fps: composition.fps,
        width: composition.width,
        height: composition.height,
        outputLocation,
      });

      console.log('Starting render with configuration:', {
        composition: composition.id,
        serveUrl,
        codec,
        outputLocation,
        durationInFrames: composition.durationInFrames,
        fps: composition.fps
      });

      const renderData = await renderMedia({
        composition,
        serveUrl,
        codec,
        outputLocation,
        inputProps,
        chromiumOptions: {
          disableWebSecurity: true,
          timeout: 180000, // 3 minutes timeout
          ignoreHTTPSErrors: true,
        },
        onProgress: ({progress}) => {
          renderProgress = progress;
          console.log(`Render progress: ${Math.round(progress * 100)}% complete`);
        },
        onError: (error) => {
          console.error('Render error:', error);
          throw error;
        },
        onBrowserLog: (log) => {
          console.log('Browser log:', log);
        },
        timeoutInMilliseconds: 180000, // 3 minutes timeout
        concurrency: 1, // Reduce concurrency for stability
        verbose: true, // Enable verbose logging
        browserExecutable: process.env.CHROME_PATH, // Use system Chrome if available
      });

      console.log('Render completed successfully');

      console.log('Render complete with data:', JSON.stringify(renderData, null, 2));

      if (!fs.existsSync(outputLocation)) {
        throw new Error('Render completed but output file not found');
      }

      const fileSize = fs.statSync(outputLocation).size;
      console.log(`Render complete. File size: ${fileSize} bytes`);

      return new Response(JSON.stringify({
        success: true,
        message: 'Video generation complete',
        data: {
          id: path.basename(outputLocation),
          progress: renderProgress,
          fileSize,
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    } catch (renderError) {
      console.error('Render failed:', renderError);
      throw new Error(`Render failed: ${renderError.message}`);
    }
  } catch (error) {
    console.error('Render error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}

export async function handleProgress(request) {
  try {
    const { id } = request.params;
    
    // Check if file exists
    const filePath = path.join(process.cwd(), 'rendered-videos', id);
    const exists = fs.existsSync(filePath);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        status: exists ? 'done' : 'processing',
        url: exists ? `/videos/${id}` : null,
        progress: exists ? 1 : 0
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('Progress check error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}
