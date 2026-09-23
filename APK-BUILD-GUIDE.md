# AutoNex Client Portal - Android APK Build Guide

This repository is configured with an automated **GitHub Actions CI/CD workflow** (`.github/workflows/build-apk.yml`) to automatically compile and export your Android `.apk` package.

---

## 🚀 How to Download Your APK from GitHub

1. **Push your code or Trigger Workflow**:
   - The workflow triggers automatically whenever code is pushed to `main` or `master`.
   - You can also run it manually from the **Actions** tab on GitHub:
     - Go to your repository on GitHub.
     - Click **Actions** in top tab.
     - Select **Build Android APK** from left sidebar.
     - Click **Run workflow** -> select branch -> **Run workflow**.

2. **Download the Compiled APK**:
   - Once the action finishes with a green checkmark (usually takes 2-3 minutes):
   - Click on the completed workflow run.
   - Scroll down to the **Artifacts** section at the bottom.
   - Click on **AutoNex-Client-Portal-debug-apk** to download the ZIP containing `app-debug.apk`.

3. **Install on Android Phone**:
   - Transfer `app-debug.apk` to your phone (via USB, Google Drive, WhatsApp, Telegram, or direct download).
   - Tap the APK file and select **Install** (allow installation from unknown sources if prompted).

---

## 🛠️ Local Build (Optional)
If you also want to build locally on your machine:
```bash
chmod +x build-apk.sh
./build-apk.sh
```
The compiled APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`
