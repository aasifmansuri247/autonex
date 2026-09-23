#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "          AutoNex Android APK Build Assistant             "
echo "=========================================================="

echo "📦 1. Building web application..."
npm run build

echo "⚡ 2. Installing Capacitor Android dependencies..."
npm install @capacitor/core @capacitor/cli @capacitor/android

echo "📱 3. Initializing Android project..."
npx cap init "AutoNex Client Portal" com.autonex.clientportal --web-dir dist || true
npx cap add android || true
npx cap sync android

echo "🔨 4. Compiling Android Debug APK via Gradle..."
cd android
./gradlew assembleDebug

echo "=========================================================="
echo "🎉 SUCCESS! Your Android APK is compiled and ready at:"
echo "   android/app/build/outputs/apk/debug/app-debug.apk      "
echo "=========================================================="
