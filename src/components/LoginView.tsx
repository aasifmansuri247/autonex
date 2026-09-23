import React, { useState } from 'react';
import { Smartphone, Server, LogIn, Lock, Mail, ShieldAlert } from 'lucide-react';
import { loginApi, setSession } from '../services/api';

interface Props {
  onLoginSuccess: () => void;
  onOpenAndroidCenter: () => void;
  onOpenApiSettings: () => void;
  onToast: (msg: string) => void;
}

export const LoginView: React.FC<Props> = ({
  onLoginSuccess,
  onOpenAndroidCenter,
  onOpenApiSettings,
  onToast
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      onToast('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await loginApi(email.trim(), password);
      setSession(data.token, data.client_id, data.expires_at, email.trim());
      onToast('Welcome to AutoNex Client Portal!');
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      onToast(err.message || 'Unable to connect to AutoNex server');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('client@example.com');
    setPassword('••••••••');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 bg-gradient-to-b from-[#070b18] via-[#0d1325] to-[#070b18] relative">
      {/* Top right utility bar */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={onOpenAndroidCenter}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/50 transition shadow-sm"
        >
          <Smartphone className="w-3.5 h-3.5" />
          Android App / APK
        </button>
        <button
          onClick={onOpenApiSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#9aa7c2] bg-[#111a30] border border-[#24304a] hover:text-white transition"
          title="Server Connection Settings"
        >
          <Server className="w-3.5 h-3.5" />
          Host Settings
        </button>
      </div>

      <div className="w-full max-w-md bg-[#0d1325]/95 border border-[#24304a] rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <img
              src="/icon.svg"
              alt="AutoNex"
              className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(22,217,255,0.4)]"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Client Portal</h1>
          <p className="text-xs text-[#9aa7c2] mt-1">AI automation, simplified.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#cbd5e1] mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9aa7c2] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full bg-[#080d1b] border border-[#24304a] text-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:border-cyan-400 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#cbd5e1] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9aa7c2] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#080d1b] border border-[#24304a] text-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:border-cyan-400 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign in
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center space-y-2">
          <p className="text-[11px] text-[#9aa7c2]">
            Sign in with your AutoNex client account.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2 border-t border-[#1c2740]">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-[11px] text-cyan-400 hover:underline"
            >
              Fill Sample Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
