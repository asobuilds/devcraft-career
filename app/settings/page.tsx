'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, ShieldAlert, KeyRound, Loader2 } from 'lucide-react';

export default function Settings() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- Update Password ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setUpdating(false);
    }
  };

  // --- Danger Zone: Purge Account ---
  const handlePurgeAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ Are you sure? This will permanently delete your profile and all associated data. This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      // 1. Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not retrieve user session.');

      // 2. Delete profile from public.profiles
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (deleteError) throw deleteError;

      // 3. Sign out and redirect home
      await supabase.auth.signOut();
      router.push('/');
    } catch (err: any) {
      alert('Error during account deletion: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl relative">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Account Configurations</h1>
        <p className="text-sm text-slate-400 mb-6">Manage your security and account settings.</p>

        {/* Password Update Form */}
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              New Password
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-slate-700"
                disabled={updating}
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full font-medium text-sm text-white py-3.5 rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {updating ? <Loader2 size={16} className="animate-spin" /> : null}
            {updating ? 'Updating...' : 'Update Password'}
          </button>

          {message && (
            <div
              className={`p-3 rounded-xl border text-xs ${
                message.type === 'success'
                  ? 'border-green-500/20 bg-green-500/5 text-green-400'
                  : 'border-red-500/20 bg-red-500/5 text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}
        </form>

        {/* Danger Zone */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2 mb-3">
            <ShieldAlert size={14} /> Danger Zone
          </h2>
          <button
            onClick={handlePurgeAccount}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-xs font-medium"
          >
            Purge My Cloud Presence
          </button>
          <p className="text-[10px] text-slate-500 mt-2">
            This will permanently delete your profile and all associated data. This action cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );
}