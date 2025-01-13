import express from 'express';
import cors from 'cors';
import { handleWebhook, handleJobStatus } from './routes/webhook.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Webhook endpoints
app.post('/api/webhook', handleWebhook);
app.get('/api/jobs/:jobId', handleJobStatus);

// Serve rendered videos
app.use('/videos', express.static(path.join(process.cwd(), 'rendered-videos')));

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  POST /api/webhook    - Submit video generation job');
  console.log('  GET  /api/jobs/:id   - Check job status');
  console.log('  GET  /api/health     - Health check');
  console.log('  GET  /videos/:id     - Download rendered video');
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
