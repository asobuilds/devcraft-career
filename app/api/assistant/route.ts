import {
  createUIMessageStream,
  streamText,
  tool,
} from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

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

type VaultDocumentRow = {
  file_name: string | null;
  file_type: string | null;
  storage_path: string | null;
  extracted_text: string | null;
};

const cvUpdateSchema = z.object({
  summary: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        dates: z.string(),
        bullets: z.string(),
      })
    )
    .optional(),
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
      'Act as a cover-letter writing coach. If the user asks for help writing or improving a cover letter:',
      '1. First check the context for resume details (skills, summary, experience) and the job description.',
      '2. If the resume context is missing, ask the user to share their resume details or select a resume from the left panel.',
      '3. Then draft a 3-paragraph cover letter: opening with interest, middle matching their skills to the job requirements, closing with a call to action.',
      '4. Weave their actual skills into the draft; do not invent experience or skills that are not in the context.'
    );
  } else if (context.page === 'cv-builder') {
    sections.push(
      'You are a CV Co-Editor. If the user asks you to tailor, rewrite, or improve their CV for a job, use the tailorCvToJob tool to update the database. Provide the updated summary, skills, and experience bullets. Always confirm with the user before saving if it\'s a major change. ' +
        'When calling `tailorCvToJob`, you MUST provide the `updates` object with the exact fields: `summary` (string), `skills` (array of strings), and `experience` (array of objects with `company`, `role`, `dates`, `bullets`). ' +
        'Do NOT send partial data. If you are only updating the summary, only include the `summary` field. ' +
        'If you are adding a skill, send the FULL updated skills array, not just the new skill.'
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

  sections.push(
    '',
    'TOOLS',
    'You have access to tools that can edit the user\'s data. If the user asks you to "apply this change", "save it", or "update my record", use the appropriate tool to save it to their database.',
    'You have access to the user\'s Career Vault. If they ask to use a specific document (e.g., \'Use my NYSC certificate\'), call `fetchUserDocuments` to retrieve it.',
    '- Use `updateCoverLetter` to save a new cover letter draft to the cover_letters table.',
    '- Use `updateResumeBullets` to update the bullet points of a specific experience entry in the user\'s latest resume.',
    '- Use `tailorCvToJob` to write, update, or delete parts of the user\'s CV (summary, skills, and experience) in the database. Pass a `jobDescription` and an `updates` object with only the fields to change; providing `experience` replaces the full list.',
    'Always confirm in your response which tool you used and what was saved.',
  );

  sections.push(
    '',
    'CV EDITING RULES',
    'When tailoring a CV for a specific job description, focus on matching keywords, action verbs, and industry-specific terminology.',
    'If the user asks to "remove" a skill or experience, use the tool to update the array and remove that item.',
    'If the user asks to "add" a new experience, ask for the company, role, dates, and bullets, then use the tool to append it.',
    'Always keep the tone professional and ATS-friendly.'
  );

  if (context.page === 'analyzer' && !(context.resumeText || '').trim()) {
    sections.push(
      '',
      'ANALYZER WARNING',
      'The user is on the Analyzer page but no resume text has been provided yet. Advise them to paste their resume text into the Resume Text box before requesting an analysis.'
    );
  }

  if (context.page === 'analyzer' && !(context.jobDescription || '').trim()) {
    sections.push(
      '',
      'ANALYZER WARNING',
      'The user is on the Analyzer page but no job description has been provided yet. Advise them to paste the target job description into the Job Description box before requesting an analysis.'
    );
  }

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
  } else if (context.page === 'cv-builder') {
    sections.push(
      'You are a CV Co-Editor. If the user asks you to tailor, rewrite, or improve their CV for a job, use the tailorCvToJob tool to update the database. Provide the updated summary, skills, and experience bullets. Always confirm with the user before saving if it\'s a major change. ' +
        'When calling `tailorCvToJob`, you MUST provide the `updates` object with the exact fields: `summary` (string), `skills` (array of strings), and `experience` (array of objects with `company`, `role`, `dates`, `bullets`). ' +
        'Do NOT send partial data. If you are only updating the summary, only include the `summary` field. ' +
        'If you are adding a skill, send the FULL updated skills array, not just the new skill.'
    );
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

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: 'Invalid session' }, { status: 401 });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return Response.json({ error: 'Invalid session' }, { status: 401 });
  }

  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  );
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
  if (authError || !user) {
    return Response.json({ error: 'Invalid session' }, { status: 401 });
  }

  const userId = user.id;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[AI Assistant] Missing Supabase service role configuration.');
    return Response.json(
      { error: 'Server is missing Supabase service role credentials.' },
      { status: 500 }
    );
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const updateCoverLetter = tool({
    description:
      'Update the user\'s saved cover letter in the cover_letters table. Use this when the user asks to apply or save a new cover letter draft.',
    inputSchema: z.object({
      newText: z.string().describe('The full text of the new cover letter.'),
    }),
    execute: async ({ newText }) => {
      const { data, error } = await supabaseClient
        .from('cover_letters')
        .upsert(
          {
            user_id: userId,
            content: newText,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select('id, user_id, content, created_at, updated_at');

      if (error) {
        throw new Error('Failed to update cover letter: ' + error.message);
      }

      return { success: true, record: data?.[0] ?? null };
    },
  });

  const updateResumeBullets = tool({
    description:
      'Update the bullet points for a specific experience entry in the user\'s latest resume. Use this when the user asks to improve or rewrite a resume bullet.',
    inputSchema: z.object({
      experienceId: z.string().describe('The id of the experience entry to update.'),
      newBullets: z.string().describe('The new bullet text, one entry per line.'),
    }),
    execute: async ({ experienceId, newBullets }) => {
      const { data: resume, error: resumeError } = await supabaseClient
        .from('resumes')
        .select('id, experience')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (resumeError || !resume) {
        throw new Error('No resume found for this user.');
      }

      const experiences = Array.isArray(resume.experience) ? resume.experience : [];
      const index = experiences.findIndex(
        (entry: Record<string, unknown>) => entry.id === experienceId
      );

      if (index === -1) {
        throw new Error('Experience entry not found in resume.');
      }

      const updatedExperience = experiences.map(
        (entry: Record<string, unknown>, i: number) =>
          i === index
            ? { ...entry, bullets: newBullets }
            : entry
      ) as Array<Record<string, unknown>>;

      const { error: updateError } = await supabaseClient
        .from('resumes')
        .update({
          experience: updatedExperience,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resume.id);

      if (updateError) {
        throw new Error('Failed to update resume: ' + updateError.message);
      }

      return { success: true, resumeId: resume.id };
    },
  });

  const tailorCvToJob = tool({
    description:
      'Write, update, or delete parts of the user\'s latest CV (summary, skills, and experience) and save it to the resumes table. Use this when the user asks to tailor, rewrite, or improve their CV. ' +
      'When calling `tailorCvToJob`, you MUST provide the `updates` object with the exact fields: `summary` (string), `skills` (array of strings), and `experience` (array of objects with `company`, `role`, `dates`, `bullets`). ' +
      'Do NOT send partial data. If you are only updating the summary, only include the `summary` field. ' +
      'If you are adding a skill, send the FULL updated skills array, not just the new skill. ' +
      'Providing `experience` replaces the full list, so include every entry that should be kept.',
    inputSchema: z.object({
      jobDescription: z
        .string()
        .min(1)
        .describe('The full job description to tailor the CV for.'),
      updates: cvUpdateSchema.describe(
        'The CV fields to write. Omit a field to leave it unchanged. When `experience` is provided it replaces the existing list, so include every entry to keep and omit entries to delete.'
      ),
    }),
    execute: async ({ updates }) => {
      const { data: resume, error: resumeError } = await adminSupabase
        .from('resumes')
        .select('id, resume_title, summary, skills, experience')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (resumeError) {
        console.error(
          '[tailorCvToJob] Supabase resume lookup error:',
          resumeError
        );
        throw new Error('Failed to fetch resume: ' + resumeError.message);
      }
      if (!resume) {
        console.error(
          '[tailorCvToJob] No resume found for user:',
          userId
        );
        throw new Error('No resume found for this user. Please save a CV first.');
      }

      if (updates.experience !== undefined && !Array.isArray(updates.experience)) {
        console.error(
          '[tailorCvToJob] experience field is not an array, got:',
          typeof updates.experience
        );
        throw new Error(
          'Invalid experience data: expected an array, got ' +
            typeof updates.experience
        );
      }

      const hasSummary = updates.summary !== undefined && updates.summary !== '';
      const hasSkills =
        updates.skills !== undefined && updates.skills.length > 0;
      const hasExperience =
        updates.experience !== undefined && updates.experience.length > 0;

      if (!hasSummary && !hasSkills && !hasExperience) {
        throw new Error('No changes to save. Please provide specific updates.');
      }

      const existingExperience = Array.isArray(resume.experience)
        ? (resume.experience as Array<Record<string, unknown>>)
        : [];

      const mergedExperience = hasExperience
        ? (updates.experience as Array<{
            company: string;
            role: string;
            dates: string;
            bullets: string;
          }>).map((entry, index) => {
            const match =
              existingExperience.find(
                (existing) =>
                  existing.company === entry.company &&
                  existing.role === entry.role &&
                  existing.dates === entry.dates
              ) ?? existingExperience[index];

            const id =
              typeof match?.id === 'string' && match.id
                ? match.id
                : `exp-${Date.now()}-${index}`;

            return {
              id,
              company: entry.company,
              role: entry.role,
              dates: entry.dates,
              bullets: entry.bullets,
            };
          })
        : existingExperience;

      const upsertPayload: Record<string, unknown> = {
        user_id: userId,
        resume_title: resume.resume_title || 'My Tailored CV',
        summary: hasSummary ? updates.summary : (resume.summary ?? ''),
        skills: hasSkills
          ? updates.skills
          : Array.isArray(resume.skills)
            ? resume.skills
            : [],
        experience: mergedExperience,
        updated_at: new Date().toISOString(),
      };

      console.log(
        '[tailorCvToJob] Upserting CV payload:',
        JSON.stringify(upsertPayload, null, 2)
      );

      const { data: upsertedRow, error: updateError } = await adminSupabase
        .from('resumes')
        .upsert(upsertPayload, { onConflict: 'user_id' })
        .select('id, user_id, created_at, updated_at');

      if (updateError) {
        console.error('[tailorCvToJob] Supabase upsert error:', updateError);
        throw new Error(updateError.message);
      }

      return {
        success: true,
        resumeId: upsertedRow?.[0]?.id ?? resume.id,
        updatedFields: Object.keys(updates).filter(
          (key) => updates[key as keyof typeof updates] !== undefined
        ),
      };
    },
  });

  const fetchUserDocuments = tool({
    description:
      'Retrieve the user\'s Career Vault documents of a given type and return their extracted text. For image documents, return a temporary, signed file URL instead.',
    inputSchema: z.object({
      documentType: z
        .enum(['cv', 'nysc', 'passport', 'certificate'])
        .describe('The type of Career Vault document to retrieve.'),
    }),
    execute: async ({ documentType }) => {
      const { data, error } = await adminSupabase
        .from('documents')
        .select('file_name, file_type, storage_path, extracted_text')
        .eq('user_id', userId)
        .eq('file_type', documentType)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('[fetchUserDocuments] Supabase query error:', error);
        throw new Error('Failed to fetch documents: ' + error.message);
      }

      const documents = await Promise.all(
        ((data ?? []) as VaultDocumentRow[]).map(async (doc) => {
          const isImage = /\.(png|jpe?g|webp|gif|heic|heif|avif|bmp)$/i.test(
            doc.storage_path ?? ''
          );
          let fileUrl: string | null = null;

          if (isImage && doc.storage_path) {
            const { data: signedData, error: signedError } = await adminSupabase.storage
              .from('vault')
              .createSignedUrl(doc.storage_path, 60 * 60);

            if (signedError) {
              console.error('[fetchUserDocuments] Signed URL error:', signedError);
            } else {
              fileUrl = signedData?.signedUrl ?? null;
            }
          }

          return {
            fileName: doc.file_name ?? 'Untitled document',
            fileType: doc.file_type ?? documentType,
            extractedText: doc.extracted_text?.trim() || null,
            fileUrl,
          };
        })
      );

      return {
        success: true,
        documentType,
        count: documents.length,
        documents,
      };
    },
  });

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
        tools: {
          updateCoverLetter,
          updateResumeBullets,
          tailorCvToJob,
          fetchUserDocuments,
        },
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
