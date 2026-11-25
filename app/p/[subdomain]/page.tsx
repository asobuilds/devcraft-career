import React from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PortfolioMinimal from '@/app/p/components/PortfolioMinimal';
import PortfolioDeveloper from '@/app/p/components/PortfolioDeveloper';
import PortfolioCreative from '@/app/p/components/PortfolioCreative';
import type {
  PortfolioProject,
  PortfolioTemplateProps,
} from '@/app/p/components/types';

type PortfolioRow = {
  user_id: string;
  title?: string | null;
  bio?: string | null;
  tech_stack?: string | string[] | null;
  projects?: PortfolioProject[] | null;
  custom_subdomain?: string | null;
  selected_template?: string | null;
};

function renderTemplate(
  template: string | null | undefined,
  props: PortfolioTemplateProps
) {
  switch (template) {
    case 'developer':
      return <PortfolioDeveloper {...props} />;
    case 'creative':
      return <PortfolioCreative {...props} />;
    case 'minimal':
    default:
      return <PortfolioMinimal {...props} />;
  }
}

export default async function PublicPortfolioView({
  params,
}: {
  params: Promise<{ subdomain?: string | string[] }>;
}) {
  const rawSubdomain = (await params)?.subdomain;
  const subdomainSlug = (Array.isArray(rawSubdomain)
    ? rawSubdomain[0]
    : rawSubdomain ?? ''
  )
    .toString()
    .toLowerCase()
    .trim();

  if (!subdomainSlug) {
    notFound();
  }

  const { data: portfolioData, error: portfolioError } = await supabase
    .from('portfolios')
    .select('*, profiles(full_name, avatar_url, cover_url)')
    .eq('custom_subdomain', subdomainSlug)
    .maybeSingle();

  if (portfolioError || !portfolioData) {
    notFound();
  }

  const portfolio = portfolioData as PortfolioRow;

  const developerName = portfolio?.profiles?.full_name || '';

  return (
    <main className="min-h-screen">
      {/* Cover Banner */}
      {portfolio?.profiles?.cover_url && (
        <div className="relative w-full overflow-hidden">
          <img
            src={portfolio.profiles.cover_url}
            alt="Cover"
            className="w-full h-64 object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-transparent"
          />
        </div>
      )}

      {/* Avatar overlapping the cover banner */}
      {portfolio?.profiles?.avatar_url && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 -mt-16 w-32 h-32 rounded-full border-2 border-slate-950 overflow-hidden"
        >
          <img
            src={portfolio.profiles.avatar_url}
            alt={`${developerName} avatar`}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      )}

      {/* Name and bio below avatar */}
      {developerName && (
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-bold text-slate-100">{developerName}</h1>
          {portfolio.bio && (
            <p className="mt-2 text-slate-400 text-sm">{portfolio.bio}</p>
          )}
        </div>
      )}

      {renderTemplate(portfolio.selected_template, {
        name: developerName || 'DevCraft Engineer',
        title: portfolio.title,
        bio: portfolio.bio,
        techStack: portfolio.tech_stack ?? [],
        projects: portfolio.projects ?? [],
        subdomain: portfolio.custom_subdomain || subdomainSlug,
        avatarUrl: portfolio?.profiles?.avatar_url ?? null,
      })}
    </main>
  );
}
