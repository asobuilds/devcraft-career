'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, KeyRound, Loader2, Sparkles, CreditCard, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function AccountSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDev, setShowDev] = useState(true);
  const [showCV, setShowCV] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [bgTheme, setBgTheme] = useState('slate-black');

  useEffect(() => {
    const fetchUserSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
      setUserEmail(user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('show_dev_portfolio, show_cv_engine, is_premium, system_theme')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setShowDev(profile.show_dev_portfolio ?? true);
        setShowCV(profile.show_cv_engine ?? true);
        setIsPremium(profile.is_premium ?? false);
        setBgTheme(profile.system_theme || 'slate-black');
      }
      setLoading(false);
    };

    fetchUserSettings();
  }, [router]);

  const handleToggleView = async (field, currentValue) => {
    if (!userId) return;
    const nextValue = !currentValue;
    if (field === 'show_dev_portfolio') setShowDev(nextValue);
    if (field === 'show_cv_engine') setShowCV(nextValue);
    await supabase.from('profiles').update({ [field]: nextValue }).eq('id', userId);
  };

  const handleUpdateTheme = async (themeName) => {
    if (!userId) return;
    setBgTheme(themeName);
    await supabase.from('profiles').update({ system_theme: themeName }).eq('id', userId);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    setUpdating(true);
    setStatusMsg(null);

    const { error } = await supabase.auth.updateUser({ password: password });

    setUpdating(false);
    if (!error) {
      setStatusMsg('Success: password updated.');
      setPassword('');
    } else {
      setStatusMsg('Error: ' + error.message);
    }
  };

  const upgradeLink = 'https://paystack.shop/pay/kqrkkfueyh?email=' + encodeURIComponent(userEmail);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-indigo-500" size={20} />
        <span>Loading Account Configurations...</span>
      </div>
    );
  }

  const themeClasses =
    bgTheme === 'clean-white' ? 'bg-slate-50 text-slate-900 border-slate-200' :
    bgTheme === 'cyberpunk-navy' ? 'bg-slate-900 text-slate-100 border-slate-800' :
    'bg-slate-950 text-slate-100 border-slate-900';

  const cardClasses = bgTheme === 'clean-white' ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800';
  const labelClasses = bgTheme === 'clean-white' ? 'text-slate-600' : 'text-slate-400';
  return (
    <div className={`min-h-screen p-4 sm:p-6 flex items-center justify-center font-sans transition-colors duration-300 ${themeClasses}`}>
      <div className={`w-full max-w-lg border p-5 sm:p-8 rounded-2xl shadow-2xl space-y-6 ${cardClasses}`}>

        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <div>
          <h2 className="text-xl font-bold">Account Settings</h2>
          <p className="text-xs text-slate-500 mt-1">Manage your theme, workspace visibility, and login.</p>
        </div>

        {statusMsg && (
          <div className="p-3 text-xs font-medium rounded-xl border border-slate-800 bg-slate-950 text-slate-300">
            {statusMsg}
          </div>
        )}

        <div className="p-5 rounded-xl border space-y-3 bg-slate-950/20">
          <label className={`block text-[10px] font-bold uppercase tracking-wider ${labelClasses}`}>Background Theme</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button type="button" onClick={() => handleUpdateTheme('slate-black')} className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${bgTheme === 'slate-black' ? 'bg-slate-950 text-indigo-400 border-indigo-500/40 shadow' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
              Slate Black
            </button>
            <button type="button" onClick={() => handleUpdateTheme('clean-white')} className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${bgTheme === 'clean-white' ? 'bg-white text-indigo-600 border-indigo-500 shadow' : 'bg-white border-slate-300 text-slate-600'}`}>
              Clean White
            </button>
            <button type="button" onClick={() => handleUpdateTheme('cyberpunk-navy')} className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${bgTheme === 'cyberpunk-navy' ? 'bg-slate-900 text-indigo-400 border-indigo-500/40 shadow' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
              Cyberpunk Navy
            </button>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Sparkles size={14} /> Premium
            </div>
            <span className={`text-[9px] px-2.5 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider border ${isPremium ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
              {isPremium ? 'Premium Active' : 'Free Tier'}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-400">
            {isPremium
              ? 'Premium is active on your account. Automatic job lead sourcing, email alerts, PDF export, and printing are all unlocked.'
              : 'Upgrade to unlock automatic job lead sourcing across 11+ sources, email alerts, real PDF export, printing, and 2 extra templates.'}
          </p>

          {!isPremium && (
            <a
              href={upgradeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-transparent shadow-md"
            >
              <CreditCard size={14} /> Upgrade to Premium
            </a>
          )}
        </div>

        <div className="p-5 rounded-xl border bg-slate-950/20 space-y-4">
          <label className={`block text-[10px] font-bold uppercase tracking-wider ${labelClasses} border-b border-slate-800/60 pb-2`}>Toggle Workspace Views</label>

          <div className="flex items-center justify-between text-xs gap-3">
            <div className="space-y-0.5">
              <div className="font-bold flex items-center gap-1.5">Developer Portfolio Module</div>
              <p className="text-[11px] text-slate-500">Hide or show the portfolio builder workspace on your homepage.</p>
            </div>
            <button type="button" onClick={() => handleToggleView('show_dev_portfolio', showDev)} className="shrink-0">
              {showDev ? <ToggleRight size={24} className="text-indigo-500" /> : <ToggleLeft size={24} className="text-slate-500" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 gap-3">
            <div className="space-y-0.5">
              <div className="font-bold flex items-center gap-1.5">CV Builder</div>
              <p className="text-[11px] text-slate-500">Hide or show your resume editing workspace.</p>
            </div>
            <button type="button" onClick={() => handleToggleView('show_cv_engine', showCV)} className="shrink-0">
              {showCV ? <ToggleRight size={24} className="text-purple-500" /> : <ToggleLeft size={24} className="text-slate-500" />}
            </button>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Change Account Password</label>
          <div className="relative">
            <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type new secure credentials..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none"
              required
            />
          </div>
          <button type="submit" disabled={updating} className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 rounded-xl border border-slate-700 transition-all disabled:opacity-50">
            {updating ? 'Updating...' : 'Update Password'}
          </button>
        </form>

      </div>
    </div>
  );
}
