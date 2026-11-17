import {
  createUIMessageStream,
  streamText,
} from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
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
    page === 'tracker'
      ? 'They are currently on the Job Tracker page, a Kanban board where they can see all their job applications grouped into Wishlist, Applied, Interviewing, Offer, and Rejected columns.'
      : `They are currently on the ${page} page.`,
    '',
    'TASK RULES',
  ];

  if (context.page === 'analyzer') {
    sections.push(
      'If the user is on the Analyzer page, act as an expert ATS optimizer. Review the provided resume text against the job description. Point out exactly which keywords are missing and suggest how to rephrase bullet points to include them naturally.'
    );
  } else if (context.page === 'cover-letter') {
    sections.push(
      'Adjust the tone to be persuasive and professional, weaving in their skills.'
    );
  } else if (context.page === 'tracker') {
    sections.push(
      'The user can see every application card on their board, grouped by status: Wishlist (lead), Applied, Interviewing, Offer, and Rejected.',
      'Use the tracked applications below to give specific, prioritized advice. Reference companies and roles by name, mention which column each is in, and recommend concrete next moves such as following up, preparing for an interview, or moving stale applications to Rejected.',
      'Prioritize active opportunities (Interviewing and Offer) over stale Wishlist or Applied entries.'
    );
  } else {
    sections.push(
      'Provide practical, page-relevant career advice grounded in the context below.'
    );
  }

  sections.push(
    '',
    'FORMATTING',
    'Use Markdown so the response is easy to scan: open with one short sentence, then 2-5 bullet points starting with "- ". Put **bold** around key terms, company names, column names, and action labels. Do not use tables, code blocks, or long paragraphs.'
  );

  sections.push(
    '',
    'CONSTRAINTS',
    'Do NOT hallucinate experience. If you suggest adding a skill, tell them they need to acquire it first. Keep responses under 200 words.'
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

  if (context.page === 'tracker') {
    const boardStatuses = [
      { key: 'lead', label: 'Wishlist' },
      { key: 'applied', label: 'Applied' },
      { key: 'interviewing', label: 'Interviewing' },
      { key: 'offered', label: 'Offer' },
      { key: 'rejected', label: 'Rejected' },
    ];
    const applications = context.applications ?? [];
    const counts = boardStatuses
      .map(({ key, label }) => `${label}: ${applications.filter((application) => application.status === key).length}`)
      .join(', ');
    sections.push(`Board counts: ${counts}.`);
  }

  if (context.applications && context.applications.length > 0) {
    const statusLabels: Record<string, string> = {
      lead: 'Wishlist',
      applied: 'Applied',
      interviewing: 'Interviewing',
      offered: 'Offer',
      rejected: 'Rejected',
    };
    const summarized = context.applications.map((application, index) => {
      const parts = [
        application.company_name,
        application.job_title,
        application.status ? statusLabels[application.status] ?? application.status : null,
        application.salary_range,
        application.notes,
      ].filter(Boolean);
      return `${index + 1}. ${parts.join(' — ')}`;
    });
    sections.push(`Job applications currently tracked:\n${summarized.join('\n')}`);
  } else if (context.page === 'tracker') {
    sections.push(
      'The board is currently empty. Suggest that the user add a job with the "+ Add Job" button or load demo applications to explore the board.'
    );
  }

  return sections.join('\n\n');
}

const groq = createOpenAICompatible({
  name: 'groq',
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
});

const gemini = createOpenAICompatible({
  name: 'gemini',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
});

const agnes = createOpenAICompatible({
  name: 'agnes',
  baseURL: 'https://api.agnes-ai.cn/v1',
  apiKey: process.env.AGNES_API_KEY || '',
});

const PROVIDER_MODELS = [
  { name: 'Groq', model: groq('openai/gpt-oss-120b'), key: process.env.GROQ_API_KEY },
  { name: 'Gemini', model: gemini('gemini-2.0-flash'), key: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY },
  { name: 'Agnes', model: agnes('agnes-3.0-flash'), key: process.env.AGNES_API_KEY },
];

export async function POST(req: Request) {
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
  const systemPrompt = buildSystemPrompt(payload.context ?? {});

  const sanitizeMessages = (messages: unknown[]) =>
    messages
      .map((message) => {
        if (!message || typeof message !== 'object') return null;

        const msg = message as { role?: string; parts?: unknown };
        const role = msg.role === 'assistant' ? 'assistant' : 'user';

        let content = '';
        if (Array.isArray(msg.parts)) {
          content = msg.parts
            .filter((part): part is { type: string; text?: string } =>
              Boolean(part) && typeof part === 'object' && (part as Record<string, unknown>).type === 'text'
            )
            .map((part) => (typeof part.text === 'string' ? part.text : ''))
            .join('');
        }

        return { role, content: content.trim() };
      })
      .filter((message): message is { role: string; content: string } =>
        Boolean(message && message.content.length > 0)
      );

  const sanitizedMessages = sanitizeMessages(payload.messages);

  for (const provider of PROVIDER_MODELS) {
    if (!provider.key) {
      console.warn(`[AI Assistant] ${provider.name} skipped: missing API key`);
      continue;
    }

    try {
      const result = streamText({
        model: provider.model,
        system: systemPrompt,
        messages: sanitizedMessages as Array<{ role: 'user' | 'assistant'; content: string }>,
      });
      return result.toUIMessageStreamResponse();
    } catch (error) {
      console.error(`[AI Assistant] ${provider.name} failed:`, error);
    }
  }

  const fallbackStream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({
        type: 'text-delta',
        id: 'fallback',
        delta: 'All AI providers are currently unavailable. Please try again later.',
      });
    },
  });

  return new Response(fallbackStream);
}
