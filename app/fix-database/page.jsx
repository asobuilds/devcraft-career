'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Loader2, Sparkles, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function UniversalDatabaseFixer() {
  const [executing, setExecuting] = useState(false);
  const [outcomeMessage, setOutcomeMsg] = useState(null);

  const forceGlobalPremiumActivation = async () => {
    setExecuting(true);
    setOutcomeMsg(null);

    try {
      // 1. Fetch current active session user tokens directly from whichever database is live
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setOutcomeMsg("❌ Error: No authenticated session found. Please sign inside your dashboard page in another tab first, then refresh this fixer utility.");
        setExecuting(false);
        return;
      }

      // 2. FORCE OVERWRITE: Force populate your user row variables with premium attributes on the active project link
      const { error: patchError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          is_premium: true,
          show_dev_portfolio: true,
          show_cv_engine: true,
          system_theme: 'slate-black',
          avatar_url: 'https://unsplash.com',
          updated_at: new Date().toISOString()
        });

      if (patchError) throw patchError;

      setOutcomeMsg(`🎉 SUCCESS! Premium states, 5 layout variables, background switchboard parameters, and image slots are now forcefully activated directly inside Vercel's active database for account ID: ${user.id}`);

    } catch (err) {
      setOutcomeMsg("❌ System execution failure: " + err.message);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl text-center space-y-6">
        
        <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <ShieldCheck size={24} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Universal Schema Fixer Terminal</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This tool forces your active profile data states to premium with all toggles unlocked, running straight inside Vercel's database channel connection.
          </p>
        </div>

        {outcomeMessage && (
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono font-medium text-slate-300 text-justify leading-relaxed whitespace-pre-wrap">
            {outcomeMessage}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button 
            onClick={forceGlobalPremiumActivation} 
            disabled={executing}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-transparent shadow-md"
          >
            {executing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {"Execute Real-Time Core Override Hook"}
          </button>

          <Link href="/dashboard" className="w-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5">
            <LayoutDashboard size={14} /> Open Main Dashboard Workspace
          </Link>
        </div>

      </div>
    </div>
  );
}
