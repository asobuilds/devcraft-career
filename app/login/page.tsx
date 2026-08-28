'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, Mail, Loader2, Code2, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'github' | 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard` }
      });
      if (error) throw error;
    } catch (err: any) {
      alert('OAuth integration error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative">
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors mb-6">
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="text-sm text-slate-400">Sign in to manage your professional presence</p>
        </div>

        {errorMsg && <div className="p-3 mb-5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400">{errorMsg}</div>}

        {/* Social Logins Block */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button type="button" onClick={() => handleSocialSignIn('github')} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-900 transition-all">
            <Code2 size={14} /> GitHub
          </button>
          <button type="button" onClick={() => handleSocialSignIn('google')} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-900 transition-all">
            <Globe size={14} /> Google
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-600 text-[10px] uppercase font-bold tracking-wider">Or email login</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white" required disabled={loading} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white" required disabled={loading} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full font-medium text-sm text-white py-3.5 rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          New to the engine? <Link href="/register" className="text-slate-300 hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}