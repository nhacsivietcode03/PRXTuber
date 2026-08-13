#!/bin/bash

# Clear terminal screen
clear

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Navigate to project root
cd "$PROJECT_ROOT" || exit 1

echo "========================================================="
echo "   PRXTUBER - IOS LOCAL IPA BUILD UTILITY                "
echo "========================================================="
echo "Project Root: $PROJECT_ROOT"
echo "Starting build process..."
echo "---------------------------------------------------------"
# Ensure CocoaPods/Xcode tools exist if building locally
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: Xcode command line tools are not installed."
    echo "Please install Xcode and its CLI tools to build locally."
    read -p "Press Enter to exit..."
    exit 1
fi

# Clean / Fast Build Selection
CLEAN_BUILD=false

if [ ! -d "ios" ] || [ ! -d "node_modules" ]; then
    echo "⚠️  Missing native project folder (ios/) or dependencies (node_modules/)."
    echo "Starting full installation and prebuild..."
    CLEAN_BUILD=true
else
    echo "Options:"
    echo "1) Fast Build (Only rebuild iOS IPA) - Default"
    echo "2) Clean Build (Expo Prebuild + Install NPM + Pod install + Build IPA)"
    read -t 10 -p "Select option [1-2] (auto-selects 1 in 10s): " option
    if [ "$option" == "2" ]; then
        CLEAN_BUILD=true
    fi
fi

if [ "$CLEAN_BUILD" = true ]; then
    # 1. Clean and Run Expo Prebuild
    echo "📦 [1/4] Running Expo prebuild (clearing old native folders)..."
    npx expo prebuild --clean --no-install
    if [ $? -ne 0 ]; then
        echo "❌ Prebuild failed."
        read -p "Press Enter to exit..."
        exit 1
    fi

    # 2. Install Dependencies
    echo "⚙️ [2/4] Installing npm packages..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ npm install failed."
        read -p "Press Enter to exit..."
        exit 1
    fi

    # 3. CocoaPods installation
    echo "💎 [3/4] Installing iOS Pods..."
    cd ios && pod install
    if [ $? -ne 0 ]; then
        echo "❌ Pod install failed."
        read -p "Press Enter to exit..."
        exit 1
    fi
    cd "$PROJECT_ROOT"
else
    echo "⏭️  Skipping Prebuild, NPM install, and Pod install (Fast Build)..."
fi

# 4. Compile IPA locally using xcodebuild
echo "🚀 [4/4] Starting local build using xcodebuild..."
echo "Using configuration: script/ExportOptions.plist"
echo "---------------------------------------------------------"

# Create build directory and clean old build files
mkdir -p build
rm -rf build/PrxTuber.xcarchive build/PrxTuber.ipa

# Run Xcode archive with manual code signing settings matching ExportOptions.plist
xcodebuild -workspace ios/PrxTuber.xcworkspace \
           -scheme PrxTuber \
           -configuration Release \
           -sdk iphoneos \
           -archivePath build/PrxTuber.xcarchive \
           archive \
           DEVELOPMENT_TEAM=MD4U8MPEK7 \
           CODE_SIGN_STYLE=Manual \
           PROVISIONING_PROFILE_SPECIFIER="cdonline Distribution" \
           CODE_SIGN_IDENTITY="Apple Distribution"

if [ $? -ne 0 ]; then
    echo "========================================================="
    echo "❌ XCODE ARCHIVE FAILED!"
    echo "If archive fails, you can open the Xcode workspace"
    echo "manually in 'ios/PrxTuber.xcworkspace' and archive from there."
    echo "========================================================="
    exit 1
fi

# Export the IPA using ExportOptions.plist
xcodebuild -exportArchive \
           -archivePath build/PrxTuber.xcarchive \
           -exportOptionsPlist script/ExportOptions.plist \
           -exportPath build

if [ $? -eq 0 ] && [ -f "build/PrxTuber.ipa" ]; then
    # Clean up archive on success
    rm -rf build/PrxTuber.xcarchive
    
    echo "========================================================="
    echo "✅ BUILD SUCCESSFUL!"
    echo "IPA File: $PROJECT_ROOT/build/PrxTuber.ipa"
    echo "========================================================="
    
    # Open folder containing the IPA file in Finder (macOS)
    if command -v open &> /dev/null; then
        open "$PROJECT_ROOT/build"
    fi
else
    echo "========================================================="
    echo "❌ IPA EXPORT FAILED!"
    echo "========================================================="
    exit 1
fi

# Keep terminal open
read -p "Press Enter to close..."

