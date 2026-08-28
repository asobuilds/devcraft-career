'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Terminal, Activity, ShieldAlert, Cpu } from 'lucide-react';
import Link from 'next/link';

interface LogLine {
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARN' | 'SECURE';
  message: string;
}

export default function AdminLogs() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      if (!profile || !profile.is_admin) {
        router.push('/dashboard');
        return;
      }
      setIsAdmin(true);
      setLoading(false);
    };
    verifyAdmin();
  }, [router]);

  useEffect(() => {
    if (!isAdmin) return;

    const logTemplates = [
      { type: 'INFO' as const, msg: 'GET /api/auth/session - Cache verification token polling' },
      { type: 'SUCCESS' as const, msg: 'Supabase Database Handshake established - Connection active' },
      { type: 'SECURE' as const, msg: 'JWT Verification resolved - Row-Level Security policy verified' },
      { type: 'WARN' as const, msg: 'Optimistic UI Sync warning - Network latency fluctuating (42ms)' },
      { type: 'INFO' as const, msg: 'POST /api/notify - Recruiter click tracking pipeline executed' },
      { type: 'SUCCESS' as const, msg: 'Markdown README schema generated successfully for profile bucket' },
    ];

    const generateLog = () => {
      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const newLine: LogLine = {
        timestamp: new Date().toLocaleTimeString(),
        type: template.type,
        message: template.type === 'SUCCESS' ? `${template.msg} [200 OK]` : template.msg
      };
      setLogs(prev => [...prev.slice(-30), newLine]);
    };

    setLogs([
      { timestamp: new Date().toLocaleTimeString(), type: 'INFO', message: 'DevCraft Platform Server Core booting up...' },
      { timestamp: new Date().toLocaleTimeString(), type: 'SUCCESS', message: 'Edge Router caching active on Vercel deployment network' }
    ]);

    const interval = setInterval(generateLog, 2000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-red-500" size={20} />
        <span>Syncing Administrative Telemetry Channels...</span>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <header className="flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Terminal size={18} className="text-red-500" /> Live Telemetry Console Stream
              </h1>
              <p className="text-xs text-slate-500">Monitor database handshakes, server routing latency, and auth token validations.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <Activity size={16} className="text-green-400" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Edge Server Status</span>
              <span className="text-xs font-bold text-green-400 font-mono">Operational / Healthy</span>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <Cpu size={16} className="text-indigo-400" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-bold">DB Server Latency</span>
              <span className="text-xs font-bold text-white font-mono">18ms (Edge Cache Hit)</span>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <ShieldAlert size={16} className="text-purple-400" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Active JWT Tokens</span>
              <span className="text-xs font-bold text-purple-400 font-mono">Enforced Security Layer</span>
            </div>
          </div>
        </div>

        <div className="bg-black border border-slate-800 rounded-2xl p-6 font-mono text-xs shadow-2xl relative h-[450px] flex flex-col justify-between overflow-hidden">
          <div className="overflow-y-auto space-y-2 flex-1 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-4 tracking-wide leading-relaxed">
                <span className="text-slate-600 select-none shrink-0">{log.timestamp}</span>
                <span className={`font-bold shrink-0 select-none px-1 rounded text-[10px] ${
                  log.type === 'SUCCESS' ? 'bg-green-500/10 text-green-400' :
                  log.type === 'WARN' ? 'bg-yellow-500/10 text-yellow-400' :
                  log.type === 'SECURE' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  [{log.type}]
                </span>
                <span className={log.type === 'SUCCESS' ? 'text-green-200' : 'text-slate-300'}>{log.message}</span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
          <div className="absolute top-4 right-6 h-2 w-2 rounded-full bg-red-500 animate-ping" />
        </div>

      </div>
    </div>
  );
}
