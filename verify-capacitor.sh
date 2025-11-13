#!/bin/bash

echo "🔍 Verifying Ionic + Capacitor Setup..."
echo ""

# Check if required files exist
echo "📁 Checking configuration files..."
files=(
  "capacitor.config.ts"
  "plugins/ionic.ts"
  "composables/useCapacitor.ts"
  "assets/styles/ionic.css"
  "app.vue"
  "CAPACITOR_SETUP.md"
)

all_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (missing)"
    all_exist=false
  fi
done

echo ""
echo "📦 Checking installed packages..."
packages=(
  "@ionic/vue"
  "@ionic/vue-router"
  "ionicons"
  "@capacitor/core"
  "@capacitor/cli"
  "@capacitor/ios"
  "@capacitor/android"
  "@capacitor/splash-screen"
  "@capacitor/status-bar"
  "@capacitor/app"
  "@capacitor/keyboard"
  "@capacitor/haptics"
)

for package in "${packages[@]}"; do
  if npm list "$package" &> /dev/null; then
    echo "  ✅ $package"
  else
    echo "  ❌ $package (not installed)"
    all_exist=false
  fi
done

echo ""
if [ "$all_exist" = true ]; then
  echo "✅ All Ionic + Capacitor components are properly installed!"
  echo ""
  echo "🎉 Setup Complete! Next steps:"
  echo "  1. Visit http://localhost:3000/mobile-test to see Ionic components"
  echo "  2. Run 'npm run cap:add:ios' to add iOS platform"
  echo "  3. Run 'npm run cap:add:android' to add Android platform"
  echo "  4. Run 'npm run ios' or 'npm run android' to build for mobile"
  echo ""
  echo "📚 See CAPACITOR_SETUP.md for complete documentation"
else
  echo "⚠️  Some components are missing. Please review the setup."
fi
