'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert('Password criteria must evaluate to at least 6 characters.');
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      // Overwrite authentication access tokens directly via the recovered token session framework
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      setStatusMsg('✅ Password finalized successfully! Routing to your console terminal dashboard...');
      setNewPassword('');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2500);
    } catch (err: any) {
      setStatusMsg('❌ Update failure: ' + (err.message || 'Verification token expired.'));
    } {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl relative z-10">
        
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">{"Establish New Access Keys"}</h2>
          <p className="text-sm text-slate-400">{"Type your updated security credentials to lock your dashboard profile."}</p>
        </div>

        {statusMsg && (
          <div className="p-3.5 mb-5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-medium text-slate-300 leading-relaxed">
            {statusMsg}
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{"New Secure Password"}</label>
            <div className="relative">
              <Code2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full font-medium text-sm text-white py-3.5 rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={14} />}
            {'Finalize Security Keys'}
          </button>
        </form>
      </div>
    </div>
  );
}
