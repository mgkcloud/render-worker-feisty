import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Webhook payload schema
const TranscriptSchema = z.object({
  words: z.string(),
  start: z.number(),
  end: z.number()
});

const WebhookPayloadSchema = z.object({
  type: z.string(),
  data: z.object({
    background_url: z.string().url(),
    media_list: z.array(z.string().url()),
    voice_url: z.string().url(),
    transcripts: z.array(TranscriptSchema)
  })
});

// In-memory job storage (replace with Redis/DB in production)
const jobs = new Map();

export async function handleWebhook(req, res) {
  try {
    console.log('Received webhook:', JSON.stringify(req.body, null, 2));

    // Validate webhook payload
    const validationResult = WebhookPayloadSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook payload',
        errors: validationResult.error.errors
      });
    }

    // Generate job ID and output path
    const jobId = uuidv4();
    const timestamp = new Date().toISOString();
    const outputDir = path.resolve(process.cwd(), 'rendered-videos');
    const outputPath = path.join(outputDir, `${jobId}.mp4`);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create job entry
    const job = {
      id: jobId,
      status: 'pending',
      created_at: timestamp,
      updated_at: timestamp,
      type: req.body.type,
      data: req.body.data,
      output: null,
      error: null
    };

    jobs.set(jobId, job);

    // Start processing in background
    processJob(job, outputPath).catch(error => {
      console.error(`Job ${jobId} failed:`, error);
      job.status = 'failed';
      job.error = error.message;
      job.updated_at = new Date().toISOString();
    });

    // Return job ID immediately
    return res.status(202).json({
      success: true,
      message: 'Video generation started',
      data: {
        job_id: jobId,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

export async function handleJobStatus(req, res) {
  try {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        job_id: job.id,
        status: job.status,
        created_at: job.created_at,
        updated_at: job.updated_at,
        output: job.output,
        error: job.error
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function processJob(job, outputPath) {
  try {
    console.log(`Processing job ${job.id}...`);

    // Update job status
    job.status = 'processing';
    job.updated_at = new Date().toISOString();

    // Create temporary props file
    const propsPath = path.join(process.cwd(), 'rendered-videos', `${job.id}-props.json`);
    fs.writeFileSync(propsPath, JSON.stringify({
      background_url: job.data.background_url,
      media_list: job.data.media_list,
      voice_url: job.data.voice_url,
      transcripts: job.data.transcripts
    }));

    // Build render command
const lambdaClient = new RemotionLambdaClient({
  region: 'us-east-1',
  functionName: 'remotion-lambda-function',
});

const renderResponse = await lambdaClient.renderVideo({
  compositionId: 'TikTok',
  inputProps: {
    background_url: job.data.background_url,
    media_list: job.data.media_list,
    voice_url: job.data.voice_url,
    transcripts: job.data.transcripts,
  },
  codec: 'h264',
});

    job.status = 'completed';
    job.output = {
      video_url: renderResponse.outputFile,
    };
    job.updated_at = new Date().toISOString();

    console.log(`Job ${job.id} completed successfully`);
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    job.status = 'failed';
    job.error = error.message;
    job.updated_at = new Date().toISOString();
    throw error;
  }
}
