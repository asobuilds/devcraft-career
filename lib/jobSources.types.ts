export interface Job {
  source: string;
  title: string;
  company: string;
  location: string;
  url: string | null;
  description: string;
  salary: string | null;
  matchScore?: number;
  postedDate?: string | null;
  remote?: boolean;
}

export interface JobSearchOptions {
  country?: string;
  location?: string;
  minScore?: number;
  targetJobType?: 'tech' | 'finance' | 'creative' | 'graduate' | string;
}
