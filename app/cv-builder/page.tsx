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
  Link as LinkIcon,
  Code,
} from 'lucide-react';
import Link from 'next/link';

// --- Type definitions ---
interface ProjectItem {
  id: string;
  title: string;
  description: string;
  liveUrl: string;
  repoUrl: string;
  languages: string;
}

interface DocumentItem {
  id: string;
  name: string;
  url: string;
  size?: number;
}

export default function PortfolioBuilder() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [portfolioTitle, setPortfolioTitle] = useState('My Dev Portfolio');
  const [bioSummary, setBioSummary] = useState('');
  const [techStack, setTechStack] = useState('');
  const [customSubdomain, setCustomSubdomain] = useState('');

  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: '1',
      title: '',
      description: '',
      liveUrl: '',
      repoUrl: '',
      languages: '',
    },
  ]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

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

      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (portfolio) {
        setPortfolioTitle(portfolio.title || 'My Dev Portfolio');
        setBioSummary(portfolio.bio || '');
        setCustomSubdomain(portfolio.custom_subdomain || '');
        setTechStack(
          Array.isArray(portfolio.tech_stack)
            ? portfolio.tech_stack.join(', ')
            : ''
        );
        setProjects(
          Array.isArray(portfolio.projects) && portfolio.projects.length > 0
            ? portfolio.projects
            : [{ id: '1', title: '', description: '', liveUrl: '', repoUrl: '', languages: '' }]
        );
        if (portfolio.documents && Array.isArray(portfolio.documents)) {
          setDocuments(
            portfolio.documents.map((doc: any) => ({
              ...doc,
              id: doc.id || Date.now().toString(),
            }))
          );
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        id: Date.now().toString(),
        title: '',
        description: '',
        liveUrl: '',
        repoUrl: '',
        languages: '',
      },
    ]);
  };

  const handleRemoveProject = (id: string) => {
    if (projects.length === 1) {
      alert('You need at least one project entry.');
      return;
    }
    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleProjectChange = (
    id: string,
    field: keyof ProjectItem,
    value: string
  ) => {
    setProjects(
      projects.map((p) => (p.id === id ? { ...p, [field]: value } : p))
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
        .from('portfolio-docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('portfolio-docs')
        .getPublicUrl(filePath);

      const newDoc: DocumentItem = {
        id: Date.now().toString(),
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
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

      const techStackArray = techStack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const projectsToStore = projects.map(({ id, ...rest }) => rest);
      const docsToStore = documents.map(({ name, url }) => ({ name, url }));

      const { error: portfolioError } = await supabase
        .from('portfolios')
        .upsert(
          {
            user_id: userId,
            title: portfolioTitle,
            bio: bioSummary,
            custom_subdomain: customSubdomain,
            tech_stack: techStackArray,
            projects: projectsToStore,
            documents: docsToStore,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (portfolioError) throw portfolioError;

      alert('✅ Portfolio saved successfully!');
    } catch (error: any) {
      console.error(error);
      alert('❌ Failed to save: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-purple-500" size={20} />
        <span>Loading your portfolio workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 print:bg-white print:text-black">
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
            value={portfolioTitle}
            onChange={(e) => setPortfolioTitle(e.target.value)}
            className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-purple-500 font-bold text-sm text-white px-2 py-1 focus:outline-none transition-colors"
            placeholder="Portfolio Title"
          />
          {customSubdomain && (
            <span className="text-xs text-slate-500 hidden md:inline">
              {customSubdomain}.devcraft.com
            </span>
          )}
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

      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-2 min-h-[calc(100vh-65px)] print:block">
        {/* LEFT COLUMN */}
        <div className="p-6 md:p-10 border-r border-slate-900 space-y-8 overflow-y-auto max-h-[calc(100vh-70px)] print:hidden">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Profile & Core Info</h2>
            <p className="text-xs text-slate-500">
              Define your bio, tech stack, and custom subdomain.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500"
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
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500"
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
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500"
                placeholder="+234..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Website / Blog
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500"
                placeholder="https://myblog.dev"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bio Summary
            </label>
            <textarea
              value={bioSummary}
              onChange={(e) => setBioSummary(e.target.value)}
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white resize-none placeholder-slate-500"
              placeholder="Full-Stack Engineer building automation architecture..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tech Stack (comma-separated)
              </label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500"
                placeholder="React, TypeScript, Next.js, Tailwind"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Custom Subdomain
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={customSubdomain}
                  onChange={(e) => setCustomSubdomain(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-l-xl px-4 py-2.5 text-xs text-white placeholder-slate-500"
                  placeholder="yourname"
                />
                <span className="bg-slate-800 border border-l-0 border-slate-800 rounded-r-xl px-3 py-2.5 text-xs text-slate-400">
                  .devcraft.com
                </span>
              </div>
            </div>
          </div>

          {/* Projects Matrix */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Projects Matrix
              </label>
              <button
                onClick={handleAddProject}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 hover:text-purple-300"
              >
                <Plus size={12} /> Add Project Card
              </button>
            </div>

            {projects.map((project) => (
              <div
                key={project.id}
                className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3 relative group"
              >
                <button
                  onClick={() => handleRemoveProject(project.id)}
                  className="absolute top-4 right-4 text-slate-600 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={project.title}
                    onChange={(e) =>
                      handleProjectChange(project.id, 'title', e.target.value)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="Live URL"
                    value={project.liveUrl}
                    onChange={(e) =>
                      handleProjectChange(project.id, 'liveUrl', e.target.value)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="Repository URL"
                    value={project.repoUrl}
                    onChange={(e) =>
                      handleProjectChange(project.id, 'repoUrl', e.target.value)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="Languages (comma-separated)"
                    value={project.languages}
                    onChange={(e) =>
                      handleProjectChange(project.id, 'languages', e.target.value)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Project description"
                  value={project.description}
                  onChange={(e) =>
                    handleProjectChange(project.id, 'description', e.target.value)
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white resize-none placeholder-slate-500"
                />
              </div>
            ))}
          </div>

          {/* Supporting Documents */}
          <div className="space-y-4 border-t border-slate-800 pt-6">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Supporting Documents (optional)
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
                    {doc.size && (
                      <span className="text-[10px] text-slate-500 flex-shrink-0">
                        {(doc.size / 1024).toFixed(0)} KB
                      </span>
                    )}
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
          <div className="w-full max-w-4xl mx-auto print:max-w-full">
            <div className="bg-slate-800/30 print:bg-white rounded-2xl p-8 print:p-0 border border-slate-800 print:border-none shadow-xl print:shadow-none">
              <div className="border-b border-slate-700 print:border-black/10 pb-6 mb-6">
                <h1 className="text-3xl font-bold text-white print:text-black">
                  {fullName || 'Your Name'}
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400 print:text-black/70 mt-2">
                  {email && <span>{email}</span>}
                  {phone && <span>{phone}</span>}
                  {website && <span>{website}</span>}
                </div>
                {customSubdomain && (
                  <div className="text-xs text-purple-400 print:text-black/60 mt-1">
                    {customSubdomain}.devcraft.com
                  </div>
                )}
              </div>

              {bioSummary && (
                <div className="mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 print:text-black/50 mb-1">
                    Bio
                  </h2>
                  <p className="text-sm text-slate-300 print:text-black/80 leading-relaxed">
                    {bioSummary}
                  </p>
                </div>
              )}

              {techStack && (
                <div className="mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 print:text-black/50 mb-1">
                    Tech Stack
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {techStack
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-700/50 print:bg-black/5 px-2 py-1 rounded-full text-slate-300 print:text-black/70"
                        >
                          {tech}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {projects.some((p) => p.title || p.description) && (
                <div className="mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 print:text-black/50 mb-3">
                    Projects
                  </h2>
                  <div className="space-y-4">
                    {projects.map(
                      (p) =>
                        (p.title || p.description) && (
                          <div key={p.id} className="border-l-2 border-purple-500/30 pl-4">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <h3 className="font-semibold text-white print:text-black">
                                {p.title || 'Untitled'}
                              </h3>
                              {p.languages && (
                                <span className="text-xs text-slate-500 print:text-black/50">
                                  {p.languages
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean)
                                    .join(' · ')}
                                </span>
                              )}
                            </div>
                            {p.description && (
                              <p className="text-sm text-slate-300 print:text-black/70 mt-1">
                                {p.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3 mt-2 text-xs">
                              {p.liveUrl && (
                                <a
                                  href={p.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-purple-400 print:text-black hover:underline"
                                >
                                  <LinkIcon size={12} /> Live Demo
                                </a>
                              )}
                              {p.repoUrl && (
                                <a
                                  href={p.repoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-purple-400 print:text-black hover:underline"
                                >
                                  <Code size={12} /> Source Code
                                </a>
                              )}
                            </div>
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}

              {documents.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-700 print:border-black/10">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 print:text-black/50 mb-2">
                    Supporting Documents
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