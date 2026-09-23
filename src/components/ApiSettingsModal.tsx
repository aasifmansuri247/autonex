import React, { useState } from 'react';
import { Settings, Server, Check, Wifi, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { DEFAULT_API_BASE, getApiBaseUrl, setApiBaseUrl, isDemoModeEnabled, setDemoModeEnabled, pingApiServer } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
  onConfigChanged: () => void;
}

export const ApiSettingsModal: React.FC<Props> = ({ isOpen, onClose, onToast, onConfigChanged }) => {
  const [baseUrl, setBaseUrlState] = useState<string>(getApiBaseUrl());
  const [demoMode, setDemoModeState] = useState<boolean>(isDemoModeEnabled());
  const [testingPing, setTestingPing] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiBaseUrl(baseUrl);
    setDemoModeEnabled(demoMode);
    onToast('API server settings saved successfully!');
    onConfigChanged();
    onClose();
  };

  const handleTestConnection = async () => {
    setTestingPing(true);
    setPingResult(null);
    try {
      const reachable = await pingApiServer(baseUrl);
      if (reachable) {
        setPingResult({
          success: true,
          message: 'Connection successful! Webhook endpoint reached.'
        });
      } else {
        setPingResult({
          success: false,
          message: `Unable to connect to ${baseUrl}. Check Wi-Fi subnet or tunnel URL.`
        });
      }
    } catch (e: any) {
      setPingResult({
        success: false,
        message: e.message || 'Connection failed.'
      });
    } finally {
      setTestingPing(false);
    }
  };

  const handleReset = () => {
    setBaseUrlState(DEFAULT_API_BASE);
    setDemoModeState(false);
    setPingResult(null);
    onToast('Reset to default n8n host.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0c1324] border border-[#24304a] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c2740] bg-[#0d1426]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#111a30] border border-[#24304a] flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AutoNex Backend Connection</h3>
              <p className="text-xs text-[#9aa7c2]">Configure n8n webhook server and connection mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9aa7c2] hover:text-white text-2xl leading-none w-8 h-8 rounded-lg hover:bg-[#1a253d] transition flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-[#cbd5e1] mb-2">
              Webhook Base URL (n8n Host)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => {
                  setBaseUrlState(e.target.value);
                  setPingResult(null);
                }}
                placeholder="http://192.168.43.134:5678"
                className="flex-1 bg-[#080d1b] border border-[#24304a] text-white text-xs font-mono rounded-xl px-3.5 py-2.5 focus:border-cyan-400 outline-none transition"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingPing}
                className="px-3.5 py-2.5 bg-[#121b31] border border-[#24304a] hover:border-cyan-500/50 rounded-xl text-xs font-semibold text-white transition flex items-center gap-1.5 shrink-0"
              >
                {testingPing ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Wifi className="w-3.5 h-3.5 text-cyan-400" />}
                Test
              </button>
            </div>
            <p className="text-[11px] text-[#9aa7c2] mt-1.5 leading-relaxed">
              Default is <code className="text-cyan-300">http://192.168.43.134:5678</code>. If your phone or tablet is outside your local Wi-Fi, you can set your public n8n URL or ngrok domain here.
            </p>
          </div>

          {pingResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                pingResult.success
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              {pingResult.success ? (
                <Check className="w-4 h-4 mt-0.5 shrink-0 text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
              )}
              <div className="leading-relaxed">{pingResult.message}</div>
            </div>
          )}

          {/* Demo Mode Toggle */}
          <div className="p-4 rounded-xl bg-[#080d1b] border border-[#24304a] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-white">Preview / Standalone Mode</span>
              </div>
              <button
                type="button"
                onClick={() => setDemoModeState(!demoMode)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  demoMode ? 'bg-purple-600' : 'bg-[#1e293b]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    demoMode ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-[#9aa7c2] leading-relaxed">
              Enable this if you want to test and demonstrate all AutoNex features (generating posts, approving, zoom review, updating offers) without needing an active live n8n backend connection.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1c2740] bg-[#0d1426] flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-[#9aa7c2] hover:text-white transition"
          >
            Reset to default
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9aa7c2] hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md shadow-blue-500/20 transition"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
