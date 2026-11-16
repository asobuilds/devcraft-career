import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

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

async function analyzeWithClaude(resumeText: string, jobDescription: string) {
  const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Compare the following resume text against the job description and return ONLY valid JSON in this exact format:
{"score": number (0-100), "missingKeywords": ["string"], "passedKeywords": ["string"], "feedback": "string"}

Job Description:
${jobDescription.slice(0, 4000)}

Resume Text:
${resumeText.slice(0, 6000)}`;

  const result = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!result.ok) throw new Error('Claude API error: ' + result.status);
  const data = await result.json();
  const text = data.content?.[0]?.text || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid JSON response from Claude');
  return JSON.parse(match[0]);
}

async function analyzeWithGemini(resumeText: string, jobDescription: string) {
  const prompt = `You are an expert ATS resume analyzer. Compare the following resume text against the job description and return ONLY valid JSON in this exact format:
{"score": number (0-100), "missingKeywords": ["string"], "passedKeywords": ["string"], "feedback": "string"}

Job Description:
${jobDescription.slice(0, 4000)}

Resume Text:
${resumeText.slice(0, 6000)}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const result = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!result.ok) throw new Error('Gemini API error: ' + result.status);
  const data = await result.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid JSON response from Gemini');
  return JSON.parse(match[0]);
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
      let aiAnalysis = null;
      if (ANTHROPIC_API_KEY) {
        aiAnalysis = await analyzeWithClaude(resumeText, jobDescription);
      } else if (GEMINI_API_KEY) {
        aiAnalysis = await analyzeWithGemini(resumeText, jobDescription);
      }

      const strict = strictKeywordMatchScore(resumeText, jobDescription);
      analysis = {
        ...aiAnalysis,
        ...strict,
      };
    } catch {
      analysis = strictKeywordMatchScore(resumeText, jobDescription);
    }

    return NextResponse.json({ success: true, ...analysis }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed: ' + ((error as Error).message) }, { status: 500 });
  }
}
