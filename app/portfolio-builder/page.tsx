'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Plus, Trash2, Loader2, Code2, Copy, Check, Globe } from 'lucide-react';
import Link from 'next/link';

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  liveUrl: string;
  repoUrl: string;
  languages: string;
}

export default function PortfolioBuilder() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mining, setMining] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [portfolioTitle, setPortfolioTitle] = useState('My Developer Portfolio');
  const [bio, setBio] = useState('');
  const [techStack, setTechStack] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [projects, setProjects] = useState<ProjectItem[]>([
    { id: '1', title: '', description: '', liveUrl: '', repoUrl: '', languages: '' }
  ]);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      if (profile) setFullName(profile.full_name || '');

      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (portfolio) {
        setPortfolioTitle(portfolio.title || 'My Developer Portfolio');
        setBio(portfolio.bio || '');
        // Handle tech_stack both as array or string
        if (Array.isArray(portfolio.tech_stack)) {
          setTechStack(portfolio.tech_stack.join(', '));
        } else if (typeof portfolio.tech_stack === 'string') {
          setTechStack(portfolio.tech_stack);
        } else {
          setTechStack('');
        }
        setSubdomain(portfolio.custom_subdomain || '');
        if (portfolio.projects && Array.isArray(portfolio.projects)) {
          setProjects(portfolio.projects as ProjectItem[]);
        }
      }
      setLoading(false);
    };

    fetchPortfolioData();
  }, [router]);

  const handleAddProject = () => {
    setProjects([...projects, { id: Date.now().toString(), title: '', description: '', liveUrl: '', repoUrl: '', languages: '' }]);
  };

  const handleRemoveProject = (id: string) => {
    if (projects.length === 1) return;
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleProjectChange = (id: string, field: keyof ProjectItem, value: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const triggerGitHubSync = async (id: string, targetUrl: string) => {
    if (!targetUrl) {
      alert('Please enter a GitHub repository link inside the card input field first.');
      return;
    }
    setMining(true);
    try {
      const response = await fetch('/api/github-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: targetUrl })
      });
      const data = await response.json();
      if (data.title) {
        setProjects(projects.map(p => p.id === id ? {
          ...p,
          title: data.title || p.title,
          languages: data.languages || p.languages,
          description: data.description || p.description
        } : p));
      } else {
        alert('Could not fetch repository data. Please check the URL and try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error syncing with GitHub. Please try again.');
    } finally {
      setMining(false);
    }
  };

  const handleSavePortfolio = async () => {
    if (!userId) return;
    setSaving(true);

    // Convert techStack string to array for storage
    const techArray = techStack.split(',').map(s => s.trim()).filter(Boolean);

    const { error } = await supabase.from('portfolios').upsert({
      user_id: userId,
      title: portfolioTitle,
      bio: bio,
      tech_stack: techArray,
      custom_subdomain: subdomain ? subdomain.toLowerCase().trim() : null,
      projects: projects,
    }, { onConflict: 'user_id' });

    setSaving(false);
    if (!error) {
      alert('✅ Developer portfolio saved successfully to the cloud!');
    } else {
      alert('❌ Failed to save: ' + error.message);
    }
  };

  const generateMarkdown = () => {
    return `# 🚀 ${fullName || 'Developer Profile'}
    
> ${bio || 'Full-Stack Software Engineer building optimized codebases.'}

### 🛠️ Tech Stack Matrix
\`\`\`text
${techStack || 'React, TypeScript, Node.js'}
\`\`\`

### 📁 Core Production Proof of Work
${projects.map(p => `
#### 💻 ${p.title || 'Project Build'}
*   **Description:** ${p.description || 'Application codebase details.'}
*   **Live App Preview Link:** [Launch Live Preview](${p.liveUrl || '#'})
*   **Source Code Repository:** [View Git Code Base](${p.repoUrl || '#'})
*   **Languages Utilized:** ${p.languages || 'TypeScript'}
`).join('\n')}

---
*Generated dynamically via the [DevCraft Career Engineering Platform](https://vercel.app).*`;
  };

  const copyMarkdownToClipboard = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-indigo-500" size={20} />
        <span>Initializing Dev Workspace Console...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-all border border-slate-800">
            <ArrowLeft size={16} />
          </Link>
          <input 
            type="text" 
            value={portfolioTitle} 
            onChange={(e) => setPortfolioTitle(e.target.value)}
            className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-indigo-500 font-bold text-sm text-white px-2 py-1 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={copyMarkdownToClipboard} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-800 bg-slate-900 text-slate-300 rounded-xl text-xs font-semibold hover:border-slate-700 transition-all">
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />} 
            {copied ? "Copied README" : "Copy Profile README.md"}
          </button>
          <button onClick={handleSavePortfolio} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-all disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {"Save Core Engine"}
          </button>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-2 min-h-[calc(100vh-65px)]">
        
        {/* LEFT COLUMN: Controls Input Management Panel */}
        <div className="p-6 md:p-10 border-r border-slate-900 space-y-8 overflow-y-auto h-[calc(100vh-70px)]">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Engineering Profile Parameters</h2>
            <p className="text-xs text-slate-500">Expose your primary software assets to sync dynamic landing cards.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Custom Vanity Subdomain Address</label>
              <div className="flex items-center">
                <input type="text" value={subdomain} onChange={(e) => setSubdomain(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-l-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-slate-700 flex-1" placeholder="my-handle" />
                <span className="bg-slate-950 border border-l-0 border-slate-800 rounded-r-xl px-4 py-2.5 text-xs text-slate-500 font-mono">.devcraft.com</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Primary Tech Stack Keywords Matrix</label>
              <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none" placeholder="React, TypeScript, PostgreSQL, Docker, AWS" />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Professional Engineering Biography Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white resize-none" placeholder="Full-Stack Engineer specialized in compiling high-availability database engines..." />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Production Proof of Work Card Matrix</label>
              <button onClick={handleAddProject} className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300">
                <Plus size={12} /> Add Project Card
              </button>
            </div>

            {projects.map((proj) => (
              <div key={proj.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3 relative group">
                <button onClick={() => handleRemoveProject(proj.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400">
                  <Trash2 size={12} />
                </button>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input type="text" placeholder="Application Name Title" value={proj.title} onChange={(e) => handleProjectChange(proj.id, 'title', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
                  <input type="text" placeholder="Languages Used (e.g., Python, SQL)" value={proj.languages} onChange={(e) => handleProjectChange(proj.id, 'languages', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input type="text" placeholder="Live Deployment preview URL link" value={proj.liveUrl} onChange={(e) => handleProjectChange(proj.id, 'liveUrl', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
                  <input type="text" placeholder="GitHub Repository Git URL" value={proj.repoUrl} onChange={(e) => handleProjectChange(proj.id, 'repoUrl', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
                </div>
                <textarea rows={2} placeholder="Brief summary of application features, architecture bottlenecks cleared, or performance speeds optimized..." value={proj.description} onChange={(e) => handleProjectChange(proj.id, 'description', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white resize-none" />
                
                {/* GitHub Sync Button */}
                <div className="flex items-center gap-2 pt-1">
                  <button 
                    onClick={() => triggerGitHubSync(proj.id, proj.repoUrl)} 
                    disabled={mining || !proj.repoUrl}
                    className="inline-flex items-center gap-1.5 text-[10px] font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
                  >
                    {mining ? <Loader2 size={12} className="animate-spin" /> : <Code2 size={12} />}
                    {mining ? 'Syncing...' : 'Auto‑Sync from GitHub'}
                  </button>
                  <span className="text-[10px] text-slate-500">Paste a repo URL and click to fetch metadata</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Preview Digital Representation Canvas Sheet Panel Layout */}
        <div className="p-6 md:p-10 bg-slate-900/20 overflow-y-auto h-[calc(100vh-70px)]">
          <div className="w-full max-w-3xl mx-auto bg-slate-800/30 border border-slate-800 rounded-2xl p-6 shadow-xl">
            
            {/* Header Identity */}
            <div className="border-b border-slate-700 pb-4 mb-4">
              <h1 className="text-2xl font-bold text-white">{fullName || "YOUR NAME"}</h1>
              <div className="text-xs text-slate-400 mt-1">
                {subdomain ? `${subdomain.toLowerCase()}.devcraft.com` : "devcraft.com"}
              </div>
            </div>

            {/* Bio */}
            {bio && (
              <div className="mb-4">
                <p className="text-sm text-slate-300 leading-relaxed">{bio}</p>
              </div>
            )}

            {/* Tech Stack Badges */}
            {techStack && (
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tech Stack Matrix</h3>
                <div className="flex flex-wrap gap-1.5">
                  {techStack.split(',').map((tech, idx) => {
                    const trimmed = tech.trim();
                    return trimmed ? (
                      <span key={idx} className="text-xs bg-slate-700/50 px-2 py-1 rounded-full text-slate-300">
                        {trimmed}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Projects Cards */}
            {projects.some(p => p.title || p.description) && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Production Portfolio Cards</h3>
                <div className="space-y-4">
                  {projects.map((p) => {
                    if (!p.title && !p.description) return null;
                    return (
                      <div key={p.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-white text-sm">{p.title || "Untitled Project"}</h4>
                          {p.languages && (
                            <span className="text-xs text-slate-400">{p.languages}</span>
                          )}
                        </div>
                        {p.description && (
                          <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs">
                          {p.liveUrl && (
                            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-400 hover:underline">
                              <Globe size={12} /> Live Preview
                            </a>
                          )}
                          {p.repoUrl && (
                            <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-400 hover:underline">
                              <Code2 size={12} /> Git Repository
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}