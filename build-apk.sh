#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "          AutoNex Android APK Build Assistant             "
echo "=========================================================="

echo "📦 1. Building web application with legacy WebView compatibility..."
npm run build

echo "⚡ 2. Installing Capacitor Android dependencies..."
npm install @capacitor/core@^7.0.0 @capacitor/cli@^7.0.0 @capacitor/android@^7.0.0 --legacy-peer-deps

echo "📱 3. Initializing Android project..."
if [ ! -d "android" ]; then
  npx cap add android
fi
npx cap sync android

echo "🔧 4. Resolving ListenableFuture & configuring Android settings..."
if [ -f "android/gradle.properties" ]; then
  grep -q "android.useAndroidX" android/gradle.properties || echo "android.useAndroidX=true" >> android/gradle.properties
  grep -q "android.enableJetifier" android/gradle.properties || echo "android.enableJetifier=true" >> android/gradle.properties
fi

if [ -f "android/app/build.gradle" ]; then
  cat << 'EOF' >> android/app/build.gradle

configurations.all {
    exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk7'
    exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk8'
}

dependencies {
    implementation 'androidx.concurrent:concurrent-futures:1.2.0'
    implementation 'com.google.guava:listenablefuture:1.0'
}
EOF
fi

MANIFEST="android/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST" ]; then
  sed -i 's/<manifest /<manifest xmlns:tools="http:\/\/schemas.android.com\/tools" /' "$MANIFEST" || true
  sed -i 's/<application/<application android:usesCleartextTraffic="true" android:requestLegacyExternalStorage="true"/' "$MANIFEST" || true
  sed -i 's/<\/application>/<provider android:name="androidx.startup.InitializationProvider" android:authorities="${applicationId}.androidx-startup" android:exported="false" tools:node="merge"><meta-data android:name="androidx.profileinstaller.ProfileInstallerInitializer" tools:node="remove" \/><\/provider><\/application>/' "$MANIFEST" || true
fi

echo "🔨 5. Compiling Android Debug APK via Gradle..."
cd android
chmod +x gradlew
./gradlew clean assembleDebug

echo "=========================================================="
echo "🎉 SUCCESS! Your Android APK is compiled and ready at:"
echo "   android/app/build/outputs/apk/debug/app-debug.apk      "
echo "=========================================================="
