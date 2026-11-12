import React from 'react';
import { PortfolioTemplateProps, parseTechStack } from './types';

export default function PortfolioMinimal({
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
    <div className="min-h-screen w-full bg-white text-neutral-900">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10 md:py-24">
        <header className="border-b border-neutral-200 pb-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-neutral-400">
            {subdomain ? `${subdomain}.devcraft.com` : 'Portfolio'}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            {name || 'Your Name'}
          </h1>
          {title && (
            <p className="mt-3 text-base text-neutral-500">{title}</p>
          )}
        </header>

        {bio && (
          <section className="border-b border-neutral-200 py-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              About
            </h2>
            <p className="mt-4 whitespace-pre-line text-base leading-8 text-neutral-600">
              {bio}
            </p>
          </section>
        )}

        {stack.length > 0 && (
          <section className="border-b border-neutral-200 py-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              Skills
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {stack.map((tech) => (
                <li
                  key={tech}
                  className="text-sm text-neutral-700 after:ml-6 after:text-neutral-300 after:content-['·'] last:after:content-['']"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </section>
        )}

        {visibleProjects.length > 0 && (
          <section className="py-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              Selected Work
            </h2>
            <div className="mt-6 space-y-8">
              {visibleProjects.map((project, index) => (
                <article
                  key={project.id || project.title || index}
                  className="group"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-xl font-medium text-neutral-900">
                      {project.title}
                    </h3>
                    {project.languages && (
                      <span className="text-xs uppercase tracking-wider text-neutral-400">
                        {project.languages}
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="mt-2 text-sm leading-7 text-neutral-600">
                      {project.description}
                    </p>
                  )}
                  {(project.liveUrl || project.repoUrl) && (
                    <div className="mt-3 flex gap-5 text-xs font-medium text-neutral-900">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-900"
                        >
                          Live site
                        </a>
                      )}
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-900"
                        >
                          Source code
                        </a>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        <footer className="border-t border-neutral-200 pt-6 text-xs text-neutral-400">
          Built with DevCraft
        </footer>
      </div>
    </div>
  );
}
