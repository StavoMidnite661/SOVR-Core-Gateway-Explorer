#!/bin/bash
# SOVR Cryptographic Ledger Network Launcher
# Setup and activate the Sovereign CommandCenter on localhost:3000

clear
echo "======================================================================"
echo "   SOVR CRYPTOGRAPHIC LEDGER NETWORK & ACCOUNT CENTER BOOTSTRAPPER"
echo "======================================================================"
echo ""

# Color variables
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Detect Node.js
if ! command -v node &> /dev/null
then
    echo -e "${RED}[ERROR] Node.js runtime not detected in path.${NC}"
    echo "Please install Node.js (v18 or higher) from https://nodejs.org/"
    echo ""
    exit 1
fi

echo -e "${GREEN}[OK] Node.js env verified.${NC}"
node -v
echo ""

# Step 2: Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "[SYSTEM] First-time setup detected. Restoring packages..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Failed to install npm dependencies.${NC}"
        exit 1
    fi
else
    echo -e "[SYSTEM] Node packages verified in node_modules directory."
fi

echo ""
echo "======================================================================"
echo -e "${GREEN}  ACTIVATING LOCAL SOVEREIGN COMMAND CENTER${NC}"
echo "  Console will be available shortly on local port 3000:"
echo "  URL: http://localhost:3000"
echo "======================================================================"
echo ""

# Step 3: Run Dev Server
npm run dev
