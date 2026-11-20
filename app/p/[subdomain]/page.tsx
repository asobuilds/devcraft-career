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
    .select('*')
    .eq('custom_subdomain', subdomainSlug)
    .maybeSingle();

  if (portfolioError || !portfolioData) {
    notFound();
  }

  const portfolio = portfolioData as PortfolioRow;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', portfolio.user_id)
    .maybeSingle();

  const developerName = profile?.full_name || '';

  return (
    <main className="min-h-screen">
      {renderTemplate(portfolio.selected_template, {
        name: developerName || 'DevCraft Engineer',
        title: portfolio.title,
        bio: portfolio.bio,
        techStack: portfolio.tech_stack ?? [],
        projects: portfolio.projects ?? [],
        subdomain: portfolio.custom_subdomain || subdomainSlug,
      })}
    </main>
  );
}
