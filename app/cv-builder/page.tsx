'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  Save,
  Printer,
  Plus,
  Trash2,
  Loader2,
  Upload,
  File,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  dates: string;
  bullets: string;
}

interface DocumentItem {
  id: string;
  name: string;
  url: string;
}

export default function CVBuilder() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Resume form states
  const [resumeTitle, setResumeTitle] = useState('My Professional CV');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState<ExperienceItem[]>([
    { id: '1', company: '', role: '', dates: '', bullets: '' },
  ]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Profile data structures
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Storage uploading handlers
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      // Fetch unified profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, phone, website')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
        setWebsite(profile.website || '');
      }

      // Fetch dynamic active resume data records
      const { data: cv } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cv) {
        setResumeTitle(cv.resume_title || 'My Professional CV');
        setSummary(cv.summary || '');
        setSkills(cv.skills ? cv.skills.join(', ') : '');
        setExperience(
          Array.isArray(cv.experience) && cv.experience.length > 0
            ? cv.experience as ExperienceItem[]
            : [{ id: '1', company: '', role: '', dates: '', bullets: '' }]
        );
        if (cv.documents && Array.isArray(cv.documents)) {
          setDocuments(
            cv.documents.map((doc: any) => ({
              id: doc.id || crypto.randomUUID(),
              name: doc.name || 'Attachment',
              url: doc.url || '',
            }))
          );
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleAddExperience = () => {
    setExperience([
      ...experience,
      { id: Date.now().toString(), company: '', role: '', dates: '', bullets: '' },
    ]);
  };

  const handleRemoveExperience = (id: string) => {
    if (experience.length === 1) {
      alert('You need at least one experience entry.');
      return;
    }
    setExperience(experience.filter((exp) => exp.id !== id));
  };

  const handleExperienceChange = (
    id: string,
    field: keyof ExperienceItem,
    value: string
  ) => {
    setExperience(
      experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !userId) return;
    const file = e.target.files[0];

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resume-docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('resume-docs')
        .getPublicUrl(filePath);

      const newDoc: DocumentItem = {
        id: crypto.randomUUID(),
        name: file.name,
        url: urlData.publicUrl,
      };
      setDocuments((prev) => [...prev, newDoc]);
    } catch (error: any) {
      console.error(error);
      alert('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);

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

      if (profileError) throw profileError;

      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const docsToStore = documents.map(({ name, url }) => ({ name, url }));

      const { error: resumeError } = await supabase.from('resumes').upsert(
        {
          user_id: userId,
          resume_title: resumeTitle,
          summary,
          skills: skillsArray,
          experience,
          documents: docsToStore,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      if (resumeError) throw resumeError;
      alert('✅ CV configuration saved successfully!');
    } catch (error: any) {
      console.error(error);
      alert('❌ Save sequence fault: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-purple-500" size={20} />
        <span>Loading workspace data tables...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 print:bg-white print:text-black">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-all border border-slate-800"
          >
            <ArrowLeft size={16} />
          </Link>
          <input
            type="text"
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-purple-500 font-bold text-sm text-white px-2 py-1 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-800 bg-slate-900 text-slate-300 rounded-xl text-xs font-semibold hover:border-slate-700 transition-all"
          >
            <Printer size={14} /> Print / PDF
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-500 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save to Cloud'}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-2 min-h-[calc(100vh-65px)] print:block">
        {/* LEFT COLUMN – Form */}
        <div className="p-6 md:p-10 border-r border-slate-900 space-y-8 overflow-y-auto max-h-[calc(100vh-70px)] print:hidden">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Core Professional Information</h2>
            <p className="text-xs text-slate-500">Provide your verified metrics to populate the layout.</p>
          </div>

          {/* Profile Fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                placeholder="+234..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Website / Portfolio
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                placeholder="https://mywebsite.dev"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Professional Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white resize-none"
              placeholder="Briefly state your core value metrics..."
            />
          </div>

          {/* Experience Matrix */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Work History Matrix
              </label>
              <button
                onClick={handleAddExperience}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 hover:text-purple-300"
              >
                <Plus size={12} /> Add Job Entry
              </button>
            </div>

            {experience.map((exp) => (
              <div
                key={exp.id}
                className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3 relative group"
              >
                <button
                  onClick={() => handleRemoveExperience(exp.id)}
                  className="absolute top-4 right-4 text-slate-600 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
                <div className="grid sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={exp.company}
                    onChange={(e) =>
                      handleExperienceChange(exp.id, 'company', e.target.value)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={exp.role}
                    onChange={(e) =>
                      handleExperienceChange(exp.id, 'role', e.target.value)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Dates (e.g., 2020–2023)"
                    value={exp.dates}
                    onChange={(e) =>
                      handleExperienceChange(exp.id, 'dates', e.target.value)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Key accomplishments"
                  value={exp.bullets}
                  onChange={(e) =>
                    handleExperienceChange(exp.id, 'bullets', e.target.value)
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white resize-none"
                />
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Skills Inventory (Comma‑Separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
              placeholder="React, TypeScript, Next.js, Tailwind"
            />
          </div>

          {/* Document Upload */}
          <div className="space-y-4 border-t border-slate-800 pt-6">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Supporting Documents
              </label>
              <label
                htmlFor="doc-upload"
                className={`cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 hover:text-purple-300 ${
                  uploading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {uploading ? (
                  <Loader2 className="animate-spin" size={12} />
                ) : (
                  <Upload size={12} />
                )}
                {uploading ? 'Uploading...' : 'Upload Document'}
              </label>
              <input
                id="doc-upload"
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleUploadDocument}
                className="hidden"
                disabled={uploading}
              />
            </div>

            {documents.length === 0 && (
              <p className="text-xs text-slate-500 italic">
                No documents attached. Upload transcripts, certificates, etc.
              </p>
            )}

            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <File size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="text-xs text-slate-300 truncate" title={doc.name}>
                      {doc.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="text-slate-500 hover:text-red-400 flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500">
              Supported: PDF, Word, PNG, JPG (max 5MB each)
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN – Live Preview */}
        <div className="p-6 md:p-10 bg-slate-900/20 print:bg-white print:p-6 overflow-y-auto max-h-[calc(100vh-70px)]">
          <div className="max-w-2xl mx-auto print:max-w-full">
            <div className="bg-slate-800/30 print:bg-white rounded-2xl p-8 print:p-0 border border-slate-800 print:border-none shadow-xl print:shadow-none">
              {/* Header */}
              <div className="border-b border-slate-700 print:border-black/10 pb-4 mb-4">
                <h1 className="text-2xl font-bold text-white print:text-black">
                  {fullName || 'Your Name'}
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 print:text-black/70 mt-1">
                  {email && <span>{email}</span>}
                  {phone && <span>{phone}</span>}
                  {website && <span>{website}</span>}
                </div>
              </div>

              {/* Summary */}
              {summary && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 print:text-black/50 mb-1">
                    Summary
                  </h2>
                  <p className="text-sm text-slate-300 print:text-black/80 leading-relaxed">
                    {summary}
                  </p>
                </div>
              )}

              {/* Experience */}
              {experience.some((e) => e.company || e.role) && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 print:text-black/50 mb-2">
                    Experience
                  </h2>
                  <div className="space-y-3">
                    {experience.map(
                      (exp) =>
                        (exp.company || exp.role) && (
                          <div key={exp.id}>
                            <div className="flex justify-between items-baseline">
                              <span className="font-semibold text-sm text-white print:text-black">
                                {exp.role || 'Role'}
                              </span>
                              <span className="text-xs text-slate-400 print:text-black/60">
                                {exp.dates || 'Dates'}
                              </span>
                            </div>
                            <div className="text-sm text-slate-300 print:text-black/70">
                              {exp.company || 'Company'}
                            </div>
                            {exp.bullets && (
                              <p className="text-xs text-slate-400 print:text-black/60 mt-1 whitespace-pre-line">
                                {exp.bullets}
                              </p>
                            )}
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}

              {/* Skills */}
              {skills && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 print:text-black/50 mb-1">
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {skills
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-700/50 print:bg-black/5 px-2 py-1 rounded-full text-slate-300 print:text-black/70"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Attached Documents */}
              {documents.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700 print:border-black/10">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 print:text-black/50 mb-2">
                    Attached Documents
                  </h2>
                  <ul className="space-y-1">
                    {documents.map((doc) => (
                      <li key={doc.id}>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-400 print:text-black underline hover:text-purple-300"
                        >
                          {doc.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}