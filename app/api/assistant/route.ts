import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 30;

const applicationSchema = z.object({
  company_name: z.string().optional(),
  job_title: z.string().optional(),
  status: z.string().optional(),
  salary_range: z.string().optional(),
  notes: z.string().optional(),
});

const contextSchema = z.object({
  page: z.string().optional(),
  userName: z.string().optional(),
  userSkills: z.array(z.string()).optional(),
  isPremium: z.boolean().optional(),
  jobDescription: z.string().optional(),
  resumeText: z.string().optional(),
  coverLetter: z.string().optional(),
  applications: z.array(applicationSchema).optional(),
});

const bodySchema = z.object({
  messages: z.array(z.unknown()),
  context: contextSchema.optional(),
});

function buildSystemPrompt(context: z.infer<typeof contextSchema>) {
  const userName = context.userName?.trim() || 'the user';
  const premiumLabel = context.isPremium ? 'Premium' : 'Free';
  const page = context.page || 'career workspace';
  const skills =
    context.userSkills && context.userSkills.length > 0
      ? context.userSkills.join(', ')
      : 'not provided yet';

  const sections: string[] = [
    `You are DevCraft Career AI, helping ${userName} on the ${page} page.`,
    `They are a ${premiumLabel} user with skills: ${skills}.`,
    'Provide highly specific advice grounded in the context below. Never invent facts about the candidate.',
    'Keep answers concise, using short paragraphs or bullet points.',
  ];

  if (context.page === 'analyzer') {
    sections.push(
      'Focus on keyword gaps between the resume and the job description, and suggest concrete additions or rewrites.'
    );
  } else if (context.page === 'cover-letter') {
    sections.push(
      `Write in ${userName}'s voice, naturally using their skills (${skills}), and tailor the tone to the job description.`
    );
  } else if (context.page === 'tracker') {
    sections.push(
      'Help prioritize applications by status, fit, and momentum, and recommend the next concrete action for each.'
    );
  }

  if (context.jobDescription) {
    sections.push(`Target job description:\n${context.jobDescription}`);
  }

  if (context.resumeText) {
    sections.push(`Candidate resume:\n${context.resumeText}`);
  }

  if (context.coverLetter) {
    sections.push(`Current cover letter draft:\n${context.coverLetter}`);
  }

  if (context.applications && context.applications.length > 0) {
    const summarized = context.applications.map((application, index) => {
      const parts = [
        application.company_name,
        application.job_title,
        application.status,
        application.salary_range,
        application.notes,
      ].filter(Boolean);
      return `${index + 1}. ${parts.join(' — ')}`;
    });
    sections.push(`Job applications currently tracked:\n${summarized.join('\n')}`);
  }

  return sections.join('\n\n');
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: 'AI assistant is not configured. Set OPENAI_API_KEY.' },
      { status: 503 }
    );
  }

  let payload: z.infer<typeof bodySchema>;
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: 'Invalid request body.' }, { status: 400 });
    }
    payload = parsed.data;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: buildSystemPrompt(payload.context ?? {}),
    messages: await convertToModelMessages(payload.messages as UIMessage[]),
  });

  return result.toUIMessageStreamResponse();
}
