#!/bin/bash

# Clear terminal screen
clear

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Navigate to project root
cd "$PROJECT_ROOT" || exit 1

echo "========================================================="
echo "   PRXTUBER - HOT UPDATER OTA DEPLOYMENT UTILITY         "
echo "========================================================="
echo "Project Root: $PROJECT_ROOT"
echo "Fetching current native app versions..."
echo "---------------------------------------------------------"

# Retrieve versions
JSON_VERSIONS=$(npx hot-updater app-version --json 2>/dev/null)
ANDROID_VERSION=$(echo "$JSON_VERSIONS" | node -e "const fs = require('fs'); try { console.log(JSON.parse(fs.readFileSync(0, 'utf-8')).android || ''); } catch(e) { console.log(''); }")
IOS_VERSION=$(echo "$JSON_VERSIONS" | node -e "const fs = require('fs'); try { console.log(JSON.parse(fs.readFileSync(0, 'utf-8')).ios || ''); } catch(e) { console.log(''); }")

echo "Current Android native version: ${ANDROID_VERSION:-Unknown}"
echo "Current iOS native version:     ${IOS_VERSION:-Unknown}"
echo "---------------------------------------------------------"

# 1. Platform Selection
echo "Select platform(s) to deploy:"
echo "1) Both iOS & Android (Default)"
echo "2) iOS only"
echo "3) Android only"
read -p "Select option [1-3]: " plat_option

PLATFORM=""
if [ "$plat_option" == "2" ]; then
    PLATFORM="ios"
elif [ "$plat_option" == "3" ]; then
    PLATFORM="android"
else
    PLATFORM="both"
fi

# 2. Channel Selection
echo ""
echo "Select release channel:"
echo "1) production (Default)"
echo "2) staging"
echo "3) development"
echo "4) Custom channel..."
read -p "Select option [1-4]: " chan_option

CHANNEL="production"
if [ "$chan_option" == "2" ]; then
    CHANNEL="staging"
elif [ "$chan_option" == "3" ]; then
    CHANNEL="development"
elif [ "$chan_option" == "4" ]; then
    read -p "Enter custom channel name: " custom_chan
    CHANNEL="$custom_chan"
fi

# 3. Target Version Option
echo ""
echo "Target app version range:"
echo "1) Match current native version exactly (Default)"
echo "2) Semver range (e.g. 1.x.x, >=1.0.0)"
echo "3) All versions (*)"
read -p "Select option [1-3]: " ver_option

TARGET_IOS=""
TARGET_ANDROID=""

if [ "$ver_option" == "2" ]; then
    read -p "Enter version range (e.g. 1.x.x): " ver_range
    TARGET_IOS="$ver_range"
    TARGET_ANDROID="$ver_range"
elif [ "$ver_option" == "3" ]; then
    TARGET_IOS="*"
    TARGET_ANDROID="*"
else
    TARGET_IOS="$IOS_VERSION"
    TARGET_ANDROID="$ANDROID_VERSION"
fi

# 4. Force Update
echo ""
read -p "Force update (forces clients to apply the update immediately)? [y/N]: " force_opt
FORCE_FLAG=""
if [[ "$force_opt" =~ ^[Yy]$ ]]; then
    FORCE_FLAG="-f"
fi

# 5. Message
echo ""
read -p "Enter deployment message (optional): " DEPLOY_MESSAGE

# Summary
echo ""
echo "========================================================="
echo "   DEPLOYMENT SUMMARY"
echo "========================================================="
echo "Platform:       $PLATFORM"
echo "Channel:        $CHANNEL"
if [ "$PLATFORM" == "both" ]; then
    echo "iOS Target:     ${TARGET_IOS:-Unknown}"
    echo "Android Target: ${TARGET_ANDROID:-Unknown}"
else
    echo "Target Version: ${TARGET_IOS:-${TARGET_ANDROID:-Unknown}}"
fi
if [ -n "$FORCE_FLAG" ]; then
    echo "Force Update:   Yes"
else
    echo "Force Update:   No"
fi
echo "Message:        ${DEPLOY_MESSAGE:-No message}"
echo "========================================================="
read -p "Proceed with deployment? [y/N]: " confirm_opt

if [[ ! "$confirm_opt" =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled."
    read -p "Press Enter to exit..."
    exit 0
fi

# Execute Deployment
deploy_platform() {
    local plat="$1"
    local target="$2"
    echo ""
    echo "🚀 Deploying $plat hot update to channel '$CHANNEL'..."
    
    local cmd="npx hot-updater deploy -p $plat -c $CHANNEL"
    if [ -n "$target" ]; then
        cmd="$cmd -t \"$target\""
    fi
    if [ -n "$FORCE_FLAG" ]; then
        cmd="$cmd $FORCE_FLAG"
    fi
    if [ -n "$DEPLOY_MESSAGE" ]; then
        cmd="$cmd -m \"$DEPLOY_MESSAGE\""
    fi
    
    echo "Executing: $cmd"
    eval "$cmd"
    
    if [ $? -eq 0 ]; then
        echo "✅ $plat deployment succeeded!"
    else
        echo "❌ $plat deployment failed."
        return 1
    fi
}

if [ "$PLATFORM" == "ios" ]; then
    deploy_platform "ios" "$TARGET_IOS"
elif [ "$PLATFORM" == "android" ]; then
    deploy_platform "android" "$TARGET_ANDROID"
else
    deploy_platform "ios" "$TARGET_IOS"
    IOS_RES=$?
    deploy_platform "android" "$TARGET_ANDROID"
    AND_RES=$?
    if [ $IOS_RES -ne 0 ] || [ $AND_RES -ne 0 ]; then
        echo "⚠️  One or more deployments failed."
    fi
fi

# Show Bundle List
echo ""
echo "---------------------------------------------------------"
echo "Recent deployments (Latest 5):"
npx hot-updater bundle list --limit 5

echo "========================================================="
read -p "Press Enter to close..."
