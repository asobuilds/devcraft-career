'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();

  // State management for credentials and feedback UI
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // Authenticate user against Supabase Auth records
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Redirect directly to the dashboard, where the role-switchboard will handle them
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid login credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative">
      {/* Visual background atmospheric balance glow elements */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 p-8 rounded-2xl backdrop-blur-md shadow-2xl relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors mb-6 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> {"Back to home"}
        </Link>

        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">{"Welcome back"}</h2>
          <p className="text-sm text-slate-400">{"Sign in to manage your professional presence"}</p>
        </div>

        {/* Status Error Notification Message Block */}
        {errorMsg && (
          <div className="p-3.5 mb-5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{"Email Address"}</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">{"Password"}</label>
            </div>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full font-medium text-sm text-white py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> {"Securing Connection..."}
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          {"New to the engine? "}
          <Link href="/register" className="text-slate-300 hover:underline">
            {"Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
