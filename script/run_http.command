#!/bin/bash

# Clear terminal screen
clear

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Navigate to project root
cd "$PROJECT_ROOT" || exit 1

echo "========================================================="
echo "   PRXTUBER - START LAN HTTP/HTTPS DISTRIBUTION SERVER   "
echo "========================================================="
echo "Project Root: $PROJECT_ROOT"
echo "Build Dir:    $PROJECT_ROOT/build"
echo "---------------------------------------------------------"

# Ensure Node.js exists
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo "Please install Node.js to run the distribution server."
    read -p "Press Enter to exit..."
    exit 1
fi

# Run Node.js LAN server script
node "$SCRIPT_DIR/lan_server.js" "$@"
