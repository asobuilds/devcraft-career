'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, ShieldAlert, KeyRound, Loader2, Sparkles, CreditCard, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function AccountSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showDev, setShowDev] = useState(true);
  const [showCV, setShowCV] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('show_dev_portfolio, show_cv_engine, is_premium, premium_until')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setShowDev(profile.show_dev_portfolio ?? true);
        setShowCV(profile.show_cv_engine ?? true);
        setIsPremium(profile.is_premium ?? false);
        setPremiumUntil(profile.premium_until);
      }
      setLoading(false);
    };

    fetchUserSettings();
  }, [router]);

  const handleToggleView = async (field: 'show_dev_portfolio' | 'show_cv_engine', currentValue: boolean) => {
    if (!userId) return;
    const nextValue = !currentValue;

    if (field === 'show_dev_portfolio') setShowDev(nextValue);
    if (field === 'show_cv_engine') setShowCV(nextValue);

    await supabase
      .from('profiles')
      .update({ [field]: nextValue })
      .eq('id', userId);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      alert('Password criteria must evaluate to at least 6 characters.');
      return;
    }

    setUpdating(true);
    setStatusMsg(null);

    const { error } = await supabase.auth.updateUser({ password: password });

    setUpdating(false);
    if (!error) {
      setStatusMsg('✅ Login access password modified securely.');
      setPassword('');
    } else {
      setStatusMsg('❌ Parameter modification failed: ' + error.message);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm('CRITICAL ACTION: Are you sure you want to permanently erase your profile and records from DevCraft cloud servers? This operation is irreversible.');
    if (!confirmation) return;

    if (userId) {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (!error) {
        await supabase.auth.signOut();
        router.push('/');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-indigo-500" size={20} />
        <span>Synchronizing User Profile Controls...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-lg bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl space-y-6">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">System Configurations Terminal</h2>
          <p className="text-xs text-slate-500">Regulate dashboard view visibility, subscriptions tiers, and login credential keys.</p>
        </div>

        {statusMsg && (
          <div className="p-3 text-xs font-medium rounded-xl border border-slate-800 bg-slate-950 text-slate-300">
            {statusMsg}
          </div>
        )}

        {/* 💳 NIGERIAN PAYSTACK PREMIUM MODULE */}
        <div className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Sparkles size={14} /> AI Job Hunter Radar Ecosystem
            </div>
            <span className={`text-[9px] px-2.5 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider border ${
              isPremium ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              {isPremium ? 'Premium Account Active' : 'Normal Free Tier'}
            </span>
          </div>
          
          <p className="text-xs text-slate-400 leading-relaxed">
            {isPremium 
              ? `Your premium features unlock is functional. Subscription remains valid until: ${new Date(premiumUntil!).toLocaleDateString()}. After 3 months, your account automatically reverts safely to normal tier.`
              : 'Unlock automated background web-scrapping job hunters. The platform will automatically scrape the internet for positions matching your toolsets, auto-inject them into your Tracker board, and notify you instantly.'}
          </p>

          {!isPremium && (
            <a 
              href="https://paystack.shop" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-transparent shadow-md shadow-indigo-600/10 mt-2"
            >
              <CreditCard size={14} /> Upgrade Account (📯 ₦1,500 / 3 Months)
            </a>
          )}
        </div>

        {/* INTERACTIVE VIEW SWITCH PANEL */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-2">Custom Dashboard View Toggles</label>
          
          <div className="flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                {showDev ? <Eye size={12} className="text-indigo-400" /> : <EyeOff size={12} className="text-slate-600" />} Programmer Portfolio Section
              </div>
              <p className="text-[11px] text-slate-500">Display the repository and README builder panels on your overview screen.</p>
            </div>
            <button type="button" onClick={() => handleToggleView('show_dev_portfolio', showDev)} className="text-slate-400 hover:text-white transition-colors">
              {showDev ? <ToggleRight size={24} className="text-indigo-500" /> : <ToggleLeft size={24} className="text-slate-600" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-900">
            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                {showCV ? <Eye size={12} className="text-purple-400" /> : <EyeOff size={12} className="text-slate-600" />} ATS-Optimized CV Engine
              </div>
              <p className="text-[11px] text-slate-500">Display your typographic curriculum entry utilities rows.</p>
            </div>
            <button type="button" onClick={() => handleToggleView('show_cv_engine', showCV)} className="text-slate-400 hover:text-white transition-colors">
              {showCV ? <ToggleRight size={24} className="text-purple-500" /> : <ToggleLeft size={24} className="text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Password Modifier Form */}
        <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Modify Account Password</label>
            <div className="relative">
              <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type new secure configuration lock..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-slate-700"
                required
              />
            </div>
          </div>
          <button type="submit" disabled={updating} className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 rounded-xl border border-slate-700 transition-all">
            {updating ? <Loader2 size={12} className="animate-spin inline mr-1" /> : null} Update Access Keys
          </button>
        </form>

        <div className="pt-4 border-t border-slate-900 space-y-2">
          <button onClick={handleDeleteAccount} className="w-full bg-red-950/20 hover:bg-red-950/50 text-red-400 text-xs font-semibold py-2.5 rounded-xl border border-red-900/30 transition-all">
            Purge My Cloud Presence
          </button>
        </div>

      </div>
    </div>
  );
}
