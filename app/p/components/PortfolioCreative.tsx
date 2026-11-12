import React from 'react';
import { PortfolioTemplateProps, parseTechStack } from './types';

export default function PortfolioCreative({
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
    <div className="min-h-screen w-full bg-[#fff7ed] text-[#171412]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#ff4d00] opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-1/2 h-96 w-96 rounded-full bg-[#7c3aed] opacity-10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 py-16 sm:px-10 md:py-24">
          <header className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#ff4d00] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                Portfolio
              </span>
              {subdomain && (
                <span className="rounded-full border border-[#171412]/20 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#171412]/60">
                  {subdomain}.devcraft.com
                </span>
              )}
            </div>

            <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tighter sm:text-7xl md:text-8xl">
              {name || 'Your Name'}
            </h1>

            {title && (
              <p className="max-w-2xl text-xl font-semibold text-[#ff4d00] sm:text-2xl">
                {title}
              </p>
            )}
          </header>

          {bio && (
            <section className="mt-14 grid gap-6 border-t-2 border-[#171412] pt-8 md:grid-cols-[180px_1fr]">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#171412]/50">
                About Me
              </h2>
              <p className="max-w-3xl whitespace-pre-line text-lg font-medium leading-8 text-[#171412]/80 sm:text-xl">
                {bio}
              </p>
            </section>
          )}

          {stack.length > 0 && (
            <section className="mt-12 grid gap-6 border-t-2 border-[#171412] pt-8 md:grid-cols-[180px_1fr]">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#171412]/50">
                Toolkit
              </h2>
              <div className="flex flex-wrap gap-2">
                {stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-[#171412] px-4 py-2 text-sm font-bold text-[#fff7ed]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          )}

          {visibleProjects.length > 0 && (
            <section className="mt-16">
              <div className="flex items-end justify-between border-b-2 border-[#171412] pb-4">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#171412]/50">
                  Featured Work
                </h2>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#171412]/40">
                  {String(visibleProjects.length).padStart(2, '0')} Projects
                </span>
              </div>

              <div className="divide-y-2 divide-[#171412]/10">
                {visibleProjects.map((project, index) => (
                  <article
                    key={project.id || project.title || index}
                    className="group grid gap-4 py-8 md:grid-cols-[80px_1fr_auto] md:items-start"
                  >
                    <span className="text-3xl font-black text-[#ff4d00]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
                        {project.title}
                      </h3>
                      {project.languages && (
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-[#7c3aed]">
                          {project.languages}
                        </p>
                      )}
                      {project.description && (
                        <p className="mt-3 max-w-2xl text-base leading-7 text-[#171412]/70">
                          {project.description}
                        </p>
                      )}
                    </div>
                    {(project.liveUrl || project.repoUrl) && (
                      <div className="flex gap-3 md:flex-col md:items-end">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-[#ff4d00] px-5 py-2 text-xs font-black uppercase tracking-[0.15em] text-white transition-transform hover:-translate-y-0.5"
                          >
                            Visit
                          </a>
                        )}
                        {project.repoUrl && (
                          <a
                            href={project.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border-2 border-[#171412] px-5 py-2 text-xs font-black uppercase tracking-[0.15em] transition-colors hover:bg-[#171412] hover:text-[#fff7ed]"
                          >
                            Code
                          </a>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#171412] pt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#171412]/50">
            <span>Built with DevCraft</span>
            {subdomain && <span>{subdomain}.devcraft.com</span>}
          </footer>
        </div>
      </div>
    </div>
  );
}
