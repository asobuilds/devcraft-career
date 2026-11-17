import { convertToModelMessages, createUIMessageStream, streamText, type UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 30;

const applicationSchema = z.object({
  company_name: z.string().nullish(),
  job_title: z.string().nullish(),
  status: z.string().nullish(),
  salary_range: z.string().nullish(),
  notes: z.string().nullish(),
});

const contextSchema = z.object({
  page: z.string().nullish(),
  userName: z.string().nullish(),
  userSkills: z.array(z.string()).nullish(),
  jobDescription: z.string().nullish(),
  resumeText: z.string().nullish(),
  coverLetter: z.string().nullish(),
  applications: z.array(applicationSchema).nullish(),
});

const bodySchema = z.object({
  messages: z.array(z.unknown()),
  context: contextSchema.optional(),
});

function buildSystemPrompt(context: z.infer<typeof contextSchema>) {
  const userName = context.userName?.trim() || 'General User';
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
    `The user's name is ${userName}. They have the following skills: ${skills}.`,
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
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        writer.write({
          type: 'text-delta',
          id: 'offline',
          delta: 'AI is currently offline. Please add your OPENAI_API_KEY to the environment.',
        });
      },
    });
    return new Response(stream);
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (
    !rawBody ||
    typeof rawBody !== 'object' ||
    !Array.isArray((rawBody as { messages?: unknown }).messages)
  ) {
    return Response.json(
      { error: 'Invalid request body: "messages" must be an array.' },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    console.error(
      '[AI Assistant] Zod validation failed:',
      parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }))
    );
    return Response.json(
      {
        error:
          'Invalid request body: ' +
          parsed.error.issues
            .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
            .join('; '),
      },
      { status: 400 }
    );
  }

  const payload = parsed.data;

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: buildSystemPrompt(payload.context ?? {}),
    messages: await convertToModelMessages(payload.messages as UIMessage[]),
  });

  return result.toUIMessageStreamResponse();
}
