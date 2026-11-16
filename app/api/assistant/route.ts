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
  const userName = context.userName?.trim() || 'General User';
  const premiumLabel = context.isPremium ? 'Premium' : 'Free';
  const page = context.page || 'career workspace';
  const skills =
    context.userSkills && context.userSkills.length > 0
      ? context.userSkills.join(', ')
      : 'No skills provided';

  const sections: string[] = [
    'PERSONA',
    'You are the DevCraft Career AI, an expert ATS (Applicant Tracking System) optimizer and Career Coach.',
    '',
    'USER CONTEXT',
    `The user's name is ${userName}. They are a ${premiumLabel} user with the following skills: ${skills}.`,
    '',
    'PAGE CONTEXT',
    `They are currently on the ${page} page.`,
    '',
    'TASK RULES',
  ];

  if (context.page === 'analyzer') {
    sections.push(
      "Focus heavily on the jobDescription provided. Suggest which of the user's existing skills match, and warn them about missing keywords without inventing skills they don't have."
    );
  } else if (context.page === 'cover-letter') {
    sections.push(
      'Adjust the tone to be persuasive and professional, weaving in their skills.'
    );
  } else if (context.page === 'tracker') {
    sections.push(
      'Provide strategic advice on which job to prioritize based on their skills.'
    );
  } else {
    sections.push(
      'Provide practical, page-relevant career advice grounded in the context below.'
    );
  }

  sections.push(
    '',
    'CONSTRAINTS',
    'Do NOT hallucinate experience. If you suggest adding a skill, tell them they need to acquire it first. Keep responses under 200 words. Use bullet points for actionable advice.'
  );

  if (context.jobDescription) {
    sections.push('', 'JOB DESCRIPTION', context.jobDescription);
  }

  if (context.resumeText) {
    sections.push('', 'CANDIDATE RESUME', context.resumeText);
  }

  if (context.coverLetter) {
    sections.push('', 'CURRENT COVER LETTER DRAFT', context.coverLetter);
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
