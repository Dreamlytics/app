#!/bin/bash

echo "🌙 Starting Dreamlytics 2.0..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running!"
    echo "Please start MongoDB first:"
    echo "  brew services start mongodb-community"
    echo "  or"
    echo "  mongod --dbpath /path/to/data"
    echo ""
    exit 1
fi

echo "✅ MongoDB is running"
echo ""
echo "🚀 Starting Nuxt development server..."
echo ""

npm run dev
    