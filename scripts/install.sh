#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
SERVICE_NAME="render-worker"
INSTALL_DIR="/home/mgk/code/render-worker"
SERVICE_FILE="$INSTALL_DIR/render-worker.service"
SYSTEMD_DIR="/etc/systemd/system"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

echo -e "${YELLOW}Installing Render Worker Service...${NC}"

# Install system dependencies
echo -e "${YELLOW}Installing system dependencies...${NC}"
apt-get update
apt-get install -y curl build-essential

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    npm install -g pm2
fi

# Create required directories
echo -e "${YELLOW}Creating required directories...${NC}"
mkdir -p "$INSTALL_DIR/logs"
mkdir -p "$INSTALL_DIR/rendered-videos"

# Set correct permissions
echo -e "${YELLOW}Setting permissions...${NC}"
chown -R mgk:mgk "$INSTALL_DIR"
chmod +x "$INSTALL_DIR/scripts/services.sh"

# Install service file
echo -e "${YELLOW}Installing systemd service...${NC}"
cp "$SERVICE_FILE" "$SYSTEMD_DIR/$SERVICE_NAME.service"
chmod 644 "$SYSTEMD_DIR/$SERVICE_NAME.service"

# Reload systemd
echo -e "${YELLOW}Reloading systemd...${NC}"
systemctl daemon-reload

# Enable and start service
echo -e "${YELLOW}Enabling and starting service...${NC}"
systemctl enable "$SERVICE_NAME"
systemctl start "$SERVICE_NAME"

# Setup PM2 startup script
echo -e "${YELLOW}Setting up PM2 startup script...${NC}"
su - mgk -c "cd $INSTALL_DIR && pm2 startup"
su - mgk -c "cd $INSTALL_DIR && pm2 save"

# Check service status
echo -e "${YELLOW}Checking service status...${NC}"
systemctl status "$SERVICE_NAME"

echo -e "${GREEN}Installation complete!${NC}"
echo -e "You can manage the service using:"
echo -e "  ${YELLOW}systemctl start $SERVICE_NAME${NC}"
echo -e "  ${YELLOW}systemctl stop $SERVICE_NAME${NC}"
echo -e "  ${YELLOW}systemctl restart $SERVICE_NAME${NC}"
echo -e "  ${YELLOW}systemctl status $SERVICE_NAME${NC}"
echo -e "View logs with:"
echo -e "  ${YELLOW}journalctl -u $SERVICE_NAME${NC}"
echo -e "  ${YELLOW}$INSTALL_DIR/scripts/services.sh logs${NC}"
