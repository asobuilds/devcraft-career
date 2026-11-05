export interface Job {
  source: string;
  title: string;
  company: string;
  location: string;
  url: string | null;
  description: string;
  salary: string | null;
  matchScore?: number;
}

export interface JobSearchOptions {
  country?: string;
  location?: string;
  minScore?: number;
}
