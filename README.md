# Render Worker Service

A production-ready video rendering service that handles webhook requests to generate videos using Remotion.

## Features

- Webhook-based video generation
- Job status tracking
- Production-ready service management
- Automatic service recovery
- Health monitoring
- Port conflict prevention
- Process isolation

## System Requirements

- Node.js 18+
- PM2 (installed globally)
- Linux with systemd

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd render-worker
```

2. Install dependencies:
```bash
npm install
```

3. Run the installation script as root:
```bash
sudo ./scripts/install.sh
```

This will:
- Install system dependencies
- Set up the systemd service
- Configure PM2 for process management
- Set appropriate permissions
- Start the service

## Service Management

### Using systemd

```bash
# Start the service
sudo systemctl start render-worker

# Stop the service
sudo systemctl stop render-worker

# Restart the service
sudo systemctl restart render-worker

# Check service status
sudo systemctl status render-worker

# View service logs
sudo journalctl -u render-worker
```

### Using the service script

```bash
# Start all services
./scripts/services.sh start

# Stop all services
./scripts/services.sh stop

# Restart all services
./scripts/services.sh restart

# Check service status
./scripts/services.sh status

# View service logs
./scripts/services.sh logs

# Monitor service metrics
./scripts/services.sh metrics
```

## API Usage

### Submit a video generation job

```bash
curl -X POST http://localhost:3001/api/webhook \
-H "Content-Type: application/json" \
-d '{
  "type": "video_generation",
  "data": {
    "background_url": "https://example.com/background.mp3",
    "media_list": [
      "https://example.com/video1.mp4",
      "https://example.com/video2.mp4"
    ],
    "voice_url": "https://example.com/voice.mp3",
    "transcripts": [
      {"words": "Example text", "start": 0, "end": 1}
    ]
  }
}'
```

### Check job status

```bash
curl http://localhost:3001/api/jobs/{job_id}
```

## Service Architecture

The service consists of three main components:

1. **API Server** (Port 3001)
   - Handles webhook requests
   - Manages job queue
   - Provides status endpoints

2. **Remotion Studio** (Port 3003)
   - Handles video rendering
   - Provides preview capabilities

3. **Vite Development Server** (Port 3000)
   - Serves the web interface
   - Development tools

## Directory Structure

```
.
├── scripts/
│   ├── install.sh       # Installation script
│   ├── services.sh      # Service management script
│   └── test-webhook.sh  # Testing script
├── src/
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── components/      # React components
├── rendered-videos/     # Output directory
├── logs/               # Log files
├── ecosystem.config.cjs # PM2 configuration
└── render-worker.service # Systemd service file
```

## Monitoring and Maintenance

### Health Checks

The service provides health check endpoints:
```bash
curl http://localhost:3001/health
```

### Log Files

- API Server: `logs/api-server.log`
- Remotion Studio: `logs/remotion-studio.log`
- Vite Server: `logs/vite-server.log`
- Error logs: `logs/*-error.log`

### Process Management

PM2 provides process monitoring and automatic restart capabilities:
```bash
pm2 list            # List processes
pm2 monit           # Monitor processes
pm2 logs            # View logs
pm2 reload all      # Zero-downtime reload
```

## Troubleshooting

1. **Service won't start**
   - Check port availability: `./scripts/services.sh status`
   - Check logs: `./scripts/services.sh logs`
   - Verify permissions: `ls -l scripts/services.sh`

2. **Port conflicts**
   - The service automatically checks for port conflicts
   - Default ports: 3000, 3001, 3003
   - Configure different ports in ecosystem.config.cjs

3. **Process crashes**
   - PM2 will automatically restart crashed processes
   - Check crash logs: `pm2 logs`
   - Monitor resources: `pm2 monit`

## Security Considerations

1. **Port Access**
   - Only required ports are exposed
   - Internal services are not accessible externally

2. **Process Isolation**
   - Services run under a dedicated user
   - PM2 provides process isolation

3. **Error Handling**
   - All errors are logged
   - Failed jobs are tracked
   - Automatic cleanup of old files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your License Here]
