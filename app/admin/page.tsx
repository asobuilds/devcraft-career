'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ShieldCheck, Users, FileBarChart, Terminal as TermIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminTerminal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, devs: 0, general: 0 });

  useEffect(() => {
    const verifyAdminAuthorization = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.is_admin) {
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);

      const { data: allUsers } = await supabase.from('profiles').select('*');
      
      if (allUsers) {
        setSystemUsers(allUsers);
        const devs = allUsers.filter(u => u.user_type === 'programmer').length;
        setStats({
          totalUsers: allUsers.length,
          devs: devs,
          general: allUsers.length - devs
        });
      }
      setLoading(false);
    };

    verifyAdminAuthorization();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-red-500" size={20} />
        <span>Authenticating Global Admin Access Lock...</span>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Admin Header Bar */}
        <header className="border-b border-red-950/40 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <ShieldCheck className="text-red-500" size={22} /> Root Platform Admin Control Node
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Regulate system account metrics, data loads, and global deployment tables.</p>
            </div>
          </div>
          <Link href="/admin/logs" className="text-xs bg-red-950/20 border border-red-900/30 text-red-400 px-3 py-1.5 rounded-xl uppercase font-mono font-bold tracking-wider hover:bg-red-950/40 transition-all flex items-center gap-1.5">
            <TermIcon size={12} /> Open Live System Telemetry
          </Link>
        </header>

        {/* Global Analytics Overview Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center"><Users size={20} /></div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Total Registrations</span>
              <span className="text-2xl font-black font-mono text-white mt-0.5 block">{stats.totalUsers}</span>
            </div>
          </div>
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center"><TermIcon size={20} /></div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Programmer Portfolios</span>
              <span className="text-2xl font-black font-mono text-white mt-0.5 block">{stats.devs}</span>
            </div>
          </div>
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center"><FileBarChart size={20} /></div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Standard CV Blueprints</span>
              <span className="text-2xl font-black font-mono text-white mt-0.5 block">{stats.general}</span>
            </div>
          </div>
        </div>

        {/* Registered Users Directory */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Registered Platform Users Identity Directory</h3>
          <div className="overflow-x-auto border border-slate-900 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">User ID Node</th>
                  <th className="p-4">Full Identity Name</th>
                  <th className="p-4">Account Strategy Track</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 bg-slate-900/10">
                {systemUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-950/40 transition-colors text-slate-300">
                    <td className="p-4 font-mono text-[11px] text-slate-500 truncate max-w-[120px]">{user.id}</td>
                    <td className="p-4 font-bold text-white">{user.full_name || "Anonymous Applicant"}</td>
                    <td className="p-4 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        user.user_type === 'programmer' ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400' : 'bg-purple-500/5 border-purple-500/20 text-purple-400'
                      }`}>
                        {user.user_type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
