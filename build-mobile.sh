#!/bin/bash

# Build Dreamlytics for Mobile (iOS & Android)
# This script builds the Nuxt app and syncs with Capacitor

echo "🚀 Building Dreamlytics Mobile App..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ node_modules not found!${NC}"
    echo "Run: npm install"
    exit 1
fi

# Step 1: Clean previous build
echo -e "${YELLOW}📦 Cleaning previous build...${NC}"
rm -rf .output dist .nuxt

# Step 2: Build Nuxt app
echo -e "${YELLOW}🔨 Building Nuxt app...${NC}"
npm run generate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nuxt build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Nuxt build complete${NC}"
echo ""

# Step 3: Sync with Capacitor
echo -e "${YELLOW}📱 Syncing with Capacitor...${NC}"
npx cap sync

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Capacitor sync failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Capacitor sync complete${NC}"
echo ""

# Step 4: Show next steps
echo -e "${GREEN}🎉 Build complete!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "For iOS:"
echo "  npx cap open ios"
echo "  Then build in Xcode"
echo ""
echo "For Android:"
echo "  npx cap open android"
echo "  Then build in Android Studio"
echo ""
echo "Or run directly:"
echo "  npx cap run ios"
echo "  npx cap run android"
echo ""

# Optional: Ask to open IDE
read -p "Open iOS in Xcode? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx cap open ios
fi

read -p "Open Android in Android Studio? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx cap open android
fi

echo -e "${GREEN}✨ Done!${NC}"
