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

type PortfolioRow = {
  user_id: string;
  title?: string | null;
  bio?: string | null;
  tech_stack?: string | string[] | null;
  projects?: PortfolioProject[] | null;
  custom_subdomain?: string | null;
  selected_template?: string | null;
};

type ProfileRow = {
  full_name?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
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

  // Fetch portfolio first
  const { data: portfolioData, error: portfolioError } = await supabase
    .from('portfolios')
    .select('*')
    .eq('custom_subdomain', subdomainSlug)
    .maybeSingle();

  console.log('Portfolio Query Result:', JSON.stringify(portfolioData, null, 2));

  if (portfolioError || !portfolioData) {
    notFound();
  }

  const portfolio = portfolioData as PortfolioRow;

  // Fetch profile separately to avoid join issues with anon key
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, cover_url')
    .eq('id', portfolio.user_id)
    .maybeSingle();

  console.log('Profile Query Result:', JSON.stringify(profileData, null, 2));
  console.log('Profile Error:', profileError);

  const developerName = profileData?.full_name || '';
  const avatarUrl = profileData?.avatar_url ?? null;
  const coverUrl = profileData?.cover_url ?? null;

  return (
    <main className="min-h-screen">
      <UserHeader
        avatarUrl={avatarUrl}
        coverUrl={coverUrl}
        name={developerName || null}
      />
      {renderTemplate(portfolio.selected_template, {
        name: developerName || 'DevCraft Engineer',
        title: portfolio.title,
        bio: portfolio.bio,
        techStack: portfolio.tech_stack ?? [],
        projects: portfolio.projects ?? [],
        subdomain: portfolio.custom_subdomain || subdomainSlug,
        avatarUrl,
      })}
    </main>
  );
}
