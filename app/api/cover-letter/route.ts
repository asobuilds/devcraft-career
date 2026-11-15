import { NextResponse } from 'next/server';

interface GenerateInput {
  resumeId: string | null;
  skillsInput: string;
  jobDescription: string;
}

interface GenerateOutput {
  coverLetter: string;
}

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const resumeId = payload.resumeId as string | null;
  const skillsInput = readString(payload.skillsInput, '');
  const jobDescription = readString(payload.jobDescription, '');

  if (!jobDescription.trim()) {
    return NextResponse.json(
      { error: 'Job description is required.' },
      { status: 400 },
    );
  }

  const skills = resumeId
    ? getSkillsFromResume(resumeId)
    : normalizeSkills(skillsInput);

  const coverLetter = generateCoverLetter(skills, jobDescription);

  return NextResponse.json<GenerateOutput>({ coverLetter });
}

function readString(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed : fallback;
}

function normalizeSkills(skillsInput: string): string {
  return skillsInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .join(', ');
}

function getSkillsFromResume(resumeId: string): string {
  // In a real implementation, this would fetch from Supabase
  // For now, return empty string - the UI allows manual paste fallback
  return '';
}

function generateCoverLetter(skills: string, jobDescription: string): string {
  const skillsList = skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5)
    .join(', ');

  return `Dear Hiring Manager,

I am writing to enthusiastically apply for the position described. With my background in ${skillsList}, I am confident that my skills align well with the requirements you've outlined.

${jobDescription.substring(0, 300)}${jobDescription.length > 300 ? '...' : ''}

Thank you for considering my application. I look forward to the opportunity to discuss how my experience and abilities can contribute to your team's success.

Sincerely,

[Your Name]
`;
}