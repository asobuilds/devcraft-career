'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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

export default function PublicPortfolioView() {
  const params = useParams<{ subdomain?: string | string[] }>();
  const rawSubdomain = Array.isArray(params?.subdomain)
    ? params.subdomain[0]
    : params?.subdomain;
  const subdomainSlug = (rawSubdomain ? String(rawSubdomain) : '')
    .toLowerCase()
    .trim();

  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioRow | null>(null);
  const [developerName, setDeveloperName] = useState('');

  useEffect(() => {
    const fetchPublicPortfolio = async () => {
      if (!subdomainSlug) {
        setLoading(false);
        return;
      }

      const { data: portfolioData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('custom_subdomain', subdomainSlug)
        .maybeSingle();

      if (portfolioData) {
        setPortfolio(portfolioData as PortfolioRow);

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', portfolioData.user_id)
          .maybeSingle();

        if (profile) setDeveloperName(profile.full_name || '');
      }
      setLoading(false);
    };

    fetchPublicPortfolio();
  }, [subdomainSlug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-white text-neutral-500">
        <Loader2 className="animate-spin text-neutral-900" size={20} />
        <span>Loading portfolio...</span>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-sm text-neutral-500">
        The requested portfolio could not be found.
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {renderTemplate(portfolio.selected_template, {
        name: developerName || 'DevCraft Engineer',
        title: portfolio.title,
        bio: portfolio.bio,
        techStack: portfolio.tech_stack,
        projects: portfolio.projects,
        subdomain: portfolio.custom_subdomain || subdomainSlug,
      })}
    </main>
  );
}
