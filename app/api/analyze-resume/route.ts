import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { supabase } from '@/lib/supabase';
import { generateText } from 'ai';
import { z } from 'zod';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const runtime = 'nodejs';

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

const analysisSchema = z.object({
  score: z.number(),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  suggestions: z.array(
    z.object({
      original: z.string(),
      improved: z.string(),
      reason: z.string(),
    })
  ),
});

const PROVIDER_MODELS = [
  { name: 'Groq', model: groq('openai/gpt-oss-120b'), key: process.env.GROQ_API_KEY },
  { name: 'Gemini', model: gemini('gemini-2.0-flash'), key: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY },
  { name: 'Agnes', model: agnes('agnes-3.0-flash'), key: process.env.AGNES_API_KEY },
];

async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = file.name || '';
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith('.pdf')) {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (lowerName.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer: buffer });
    return result.value;
  }

  return buffer.toString('utf-8');
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'can',
  'could', 'did', 'do', 'does', 'doing', 'done', 'during', 'each', 'eg',
  'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her',
  'here', 'hers', 'him', 'his', 'how', 'i', 'if', 'in', 'into', 'is',
  'it', 'its', 'just', 'like', 'me', 'more', 'most', 'my', 'neither',
  'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'one', 'only', 'or',
  'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same',
  'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
  'was', 'we', 'well', 'were', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'will', 'with', 'would', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'the', 'job', 'role', 'position', 'company',
  'work', 'team', 'candidate', 'candidates', 'years', 'year', 'month',
  'months', 'day', 'days', 'week', 'weeks', 'time', 'times', 'new',
  'full', 'part', 'time', 'based', 'remote', 'hybrid', 'on', 'site',
  'minimum', 'less', 'plus', 'salary', 'negotiable', 'benefits', 'perks',
  'etc', 'ie', 'vs', 'via', 'per', 'may', 'must', 'shall', 'should',
  'could', 'would', 'will', 'can', 'must', 'need', 'able', 'required',
  'preferred', 'nice', 'to', 'have', 'plus', 'or', 'and'
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s/]+/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));
}

function strictKeywordMatchScore(resumeText: string, jobDescription: string) {
  const keywords = Array.from(new Set(extractKeywords(jobDescription)));
  const resumeLower = resumeText.toLowerCase();

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const keyword of keywords) {
    if (resumeLower.includes(keyword)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }

  const total = matchedKeywords.length + missingKeywords.length;
  const score = total > 0 ? Math.round((matchedKeywords.length / total) * 100) : 0;

  let feedback = '';
  if (score >= 75) {
    feedback = 'Excellent keyword alignment. Your resume closely matches the job description.';
  } else if (score >= 50) {
    feedback = 'Moderate match. Consider adding the missing keywords naturally into your resume.';
  } else {
    feedback = 'Low keyword overlap. Your resume is missing many key terms from the job description.';
  }

  return {
    score,
    matchedKeywords,
    missingKeywords,
    feedback,
  };
}

async function analyzeWithProvider(
  model: (typeof PROVIDER_MODELS)[number]['model'],
  resumeText: string,
  jobDescription: string
): Promise<z.infer<typeof analysisSchema>> {
  const system = `You are an expert ATS optimizer and CV writer for the Nigerian job market.
Analyze the resume against the job description. Return a JSON object with: score (0-100), matchedKeywords (array), missingKeywords (array), and suggestions (array of objects).
Each suggestion MUST have exactly three fields:
- original: The exact line from the user's resume that needs improvement.
- improved: The exact rewritten line that includes the missing keyword(s) and uses strong action verbs with metrics, following the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z].
- reason: A brief explanation of why this change helps, for example "Added the missing keyword 'Docker' and quantified the impact".
Constraints: Do NOT invent experience. Only use information present in the original resume. If a keyword is missing but the user has related experience, suggest how to reframe it. If the user has no related experience, list it as a gap to learn.
Return ONLY a valid JSON object. Do not include any text before or after the JSON. Do not use markdown code fences.`;

  const prompt = `Job Description:
${jobDescription.slice(0, 4000)}

Resume Text:
${resumeText.slice(0, 6000)}`;

  const { text } = await generateText({
    model,
    system,
    prompt,
  });

  let jsonString = text.trim();
  if (jsonString.startsWith('```json')) {
    jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonString.startsWith('```')) {
    jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  const firstBrace = jsonString.indexOf('{');
  const lastBrace = jsonString.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('AI did not return JSON');
  }
  jsonString = jsonString.substring(firstBrace, lastBrace + 1);

  try {
    const parsed = JSON.parse(jsonString);
    return analysisSchema.parse(parsed);
  } catch (error) {
    console.error('[Analyze Resume] Failed to parse AI JSON:', error);
    throw new Error('AI did not return valid JSON');
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let resumeText = '';
    let jobDescription = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      jobDescription = (formData.get('jobDescription') as string) || '';

      if (file) {
        resumeText = await extractTextFromFile(file);
      }
      const rawTextParam = formData.get('resumeText') as string;
      if (!resumeText && rawTextParam) {
        resumeText = rawTextParam;
      }
    } else {
      const body = await request.json();
      resumeText = body.resumeText || '';
      jobDescription = body.jobDescription || '';
    }

    if (!jobDescription.trim()) {
      return NextResponse.json({ error: 'Job description is required.' }, { status: 400 });
    }

    if (!resumeText.trim()) {
      return NextResponse.json({ error: 'Resume text or file is required.' }, { status: 400 });
    }

    let analysis;
    try {
      const strict = strictKeywordMatchScore(resumeText, jobDescription);

      let aiAnalysis: z.infer<typeof analysisSchema> | null = null;
      for (const provider of PROVIDER_MODELS) {
        if (!provider.key) {
          continue;
        }

        try {
          aiAnalysis = await analyzeWithProvider(provider.model, resumeText, jobDescription);
          break;
        } catch (error) {
          console.error(`[Analyze Resume] ${provider.name} failed:`, error);
        }
      }

      if (!aiAnalysis) {
        return NextResponse.json({ error: 'All AI providers failed.' }, { status: 500 });
      }

      analysis = {
        ...aiAnalysis,
        ...strict,
      };
    } catch (error) {
      console.error('[Analyze Resume] All providers failed:', error);
      return NextResponse.json(
        { error: 'All AI providers failed.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, ...analysis }, { status: 200 });
  } catch (error) {
    console.error('[Analyze Resume] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Analysis failed: ' + ((error as Error).message || 'Unknown error') },
      { status: 500 }
    );
  }
}
