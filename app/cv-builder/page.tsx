'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ArrowLeft, Printer, Plus, Trash2, Loader2, Download, Layers, Sparkles, Briefcase, Eye, X, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import JobMatchesPanel from '@/app/components/jobs/JobMatchesPanel';
import AIAssistant from '@/app/components/AIAssistant';

import TemplateMinimalist from './components/TemplateMinimalist';
import TemplateModernIndigo from './components/TemplateModernIndigo';
import TemplateExecutiveSlate from './components/TemplateExecutiveSlate';
import TemplateCreativeTeal from './components/TemplateCreativeTeal';
import TemplateCompactEuro from './components/TemplateCompactEuro';
import TemplateLagosCorporate from './components/TemplateLagosCorporate';
import TemplateTechStack from './components/TemplateTechStack';
import TemplateGraduate from './components/TemplateGraduate';
import ProfilePhotoUploader from './components/ProfilePhotoUploader';
import AIInterviewGuide from './components/AIInterviewGuide';
import CertificateUploader from './components/CertificateUploader';
import PdfDocumentRouter from './components/PdfDocumentRouter';

interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  dates: string;
  bullets: string;
}

interface GuideResult {
  fullName: string;
  email: string;
  phone: string;
  website: string;
  skills: string;
  summary: string;
  experience: ExperienceItem[];
}

export default function CVBuilder() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [allowPhoto, setAllowPhoto] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<Record<string, unknown>[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const [resumeTitle, setResumeTitle] = useState('My Professional CV');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState<ExperienceItem[]>([
    { id: '1', company: '', role: '', dates: '', bullets: '' },
  ]);
  const [theme, setTheme] = useState<string>('modern-indigo');
  const [activeView, setActiveView] = useState<'preview' | 'jobs'>('preview');
  const [jobDescription, setJobDescription] = useState('');
  const [isMockData, setIsMockData] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  const techStack = useMemo(
    () => skills.split(',').map((skill) => skill.trim()).filter(Boolean),
    [skills],
  );

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      try {
        const { data: profile } = await supabase.from('profiles').select('full_name, email, phone, website').eq('id', user.id).maybeSingle();
        if (profile) {
          setFullName(profile.full_name || '');
          setEmail(profile.email || '');
          setPhone(profile.phone || '');
          setWebsite(profile.website || '');
        }

        const { data: cv } = await supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (cv) {
          setResumeId(cv.id);
          setResumeTitle(cv.resume_title || 'My Professional CV');
          setSummary(cv.summary || '');
          setSkills(cv.skills ? cv.skills.join(', ') : '');
          setTheme(cv.active_template || 'modern-indigo');
          setExperience(Array.isArray(cv.experience) && cv.experience.length > 0 ? (cv.experience as ExperienceItem[]) : [{ id: '1', company: '', role: '', dates: '', bullets: '' }]);
          setAttachments(Array.isArray(cv.attachments) ? cv.attachments : []);
        }
      } catch {
        setToast({ type: 'error', message: 'Failed to load your data. Please refresh the page.' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  useEffect(() => {
    const handleAiUpdate = async (event: Event) => {
      const detail = (event as CustomEvent<{ toolNames?: string[] }>).detail;
      if (!detail?.toolNames?.includes('tailorCvToJob')) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cv } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cv) return;

      setResumeId(cv.id);
      setSummary(cv.summary || '');
      setSkills(Array.isArray(cv.skills) ? cv.skills.join(', ') : '');
      setExperience(
        Array.isArray(cv.experience) && cv.experience.length > 0
          ? (cv.experience as ExperienceItem[])
          : [{ id: '1', company: '', role: '', dates: '', bullets: '' }]
      );
      setToast({ type: 'success', message: 'CV tailored to the job description.' });
    };

    window.addEventListener('ai-data-updated', handleAiUpdate);
    return () => window.removeEventListener('ai-data-updated', handleAiUpdate);
  }, []);

  const handleAddExperience = () => {
    setExperience([...experience, { id: Date.now().toString(), company: '', role: '', dates: '', bullets: '' }]);
  };

  const handleRemoveExperience = (id: string) => {
    if (experience.length === 1) return;
    setExperience(experience.filter((exp) => exp.id !== id));
  };

  const handleExperienceChange = (id: string, field: keyof ExperienceItem, value: string) => {
    setExperience(experience.map((exp) => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const exportJSONBackup = () => {
    const backupPayload = { profile: { fullName, email, phone, website }, resume: { summary, skills, experience, theme } };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeTitle.toLowerCase().replace(/\s+/g, '-')}-backup.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleThemeChange = (selected: string) => {
    setTheme(selected);
  };

  const handleGuideComplete = (data: GuideResult) => {
    setFullName(data.fullName);
    setEmail(data.email);
    setPhone(data.phone);
    setWebsite(data.website);
    setSkills(data.skills);
    setSummary(data.summary);
    setExperience(data.experience);
    setShowGuide(false);
  };

  const handleSave = async () => {
    if (!userId) return;

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      setToast({ type: 'error', message: 'Session expired. Please log in again and save.' });
      return;
    }

    setSaving(true);
    setToast(null);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            full_name: fullName,
            email,
            phone,
            website,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (profileError) {
        setToast({ type: 'error', message: 'Could not save profile: ' + profileError.message });
        return;
      }

      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const resumePayload = {
        id: resumeId ?? undefined,
        user_id: userId,
        resume_title: resumeTitle,
        summary,
        skills: skillsArray,
        experience,
        active_template: theme,
        attachments,
        updated_at: new Date().toISOString(),
      };

      const { data: savedResume, error: resumeError } = await supabase
        .from('resumes')
        .upsert(resumePayload, { onConflict: 'id' })
        .select('id')
        .maybeSingle();

      if (resumeError) {
        setToast({ type: 'error', message: 'Could not save CV: ' + resumeError.message });
        return;
      }

      if (savedResume?.id) {
        setResumeId(savedResume.id);
      }

      setToast({ type: 'success', message: 'Document saved successfully!' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setToast({ type: 'error', message: 'Server database error: ' + message });
    } finally {
      setSaving(false);
    }
  };

  const MOCK_DATA = {
    fullName: 'Chinedu Okafor',
    email: 'chinedu.okafor@example.com',
    phone: '+2348012345678',
    website: 'chinedu-dev',
    summary:
      'Results-driven Full-Stack Developer with 5+ years of experience building scalable web applications for Nigerian and international startups. Proficient in React, Node.js, and cloud infrastructure. Passionate about clean code, accessibility, and shipping products that solve real problems.',
    skills: 'React, TypeScript, Node.js, Next.js, PostgreSQL, Docker, AWS, Tailwind CSS, Python',
    experience: [
      {
        id: 'mock-1',
        company: 'Flutterwave (Contract)',
        role: 'Full-Stack Developer',
        dates: '2023 — Present',
        bullets:
          'Built a Paystack-like payment gateway clone with React, Node.js, and PostgreSQL, processing over 500 test transactions per day.\nReduced checkout latency by 40% by optimizing database queries and introducing Redis caching.\nCollaborated with design and product teams to ship a mobile-responsive dashboard used by 2,000+ merchants.',
      },
      {
        id: 'mock-2',
        company: 'Andela',
        role: 'Frontend Engineer',
        dates: '2021 — 2023',
        bullets:
          'Developed reusable React component library adopted by 5 internal teams, cutting feature build time by 30%.\nImplemented end-to-end testing with Cypress, increasing test coverage from 45% to 85%.\nMentored 3 junior engineers through weekly code reviews and pairing sessions.',
      },
      {
        id: 'mock-3',
        company: 'Lagos Tech Hub',
        role: 'Software Engineering Intern',
        dates: '2020 — 2021',
        bullets:
          'Designed and launched a volunteer management platform with Express, React, and Firebase, serving 1,200 users.\nAutomated weekly impact reports using Python scripts and Google Sheets API.',
      },
    ] as ExperienceItem[],
  };

  const previewFullName = isMockData ? MOCK_DATA.fullName : fullName;
  const previewEmail = isMockData ? MOCK_DATA.email : email;
  const previewPhone = isMockData ? MOCK_DATA.phone : phone;
  const previewWebsite = isMockData ? MOCK_DATA.website : website;
  const previewSummary = isMockData ? MOCK_DATA.summary : summary;
  const previewSkills = isMockData ? MOCK_DATA.skills : skills;
  const previewExperience = isMockData ? MOCK_DATA.experience : experience;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-900 animate-pulse" />
            <div className="h-4 w-40 bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-8 w-24 bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-8 w-28 bg-purple-700/30 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto grid lg:grid-cols-2 min-h-[calc(100vh-65px)]">
          <div className="p-6 md:p-10 border-r border-slate-900 space-y-8 overflow-y-auto max-h-[calc(100vh-70px)]">
            <div className="h-10 w-full bg-slate-800/60 rounded-xl animate-pulse" />
            <div className="grid sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-24 bg-slate-800 rounded animate-pulse" />
                  <div className="h-10 w-full bg-slate-800/60 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-3 w-48 bg-slate-800 rounded animate-pulse" />
              <div className="h-20 w-full bg-slate-800/60 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-40 bg-slate-800 rounded animate-pulse" />
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 w-full bg-slate-800/40 rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-3 w-56 bg-slate-800 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-800/60 rounded-xl animate-pulse" />
            </div>
            <div className="h-20 w-full bg-slate-800/40 rounded-xl animate-pulse" />
          </div>
          <div className="p-6 md:p-12 bg-slate-900/10 flex items-start justify-center overflow-y-auto max-h-[calc(100vh-70px)]">
            <div className="w-full max-w-sm bg-slate-800/30 border border-slate-800 rounded-2xl p-8 space-y-4 animate-pulse">
              <div className="h-6 w-3/4 bg-slate-800 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-slate-800 rounded animate-pulse" />
              <div className="h-16 w-full bg-slate-800/60 rounded-xl animate-pulse" />
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-4/6 bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 print:bg-white print:text-black">

      {toast && (
        <div className={`fixed top-4 right-4 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-xs font-medium max-w-sm transition-all ${toast.type === 'success' ? 'bg-green-950/90 border-green-500/30 text-green-300' : toast.type === 'error' ? 'bg-red-950/90 border-red-500/30 text-red-300' : 'bg-indigo-950/90 border-indigo-500/30 text-indigo-300'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={14} /> : toast.type === 'error' ? <AlertCircle size={14} /> : <Sparkles size={14} />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 transition-opacity">
            <X size={12} />
          </button>
        </div>
      )}

      {showGuide ? (
        <AIInterviewGuide onClose={() => setShowGuide(false)} onComplete={handleGuideComplete} />
      ) : null}

      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800">
            <ArrowLeft size={16} />
          </Link>
          <input type="text" value={resumeTitle} onChange={(e) => setResumeTitle(e.target.value)} className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-purple-500 font-bold text-sm text-white px-2 py-1 focus:outline-none" />
        </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs">
              <Layers size={12} className="text-slate-500 mr-2" />
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer"
              >
                <option value="modern-indigo">Template: Silicon Tech Indigo</option>
                <option value="minimalist">Template: Civil Service Minimalist</option>
                <option value="executive-slate">Template: Executive Slate Grid</option>
                <option value="creative-teal">Template: Creative Teal</option>
                <option value="compact-euro">Template: Compact Euro</option>
                <option value="lagos-corporate">Template: Lagos Corporate</option>
                <option value="tech-stack">Template: Tech Stack</option>
                <option value="graduate">Template: Graduate</option>
              </select>
            </div>

          <button onClick={exportJSONBackup} className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-800 bg-slate-900 text-slate-300 rounded-xl text-xs font-semibold hover:border-slate-700">
            <Download size={14} /> {"Export Data"}
          </button>
          <PDFDownloadLink
            document={
              <PdfDocumentRouter
                theme={theme}
                fullName={fullName}
                email={email}
                phone={phone}
                website={website}
                summary={summary}
                skills={skills}
                experience={experience}
              />
            }
            fileName={resumeTitle.toLowerCase().replace(/\s+/g, '-') + '.pdf'}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-800 bg-slate-900 text-slate-300 rounded-xl text-xs font-semibold hover:border-slate-700"
          >
            {({ loading }: { loading: boolean }) =>
              loading ? (
                <React.Fragment><Loader2 size={14} className="animate-spin" /> Preparing...</React.Fragment>
              ) : (
                <React.Fragment><Download size={14} /> Download PDF</React.Fragment>
              )
            }
          </PDFDownloadLink>
          <button onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-800 bg-slate-900 text-slate-300 rounded-xl text-xs font-semibold hover:border-slate-700">
            <Printer size={14} /> Print
          </button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-500 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Matrix'}
          </button>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto w-full">
        <div className={`grid grid-cols-1 gap-6 min-h-[calc(100vh-65px)] print:block ${isAiOpen ? 'xl:grid-cols-[1fr_1fr_auto]' : 'xl:grid-cols-2'}`}>
          <div className="p-6 md:p-10 border-r border-slate-900 space-y-8 overflow-y-auto max-h-[calc(100vh-70px)] print:hidden">
            <button
              onClick={() => setShowGuide(true)}
              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/20 text-xs font-semibold py-3 rounded-xl transition-colors"
            >
              ✨ Start Guided Interview
            </button>

            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-300">🎯 Tailor to a Specific Job</h3>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white resize-none leading-relaxed placeholder-slate-600"
                placeholder="Paste the job description you want to target..."
              />
              <button
                onClick={async () => {
                  setIsAiOpen(true);
                  const { data: { session } } = await supabase.auth.getSession();
                  const token = session?.access_token || '';
                  fetch('/api/assistant', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      messages: [{ role: 'user', parts: [{ type: 'text', text: `Tailor my CV for this job: ${jobDescription}` }] }],
                      context: {
                        page: 'cv-builder',
                        resumeText: [fullName, email, phone, website, summary, skills, experience.map((e) => `${e.role} at ${e.company}: ${e.bullets}`).join('\n')].filter(Boolean).join('\n'),
                        jobDescription,
                      },
                    }),
                  });
                }}
                disabled={!jobDescription.trim()}
                className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold text-xs py-3 rounded-xl transition-all"
              >
                <Sparkles size={14} /> Tailor CV with AI
              </button>
            </div>

            <div className="flex items-center justify-between border border-slate-800 bg-slate-900/40 rounded-xl p-4">
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Show Mock Data Preview</label>
                <p className="text-[9px] text-slate-500">Populate the preview with a full sample Nigerian CV.</p>
              </div>
              <button
                onClick={() => setIsMockData((prev) => !prev)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isMockData ? 'bg-orange-500' : 'bg-slate-700'}`}
                role="switch"
                aria-checked={isMockData}
                aria-label="Show mock data preview"
                type="button"
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transform transition-transform ${isMockData ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Placement Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="Agene Okoh" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Verified Contact Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Phone Contact Number</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="+234..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Vanity Portfolio Handle Link</label>
                <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="://devcraft.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Executive Summary Meta Dossier Statement</label>
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white resize-none leading-relaxed" placeholder="State your metrics achievements..." />
              <button
                onClick={async () => {
                  setIsAiOpen(true);
                  const { data: { session } } = await supabase.auth.getSession();
                  const token = session?.access_token || '';
                  fetch('/api/assistant', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      messages: [{ role: 'user', parts: [{ type: 'text', text: 'Rewrite my executive summary to sound more professional and impactful.' }] }],
                      context: {
                        page: 'cv-builder',
                        resumeText: [fullName, email, phone, website, summary, skills, experience.map((e) => `${e.role} at ${e.company}: ${e.bullets}`).join('\n')].filter(Boolean).join('\n'),
                      },
                    }),
                  });
                }}
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-orange-400 hover:text-orange-300 transition-colors"
              >
                <Sparkles size={10} /> Get AI Suggestions
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Work Experience Mapping Matrix</label>
                <button onClick={handleAddExperience} className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400"><Plus size={12} /> Add Job Entry</button>
              </div>
              {experience.map((exp) => (
                <div key={exp.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3 relative group">
                  <button onClick={() => handleRemoveExperience(exp.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400"><Trash2 size={12} /></button>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <input type="text" placeholder="Institution/Company" value={exp.company} onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
                    <input type="text" placeholder="Official Role Position" value={exp.role} onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
                    <input type="text" placeholder="Dates Frame" value={exp.dates} onChange={(e) => handleExperienceChange(exp.id, 'dates', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
                  </div>
                  <textarea rows={2} placeholder="Key accomplishments and data volume variables metrics optimized..." value={exp.bullets} onChange={(e) => handleExperienceChange(exp.id, 'bullets', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white resize-none" />

                  {exp.bullets.length > 2 && (
                    <div className={`p-2 rounded-lg text-[10px] font-medium border ${
                      exp.bullets.toLowerCase().includes('responsible for') || exp.bullets.toLowerCase().includes('helped with') ? 'bg-red-500/5 border-red-500/20 text-red-400' :
                      exp.bullets.toLowerCase().includes('managed') || exp.bullets.toLowerCase().includes('led') ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400' :
                      !/\d/.test(exp.bullets) ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : 'bg-green-500/5 border-green-500/20 text-green-400'
                    }`}>
                      {exp.bullets.toLowerCase().includes('responsible for') || exp.bullets.toLowerCase().includes('helped with') ? '⚠️ ATS Alert: Replace passive terms with high-velocity action verbs (e.g. Engineered, Architected).' :
                       exp.bullets.toLowerCase().includes('managed') || exp.bullets.toLowerCase().includes('led') ? '🚀 Tip: Maximize your score by explicitly detailing the volume metrics of the squads or resources led.' :
                       !/\d/.test(exp.bullets) ? '💡 Metrics Missing: Government and private selectors look for exact numeric parameters values.' : '✨ Compliance Check: Bullet format satisfies high-impact performance scanning screening metrics rules perfectly!'}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Technical Skill Keywords Matrix (Comma-Separated)</label>
              <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white" placeholder="React, TypeScript, SQL, PostgreSQL, Linux, Docker, AWS" />
            </div>

            <div className="flex items-center justify-between border border-slate-800 bg-slate-900/40 rounded-xl p-4">
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Include Profile Photo (Creative roles only)</label>
                <p className="text-[9px] text-slate-500">Enable for creative/portfolio-focused resumes. ATS-safe templates render without photos.</p>
              </div>
              <button
                onClick={() => setAllowPhoto((prev) => !prev)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${allowPhoto ? 'bg-indigo-600' : 'bg-slate-700'}`}
                role="switch"
                aria-checked={allowPhoto}
                aria-label="Include Profile Photo"
                type="button"
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transform transition-transform ${allowPhoto ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>

            <CertificateUploader
              supabase={supabase}
              userId={userId}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
            />

            <ProfilePhotoUploader
              avatarUrl={avatarUrl}
              setAvatarUrl={setAvatarUrl}
              allowPhoto={allowPhoto}
            />
          </div>

          <div className="min-w-0 xl:min-w-[400px] p-6 md:p-12 bg-slate-900/10 flex flex-col items-center overflow-y-auto max-h-[calc(100vh-70px)] print:max-h-none print:p-0 print:bg-white">
            <div className="mb-4 flex w-full justify-center print:hidden">
              <div className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1" role="tablist" aria-label="CV builder view">
                <button
                  type="button"
                  role="tab"
                  id="cv-preview-tab"
                  aria-selected={activeView === 'preview'}
                  aria-controls="cv-preview-panel"
                  onClick={() => setActiveView('preview')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:px-3.5 ${
                    activeView === 'preview'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye size={13} />
                  Preview
                </button>
                <button
                  type="button"
                  role="tab"
                  id="cv-jobs-tab"
                  aria-selected={activeView === 'jobs'}
                  aria-controls="cv-jobs-panel"
                  onClick={() => setActiveView('jobs')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:px-3.5 ${
                    activeView === 'jobs'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Briefcase size={13} />
                  Job Matches
                </button>
              </div>
            </div>

            <div
              id="cv-preview-panel"
              role="tabpanel"
              aria-labelledby="cv-preview-tab"
              className={`w-full justify-center ${activeView === 'preview' ? 'flex' : 'hidden print:flex'}`}
            >
              {theme === 'minimalist' ? (
                <TemplateMinimalist fullName={previewFullName} email={previewEmail} phone={previewPhone} website={previewWebsite} summary={previewSummary} skills={previewSkills} experience={previewExperience} avatarUrl={avatarUrl} {...({ allowPhoto } as any)} />
              ) : theme === 'executive-slate' ? (
                <TemplateExecutiveSlate fullName={previewFullName} email={previewEmail} phone={previewPhone} website={previewWebsite} summary={previewSummary} skills={previewSkills} experience={previewExperience} {...({ allowPhoto } as any)} />
              ) : theme === 'creative-teal' ? (
                <TemplateCreativeTeal fullName={previewFullName} email={previewEmail} phone={previewPhone} website={previewWebsite} summary={previewSummary} skills={previewSkills} experience={previewExperience} avatarUrl={avatarUrl} {...({ allowPhoto } as any)} />
              ) : theme === 'compact-euro' ? (
                <TemplateCompactEuro fullName={previewFullName} email={previewEmail} phone={previewPhone} website={previewWebsite} summary={previewSummary} skills={previewSkills} experience={previewExperience} avatarUrl={avatarUrl} {...({ allowPhoto } as any)} />
              ) : theme === 'lagos-corporate' ? (
                <TemplateLagosCorporate fullName={previewFullName} email={previewEmail} phone={previewPhone} website={previewWebsite} summary={previewSummary} skills={previewSkills} experience={previewExperience} allowPhoto={allowPhoto} />
              ) : theme === 'tech-stack' ? (
                <TemplateTechStack fullName={previewFullName} email={previewEmail} phone={previewPhone} website={previewWebsite} summary={previewSummary} skills={previewSkills} experience={previewExperience} allowPhoto={allowPhoto} />
              ) : theme === 'graduate' ? (
                <TemplateGraduate fullName={previewFullName} email={previewEmail} phone={previewPhone} website={previewWebsite} summary={previewSummary} skills={previewSkills} experience={previewExperience} allowPhoto={allowPhoto} />
              ) : (
                <TemplateModernIndigo fullName={previewFullName} email={previewEmail} phone={previewPhone} website={previewWebsite} summary={previewSummary} skills={previewSkills} experience={previewExperience} />
              )}
            </div>

            {activeView === 'jobs' ? (
              <div
                id="cv-jobs-panel"
                role="tabpanel"
                aria-labelledby="cv-jobs-tab"
                className="w-full max-w-4xl print:hidden"
              >
                <JobMatchesPanel techStack={techStack} />
              </div>
            ) : null}
          </div>

          {isAiOpen ? (
            <div className="min-w-0 xl:w-[400px] xl:shrink-0">
              <AIAssistant
                title="CV Builder Copilot"
                triggerLabel="Tailor my CV"
                prompt="Help me tailor my CV to a specific job. Ask me to paste the job description if I have not provided it."
                context={{
                  page: 'cv-builder',
                  resumeText: [fullName, email, phone, website, summary, skills, experience.map((e) => `${e.role} at ${e.company}: ${e.bullets}`).join('\n')].filter(Boolean).join('\n'),
                  jobDescription,
                }}
                userName={fullName || 'Candidate'}
                userSkills={techStack}
                inline
                forceOpen
                onOpenChange={setIsAiOpen}
              />
            </div>
          ) : null}
        </div>
      </div>

      {!isAiOpen ? (
        <AIAssistant
          title="CV Builder Copilot"
          triggerLabel="Tailor my CV"
          prompt="Help me tailor my CV to a specific job. Ask me to paste the job description if I have not provided it."
          context={{
            page: 'cv-builder',
            resumeText: [fullName, email, phone, website, summary, skills, experience.map((e) => `${e.role} at ${e.company}: ${e.bullets}`).join('\n')].filter(Boolean).join('\n'),
            jobDescription,
          }}
          userName={fullName || 'Candidate'}
          userSkills={techStack}
          onOpenChange={setIsAiOpen}
        />
      ) : null}
    </div>
  );
}
