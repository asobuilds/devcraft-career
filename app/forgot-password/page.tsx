'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Direct integration mapping call requesting automated password reset handshakes
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setMessage('✅ Reset instructions dispatched! Check your email inbox for the recovery link.');
      setEmail('');
    } catch (err: any) {
      setMessage('❌ Request failed: ' + (err.message || 'Unknown error occurred.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl relative z-10">
        
        <Link href="/login" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors mb-6">
          <ArrowLeft size={14} /> {"Back to login portal"}
        </Link>

        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">{"Recover Access Keys"}</h2>
          <p className="text-sm text-slate-400">{"Input your email to request a secure recovery pathway link."}</p>
        </div>

        {message && (
          <div className="p-3.5 mb-5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-medium text-slate-300 leading-relaxed">
            {message}
          </div>
        )}

        <form onSubmit={handleResetRequest} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{"Email Address"}</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-700"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full font-medium text-sm text-white py-3.5 rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Globe size={14} />}
            {loading ? 'Processing link...' : 'Generate Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
