import React from 'react';
import { PortfolioTemplateProps, parseTechStack } from './types';

export default function PortfolioDeveloper({
  name,
  title,
  bio,
  techStack,
  projects,
  subdomain,
}: PortfolioTemplateProps) {
  const stack = parseTechStack(techStack);
  const visibleProjects = (projects ?? []).filter((project) => project.title);

  return (
    <div className="min-h-screen w-full bg-[#0b1017] px-4 py-10 text-slate-200 sm:px-8 md:py-16">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a] shadow-2xl shadow-black/40">
        <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          <span className="ml-3 truncate font-mono text-xs text-slate-500">
            ~/{subdomain || 'portfolio'} — zsh
          </span>
        </div>

        <div className="space-y-12 p-6 font-mono sm:p-10">
          <header className="space-y-4">
            <p className="text-xs text-slate-500">
              <span className="text-emerald-400">const</span> developer ={' '}
              <span className="text-sky-300">{'{'}</span>
            </p>
            <h1 className="pl-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              &quot;{name || 'Your Name'}&quot;
            </h1>
            {title && (
              <p className="pl-4 text-sm text-slate-400">
                <span className="text-slate-600">{'// '}</span>
                {title}
              </p>
            )}
            <p className="text-xs text-slate-500">
              <span className="text-sky-300">{'}'}</span>;
            </p>
          </header>

          {bio && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                {'// about.ts'}
              </h2>
              <div className="rounded-xl border border-slate-800 bg-[#0b1017] p-5">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
                  {bio}
                </p>
              </div>
            </section>
          )}

          {stack.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                {'// stack.json'}
              </h2>
              <div className="flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-[#0b1017] p-5">
                {stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300"
                  >
                    &quot;{tech}&quot;
                  </span>
                ))}
              </div>
            </section>
          )}

          {visibleProjects.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                {'// projects/'}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {visibleProjects.map((project, index) => (
                  <article
                    key={project.id || project.title || index}
                    className="group rounded-xl border border-slate-800 bg-[#0b1017] p-5 transition-colors hover:border-emerald-500/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold text-white">
                        {project.title}
                      </h3>
                      <span className="shrink-0 text-[10px] text-slate-600">
                        .tsx
                      </span>
                    </div>
                    {project.languages && (
                      <p className="mt-1 text-[10px] text-sky-300">
                        {project.languages}
                      </p>
                    )}
                    {project.description && (
                      <p className="mt-3 text-xs leading-6 text-slate-400">
                        {project.description}
                      </p>
                    )}
                    {(project.liveUrl || project.repoUrl) && (
                      <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-emerald-400">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-emerald-300"
                          >
                            $ open live
                          </a>
                        )}
                        {project.repoUrl && (
                          <a
                            href={project.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-emerald-300"
                          >
                            $ git clone
                          </a>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          <footer className="border-t border-slate-800 pt-5 text-[11px] text-slate-600">
            <span className="text-emerald-400">➜</span>{' '}
            {subdomain ? `${subdomain}.devcraft.com` : 'devcraft.com'}{' '}
            <span className="animate-pulse">_</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
