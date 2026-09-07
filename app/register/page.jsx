'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, Mail, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Register({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(searchParams);
  const chosenType = resolvedParams.type === 'programmer' ? 'programmer' : 'general';

  // State management for form inputs and loading feedback
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Create the user inside Supabase Auth system
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: chosenType,
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        // 2. Insert profile metadata into our public.profiles database table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
              user_type: chosenType,
              updated_at: new Date().toISOString(),
            },
          ]);

        if (profileError) throw profileError;

        setSuccessMsg('Registration successful! Check your email for a confirmation link.');
        
        // Clear form inputs
        setFullName('');
        setEmail('');
        setPassword('');
        
        // Redirect to dashboard or onboarding route after a small delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 p-8 rounded-2xl backdrop-blur-md shadow-2xl relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors mb-6 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to home
        </Link>

        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">Create your account</h2>
          <p className="text-sm text-slate-400">
            Setting up your path as a{' '}
            <span className={`font-semibold capitalize ${chosenType === 'programmer' ? 'text-indigo-400' : 'text-purple-400'}`}>
              {chosenType === 'programmer' ? 'Devcraft Engineer' : 'Standard Applicant'}
            </span>
          </p>
        </div>

        {/* Dynamic Status Notifications */}
        {errorMsg && (
          <div className="p-3.5 mb-5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 mb-5 rounded-xl border border-green-500/20 bg-green-500/5 text-xs text-green-400 font-medium leading-relaxed">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
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
            className={`w-full font-medium text-sm text-white py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
              chosenType === 'programmer' 
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10' 
                : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/10'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Processing Setup...
              </>
            ) : (
              'Register & Continue'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-slate-300 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
