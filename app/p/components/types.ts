export type PortfolioProject = {
  id?: string;
  title?: string;
  description?: string;
  liveUrl?: string;
  repoUrl?: string;
  languages?: string;
};

export type PortfolioTemplateProps = {
  name: string;
  title?: string | null;
  bio?: string | null;
  techStack?: string | string[] | null;
  projects?: PortfolioProject[] | null;
  subdomain?: string | null;
};

export function parseTechStack(
  techStack: string | string[] | null | undefined
): string[] {
  if (!techStack) return [];

  if (Array.isArray(techStack)) {
    return techStack.map((tech) => String(tech).trim()).filter(Boolean);
  }

  return techStack
    .split(/[,\n]/)
    .map((tech) => tech.trim())
    .filter(Boolean);
}
