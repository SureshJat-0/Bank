#!/bin/bash
# Enhanced Bank Chatbot Linux Startup Script
# SecureBank AI Chatbot - Integrated Frontend & Backend

set -e  # Exit on any error

echo "🏦 Starting SecureBank AI Chatbot (Integrated Version)..."
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    echo "Ubuntu/Debian: sudo apt update && sudo apt install python3 python3-pip python3-venv"
    echo "CentOS/RHEL: sudo yum install python3 python3-pip"
    echo "macOS: brew install python3"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    echo "Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    echo "CentOS/RHEL: curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo yum install nodejs npm"
    echo "macOS: brew install node"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

# Create backend virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
    print_info "Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment and install backend dependencies
print_info "Setting up backend..."
cd backend
source venv/bin/activate

print_info "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

print_info "Downloading spaCy English model..."
python -m spacy download en_core_web_sm

print_info "Training NLU model..."
if [ ! -d "nlu_model" ]; then
    python nlu_service.py --train
fi

cd ..

# Install frontend dependencies
print_info "Setting up frontend..."
cd frontend
print_info "Installing Node.js dependencies..."
npm install

cd ..

# Create necessary directories
mkdir -p backend/logs
mkdir -p frontend/public

print_status "Setup complete!"
echo

print_info "Starting all services..."
echo

# Function to cleanup background processes
cleanup() {
    print_warning "Stopping all services..."
    jobs -p | xargs -r kill
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start NLU service in background
print_info "Starting NLU service on port 8000..."
cd backend
source venv/bin/activate
python nlu_service.py --serve &
NLU_PID=$!

# Wait for NLU service to start
sleep 3

# Start Flask API in background
print_info "Starting Flask API on port 3000..."
python app.py &
API_PID=$!

cd ..

# Wait for Flask API to start
sleep 3

# Start React frontend
print_info "Starting React frontend on port 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!

cd ..

echo
print_status "🎉 SecureBank AI Chatbot is now running!"
echo
echo "📱 Access the application at: http://localhost:5173"
echo "🔧 API Server: http://localhost:3000"
echo "🧠 NLU Service: http://localhost:8000"
echo
echo "👥 Demo Accounts:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 Admin Account:"
echo "   Email: admin@securebank.com"
echo "   Password: admin123"
echo
echo "👤 User Accounts:"
echo "   Email: rajesh@securebank.com | Password: user123"
echo "   Email: priya@securebank.com  | Password: user123"
echo "   Email: amit@securebank.com   | Password: user123"
echo
echo "🏦 Banking Login (Alternative):"
echo "   Account: 1234567890 | PIN: 1234 (Rajesh Kumar)"
echo "   Account: 2345678901 | PIN: 5678 (Priya Sharma)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "📖 Features:"
echo "   • Modern React frontend with banking theme"
echo "   • AI-powered chatbot with NLU"
echo "   • Admin dashboard with analytics"
echo "   • FAQ management system"
echo "   • Dark/light theme support"
echo "   • Responsive mobile design"
echo
print_warning "To stop all services, press Ctrl+C"
echo "💡 Service logs will appear below:"
echo

# Wait for all background processes
wait
