#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
LOCK_FILE="/tmp/render-worker.lock"
LOG_DIR="logs"
PORTS=(3000 3001 3003)
MAX_RETRIES=30
RETRY_INTERVAL=2

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to acquire lock
acquire_lock() {
    if [ -e "$LOCK_FILE" ]; then
        PID=$(cat "$LOCK_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo -e "${RED}Another instance is running with PID $PID${NC}"
            return 1
        fi
    fi
    echo $$ > "$LOCK_FILE"
    trap 'rm -f "$LOCK_FILE"' EXIT
    return 0
}

# Function to check if a port is in use
check_port() {
    local port=$1
    lsof -i:"$port" >/dev/null 2>&1
    return $?
}

# Function to wait for a port to be available
wait_for_port_available() {
    local port=$1
    local retries=0
    while check_port "$port"; do
        if [ $retries -ge $MAX_RETRIES ]; then
            echo -e "${RED}Timeout waiting for port $port to become available${NC}"
            return 1
        fi
        echo -n "."
        sleep $RETRY_INTERVAL
        retries=$((retries + 1))
    done
    return 0
}

# Function to wait for a service to be ready
wait_for_service() {
    local port=$1
    local service=$2
    local retries=0

    echo -e "${YELLOW}Waiting for $service to be ready on port $port...${NC}"
    
    while ! curl -s "http://localhost:$port/health" > /dev/null; do
        if [ $retries -ge $MAX_RETRIES ]; then
            echo -e "${RED}Timeout waiting for $service to be ready${NC}"
            return 1
        fi
        echo -n "."
        sleep $RETRY_INTERVAL
        retries=$((retries + 1))
    done

    echo -e "${GREEN}$service is ready!${NC}"
    return 0
}

# Function to check PM2 daemon
ensure_pm2_daemon() {
    if ! pm2 ping > /dev/null 2>&1; then
        echo -e "${YELLOW}Starting PM2 daemon...${NC}"
        pm2 kill
        pm2 startup
        pm2 save
    fi
}

# Function to start services
start_services() {
    echo -e "${YELLOW}Starting services...${NC}"
    
    # Acquire lock
    if ! acquire_lock; then
        exit 1
    fi

    # Ensure PM2 daemon is running
    ensure_pm2_daemon

    # Check if services are already running
    if pm2 list | grep -q "remotion-studio\|api-server\|vite-server"; then
        echo -e "${YELLOW}Some services are already running. Stopping them first...${NC}"
        stop_services
    fi

    # Wait for ports to be available
    for port in "${PORTS[@]}"; do
        echo -e "${YELLOW}Checking port $port...${NC}"
        if ! wait_for_port_available "$port"; then
            echo -e "${RED}Port $port is in use. Cannot start services.${NC}"
            exit 1
        fi
    done

    # Start all services using PM2
    if [ ! -f ecosystem.config.cjs ]; then
        echo -e "${RED}ecosystem.config.cjs not found!${NC}"
        exit 1
    fi

    echo -e "${YELLOW}Starting services with PM2...${NC}"
    pm2 start ecosystem.config.cjs || {
        echo -e "${RED}Failed to start services with PM2${NC}"
        exit 1
    }

    # Wait for services to be ready
    wait_for_service 3001 "API Server" && \
    wait_for_service 3003 "Remotion Studio"

    # Save PM2 configuration
    pm2 save

    # Show service status
    echo -e "\n${YELLOW}Service Status:${NC}"
    pm2 list

    # Start monitoring logs
    echo -e "\n${YELLOW}Services are running. View logs with: ./scripts/services.sh logs${NC}"
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    
    # Kill any existing processes on our ports
    for port in "${PORTS[@]}"; do
        pid=$(lsof -ti:"$port" 2>/dev/null)
        if [ ! -z "$pid" ]; then
            echo -e "${YELLOW}Killing process on port $port (PID: $pid)${NC}"
            kill -9 "$pid" 2>/dev/null || true
        fi
    done

    # Stop PM2 processes
    pm2 delete all 2>/dev/null || true
    
    # Remove lock file
    rm -f "$LOCK_FILE"
    
    echo -e "${GREEN}All services stopped${NC}"
}

# Function to restart services
restart_services() {
    echo -e "${YELLOW}Restarting all services...${NC}"
    stop_services
    sleep 2
    start_services
}

# Function to show service status
status_services() {
    echo -e "${YELLOW}Service Status:${NC}"
    pm2 list
    
    echo -e "\n${YELLOW}Port Status:${NC}"
    for port in "${PORTS[@]}"; do
        if check_port "$port"; then
            echo -e "Port $port: ${RED}In use${NC}"
        else
            echo -e "Port $port: ${GREEN}Available${NC}"
        fi
    done
}

# Function to show service logs
logs_services() {
    echo -e "${YELLOW}Service Logs:${NC}"
    pm2 logs
}

# Function to show service metrics
metrics_services() {
    echo -e "${YELLOW}Service Metrics:${NC}"
    pm2 monit
}

# Command line interface
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        status_services
        ;;
    logs)
        logs_services
        ;;
    metrics)
        metrics_services
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|metrics}"
        exit 1
        ;;
esac

exit 0
