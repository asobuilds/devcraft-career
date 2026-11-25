import React from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PortfolioMinimal from '@/app/p/components/PortfolioMinimal';
import PortfolioDeveloper from '@/app/p/components/PortfolioDeveloper';
import PortfolioCreative from '@/app/p/components/PortfolioCreative';
import UserHeader from '@/app/components/UserHeader';
import type {
  PortfolioProject,
  PortfolioTemplateProps,
} from '@/app/p/components/types';

type PortfolioProfiles = {
  full_name?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
};

type PortfolioRow = {
  user_id: string;
  title?: string | null;
  bio?: string | null;
  tech_stack?: string | string[] | null;
  projects?: PortfolioProject[] | null;
  custom_subdomain?: string | null;
  selected_template?: string | null;
  profiles?: PortfolioProfiles | null;
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

  console.log('Portfolio data:', portfolioData);

  if (portfolioError || !portfolioData) {
    notFound();
  }

  const portfolio = portfolioData as PortfolioRow;

  const developerName = portfolio?.profiles?.full_name || '';

  return (
    <main className="min-h-screen">
      <UserHeader
        avatarUrl={portfolio?.profiles?.avatar_url ?? null}
        coverUrl={portfolio?.profiles?.cover_url ?? null}
        name={developerName || null}
      />
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
