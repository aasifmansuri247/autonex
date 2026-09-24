import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle, ExternalLink, QrCode, Terminal, Copy, Check, ShieldCheck, Cpu, GitBranch, Github, PlayCircle, FileCode } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const AndroidCenterModal: React.FC<Props> = ({ isOpen, onClose, onToast }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'github' | 'build' | 'qr'>('install');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentAppUrl = window.location.origin;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    onToast('Copied command to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadCapacitorConfig = () => {
    const config = {
      appId: 'com.autonex.clientportal',
      appName: 'AutoNex Client Portal',
      webDir: 'dist',
      server: {
        androidScheme: 'https',
        cleartext: true
      },
      android: {
        allowMixedContent: true
      }
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'capacitor.config.json';
    a.click();
    URL.revokeObjectURL(url);
    onToast('Downloaded capacitor.config.json!');
  };

  const downloadApkBuildScript = () => {
    const script = `#!/bin/bash
# AutoNex Android APK Builder Script
echo "========================================="
echo "   AutoNex Android APK Build Helper      "
echo "========================================="

# 1. Build web distribution
echo "1. Building production web assets..."
npm run build

# 2. Install Capacitor if needed
echo "2. Initializing Capacitor Android..."
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "AutoNex Client Portal" com.autonex.clientportal --web-dir dist

# 3. Add Android platform
echo "3. Adding Android platform..."
npx cap add android
npx cap sync android

# 4. Build APK with Gradle
echo "4. Compiling Android APK..."
cd android
./gradlew assembleDebug

echo "========================================="
echo "✅ SUCCESS! APK generated at:"
echo "android/app/build/outputs/apk/debug/app-debug.apk"
echo "You can now install app-debug.apk directly onto your Android device!"
echo "========================================="
`;
    const blob = new Blob([script], { type: 'application/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-android-apk.sh';
    a.click();
    URL.revokeObjectURL(url);
    onToast('Downloaded build-android-apk.sh!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c1324] border border-[#24304a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c2740] bg-[#0d1426]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Android APK & Mobile App
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Native Ready
                </span>
              </h3>
              <p className="text-xs text-[#9aa7c2]">
                Install directly on Android or compile to a standalone .apk package
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9aa7c2] hover:text-white text-2xl leading-none w-8 h-8 rounded-lg hover:bg-[#1a253d] transition flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1c2740] bg-[#080d1b] px-4 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('install')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'install'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-[#9aa7c2] hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            1-Click Android WebAPK
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'github'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-[#9aa7c2] hover:text-white'
            }`}
          >
            <Github className="w-4 h-4 text-purple-400" />
            GitHub APK Workflow
          </button>
          <button
            onClick={() => setActiveTab('build')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'build'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-[#9aa7c2] hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Local Build CLI
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'qr'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-[#9aa7c2] hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Scan on Phone
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-blue-950/40 to-[#0c1324] border border-purple-500/30">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-white text-base mb-1 flex items-center gap-2">
                      <Github className="w-5 h-5 text-purple-400" />
                      Automatic GitHub Actions APK Build
                    </h4>
                    <p className="text-xs text-[#9aa7c2] leading-relaxed">
                      Every time you push code to GitHub, our workflow (<code className="text-cyan-300">.github/workflows/build-apk.yml</code>) automatically compiles a standalone Android APK and attaches it as a downloadable artifact.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold text-[#67e8f9] uppercase tracking-wider">
                  How to download your compiled APK from GitHub:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#080d1b] border border-[#24304a] space-y-1">
                    <div className="text-purple-400 font-bold text-xs flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5" /> 1. Push or Trigger
                    </div>
                    <p className="text-xs text-[#cbd5e1]">
                      Push changes to <code className="text-cyan-300 font-mono text-[11px]">main</code> or go to your GitHub repo &gt; <strong>Actions</strong> &gt; <strong>Build Android APK</strong> &gt; <strong>Run workflow</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#080d1b] border border-[#24304a] space-y-1">
                    <div className="text-cyan-400 font-bold text-xs flex items-center gap-1.5">
                      <PlayCircle className="w-3.5 h-3.5" /> 2. Workflow Runs (~2m)
                    </div>
                    <p className="text-xs text-[#cbd5e1]">
                      GitHub Actions installs Node, Java 21, Android SDK, runs Capacitor sync, and invokes <code className="text-cyan-300 font-mono text-[11px]">./gradlew assembleDebug</code>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#080d1b] border border-[#24304a] space-y-1">
                    <div className="text-green-400 font-bold text-xs flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> 3. Download Artifact
                    </div>
                    <p className="text-xs text-[#cbd5e1]">
                      Open the finished run, scroll down to <strong>Artifacts</strong>, and click <strong>AutoNex-Client-Portal-debug-apk</strong> to download your <code className="text-green-300 font-mono text-[11px]">app-debug.apk</code>!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#080d1b] border border-[#24304a] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    Workflow File: <code className="text-cyan-300">.github/workflows/build-apk.yml</code>
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `name: Build Android APK\n\non:\n  push:\n    branches: [ main, master ]\n  pull_request:\n    branches: [ main, master ]\n  workflow_dispatch:\n\njobs:\n  build-apk:\n    name: Build Android APK\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - uses: actions/setup-java@v4\n        with:\n          distribution: 'zulu'\n          java-version: '21'\n      - run: yes | sdkmanager --licenses || true\n      - run: npm install --legacy-peer-deps\n      - run: npm install --save @capacitor/core @capacitor/cli @capacitor/android --legacy-peer-deps\n      - run: npm run build\n      - run: npx cap add android || true\n      - run: npx cap sync android\n      - run: cd android && ./gradlew assembleDebug --no-daemon\n      - uses: actions/upload-artifact@v4\n        with:\n          name: AutoNex-Client-Portal-debug-apk\n          path: android/app/build/outputs/apk/debug/*.apk`,
                        5
                      )
                    }
                    className="text-cyan-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedIndex === 5 ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy YAML
                  </button>
                </div>
                <p className="text-xs text-[#9aa7c2]">
                  This workflow is already saved in your repository and ready to run as soon as you push!
                </p>
              </div>
            </div>
          )}
          {activeTab === 'install' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-purple-950/40 border border-blue-500/20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-white text-base mb-1">
                      Direct Android Installation (WebAPK)
                    </h4>
                    <p className="text-xs text-[#9aa7c2] leading-relaxed">
                      Android devices (Chrome, Edge, Samsung Internet) automatically generate and install a certified native Android APK package directly to your phone's app drawer with custom icon, splash screen, and offline cache.
                    </p>
                  </div>
                  {isInstalled ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 text-xs font-medium shrink-0">
                      <CheckCircle className="w-4 h-4" /> Installed
                    </div>
                  ) : (
                    <button
                      onClick={async () => {
                        if (isInstallable) {
                          const res = await install();
                          if (res) onToast('Android App installed successfully! 🎉');
                        } else {
                          onToast('Open this URL in Chrome on your Android phone to install with 1 tap!');
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 flex items-center gap-2 transition shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      {isInstallable ? 'Install Now on Android' : 'Install App'}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold text-[#67e8f9] uppercase tracking-wider">
                  How to install on any Android phone:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#080d1b] border border-[#24304a]">
                    <div className="text-cyan-400 font-bold text-sm mb-1">Step 1</div>
                    <p className="text-xs text-[#cbd5e1]">
                      Open this web application in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your Android device.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#080d1b] border border-[#24304a]">
                    <div className="text-cyan-400 font-bold text-sm mb-1">Step 2</div>
                    <p className="text-xs text-[#cbd5e1]">
                      Tap the prompt banner at the top/bottom or tap Chrome's three dots <strong>(⋮)</strong> menu.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#080d1b] border border-[#24304a]">
                    <div className="text-cyan-400 font-bold text-sm mb-1">Step 3</div>
                    <p className="text-xs text-[#cbd5e1]">
                      Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. Android will compile and place the native app on your home screen!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#080d1b] border border-[#24304a] space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  What you get with Android WebAPK:
                </div>
                <ul className="text-xs text-[#9aa7c2] space-y-1.5 list-disc pl-4">
                  <li>Full standalone screen without browser URL bars or navigation clutter.</li>
                  <li>Deep Android integration (appears in Android Settings, App Drawer, and Task Switcher).</li>
                  <li>Offline support via registered Service Worker caching all core dashboard assets.</li>
                  <li>Full camera and file gallery access for uploading product images.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'build' && (
            <div className="space-y-4">
              <p className="text-xs text-[#cbd5e1]">
                If you need a standalone <strong>.apk</strong> or <strong>.aab</strong> file to upload to the Google Play Store or distribute via sideloading (USB / WhatsApp / Telegram), you can build it in 2 minutes using Capacitor or Google Bubblewrap:
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    Option 1: Capacitor Android CLI (Recommended)
                  </span>
                  <button
                    onClick={downloadApkBuildScript}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Build Script (.sh)
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#050813] border border-[#1c2740] font-mono text-xs text-[#cbd5e1] space-y-2">
                  <div className="flex items-center justify-between text-[#9aa7c2] pb-1 border-b border-[#1c2740]">
                    <span>Run in project root:</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `npm run build\nnpm i @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init "AutoNex" com.autonex.portal --web-dir dist\nnpx cap add android\nnpx cap sync\ncd android && ./gradlew assembleDebug`,
                          1
                        )
                      }
                      className="hover:text-white flex items-center gap-1"
                    >
                      {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy commands
                    </button>
                  </div>
                  <p className="text-cyan-400"># 1. Build app and init Capacitor</p>
                  <p>npm run build</p>
                  <p>npm install @capacitor/core @capacitor/cli @capacitor/android</p>
                  <p>npx cap init "AutoNex" com.autonex.portal --web-dir dist</p>
                  <p className="text-cyan-400"># 2. Add Android & Build APK</p>
                  <p>npx cap add android</p>
                  <p>cd android && ./gradlew assembleDebug</p>
                  <p className="text-green-400"># Result: android/app/build/outputs/apk/debug/app-debug.apk</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={downloadCapacitorConfig}
                    className="flex-1 py-2 px-3 rounded-lg border border-[#24304a] bg-[#0d1426] hover:bg-[#121b31] text-xs text-white font-medium flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" /> Download capacitor.config.json
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#1c2740]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    Option 2: Google Bubblewrap (Zero Native Code)
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#050813] border border-[#1c2740] font-mono text-xs text-[#cbd5e1] space-y-1">
                  <p className="text-[#9aa7c2]"># Uses Google's official Trusted Web Activity tool:</p>
                  <p>npm i -g @bubblewrap/cli</p>
                  <p>bubblewrap init --manifest {currentAppUrl}/manifest.webmanifest</p>
                  <p>bubblewrap build</p>
                  <p className="text-green-400"># Outputs signed app-release-signed.apk!</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto w-48 h-48 bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentAppUrl)}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-semibold text-white text-base">Scan with your Android camera</h4>
                <p className="text-xs text-[#9aa7c2] mt-1 max-w-sm mx-auto">
                  Scan this code on your Android device to open AutoNex directly in mobile browser, then tap "Install App" to get the native APK experience.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#080d1b] border border-[#24304a] text-xs font-mono text-[#cbd5e1] max-w-md mx-auto break-all flex items-center justify-between gap-2 px-3">
                <span className="truncate">{currentAppUrl}</span>
                <button
                  onClick={() => copyToClipboard(currentAppUrl, 2)}
                  className="p-1 hover:text-white shrink-0"
                  title="Copy URL"
                >
                  {copiedIndex === 2 ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#1c2740] bg-[#0d1426] flex items-center justify-between">
          <div className="text-xs text-[#9aa7c2] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Android 8.0+ & WebAPK Supported
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#121b31] border border-[#24304a] text-white hover:border-[#49618c] transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
