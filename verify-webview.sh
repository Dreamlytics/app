#!/bin/bash

# Verify WebView Setup - Test all components

echo "🔍 Verifying WebView Implementation..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

# Check if files exist
echo "📁 Checking files..."

files=(
  "pages/app.vue"
  "composables/useWebView.ts"
  "capacitor.config.ts"
  "WEBVIEW_SETUP.md"
  "WEBVIEW_QUICKSTART.md"
  "build-mobile.sh"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅ $file${NC}"
  else
    echo -e "${RED}❌ Missing: $file${NC}"
    ((ERRORS++))
  fi
done

echo ""

# Check if Capacitor packages are installed
echo "📦 Checking packages..."

packages=(
  "@capacitor/core"
  "@capacitor/cli"
  "@capacitor/ios"
  "@capacitor/android"
  "@capacitor/browser"
  "@capacitor/toast"
  "@ionic/vue"
  "ionicons"
)

for package in "${packages[@]}"; do
  if npm list "$package" &> /dev/null; then
    echo -e "${GREEN}✅ $package${NC}"
  else
    echo -e "${RED}❌ Missing: $package${NC}"
    ((ERRORS++))
  fi
done

echo ""

# Check if dev server is running
echo "🌐 Checking dev server..."

if curl -s http://localhost:3000 > /dev/null; then
  echo -e "${GREEN}✅ Dev server running on localhost:3000${NC}"
  
  # Check WebView page
  echo ""
  echo "🔍 Checking WebView page..."
  
  if curl -s http://localhost:3000/app > /dev/null; then
    echo -e "${GREEN}✅ WebView page accessible at /app${NC}"
  else
    echo -e "${RED}❌ WebView page not accessible${NC}"
    ((ERRORS++))
  fi
else
  echo -e "${YELLOW}⚠️  Dev server not running (run: npm run dev)${NC}"
  echo "   Skipping page checks..."
fi

echo ""

# Check TypeScript
echo "📝 Checking TypeScript..."

if npx tsc --noEmit --skipLibCheck 2>&1 | grep -q "error"; then
  echo -e "${RED}❌ TypeScript errors found${NC}"
  ((ERRORS++))
else
  echo -e "${GREEN}✅ No TypeScript errors${NC}"
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}🎉 All checks passed!${NC}"
  echo ""
  echo "✅ WebView feature is ready to use!"
  echo ""
  echo "Next steps:"
  echo "  1. Visit http://localhost:3000/app"
  echo "  2. Test in browser"
  echo "  3. Build for mobile: ./build-mobile.sh"
else
  echo -e "${RED}❌ Found $ERRORS error(s)${NC}"
  echo ""
  echo "Please fix the errors above"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Quick links
echo "📚 Documentation:"
echo "  - WEBVIEW_QUICKSTART.md (Start here!)"
echo "  - WEBVIEW_SETUP.md (Full docs)"
echo "  - WEBVIEW_IMPLEMENTATION_SUMMARY.md (Overview)"
echo ""

exit $ERRORS
