import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Terminal, Lock, User, Loader2 } from 'lucide-react';

export default function LoginView() {
  const login = useStore(state => state.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate('/loading');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-metallic-900 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-metallic-800 via-metallic-900 to-black text-slate-200">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 bg-metallic-800/40 backdrop-blur-xl border border-metallic-600/50 rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
            <span className="font-display font-black text-2xl text-metallic-900">SF</span>
          </div>
        </div>

        <h1 className="text-3xl font-display font-bold text-center text-slate-100 mb-2">
          Silver Finn
        </h1>
        <p className="text-sm text-center text-slate-400 mb-8 tracking-widest uppercase">
          Workshop Management System
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-sm">
            <Terminal size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email / ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-metallic-900/50 border border-metallic-600 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all placeholder-slate-600"
                placeholder="advisor@silverfinn.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-metallic-900/50 border border-metallic-600 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all placeholder-slate-600"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-gold-500 to-gold-600 text-metallic-900 font-bold py-3 rounded-lg hover:from-gold-400 hover:to-gold-500 focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-metallic-900 transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'SECURE LOGIN'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Protected by Silver Finn Vault Security</p>
          <p className="mt-1">Build v1.0.4-rc</p>
        </div>
      </div>
    </div>
  );
}
