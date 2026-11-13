import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

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

const COMMON_KEYWORDS = [
  'react', 'typescript', 'javascript', 'python', 'sql', 'node', 'aws', 'docker',
  'agile', 'scrum', 'git', 'ci/cd', 'graphql', 'tailwind', 'next.js', 'testing',
  'mongodb', 'postgresql', 'express', 'vue', 'angular', 'flask', 'django',
  'kubernetes', 'linux', 'rest api', 'microservices', 'serverless', 'redis',
  'finance', 'accounting', 'analyst', 'excel', 'leadership', 'communication'
];

function ruleBasedAnalysis(resumeText: string, jobDescription: string) {
  const jobLower = jobDescription.toLowerCase();
  const resumeLower = resumeText.toLowerCase();

  const relevantKeywords = COMMON_KEYWORDS.filter((kw) => jobLower.includes(kw));
  const passed: string[] = [];
  const missing: string[] = [];

  if (relevantKeywords.length === 0) {
    // extract words from job description if none of common match
    const words = jobLower.replace(/[^\w\s]/g, '').split(/\s+/).filter((w) => w.length > 4);
    const uniqueWords = Array.from(new Set(words)).slice(0, 15);
    for (const w of uniqueWords) {
      if (resumeLower.includes(w)) {
        passed.push(w);
      } else {
        missing.push(w);
      }
    }
  } else {
    for (const kw of relevantKeywords) {
      if (resumeLower.includes(kw)) {
        passed.push(kw);
      } else {
        missing.push(kw);
      }
    }
  }

  const total = passed.length + missing.length;
  const score = total > 0 ? Math.round((passed.length / total) * 100) : 65;

  let feedback = '';
  if (score >= 75) {
    feedback = 'Excellent alignment! Your resume closely matches the key requirements and keywords of the job description.';
  } else if (score >= 50) {
    feedback = 'Moderate match. Consider integrating more targeted keywords and action metrics to pass strict ATS filters.';
  } else {
    feedback = 'Low keyword overlap. Your resume is missing several critical technical terms mentioned in the job description.';
  }

  return {
    score,
    missingKeywords: missing,
    passedKeywords: passed,
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

  const res = await fetch('https://api.anthropic.com/v1/messages', {
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

  if (!res.ok) throw new Error('Claude API error: ' + res.status);
  const data = await res.json();
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
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) throw new Error('Gemini API error: ' + res.status);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid JSON response from Gemini');
  return JSON.parse(match[0]);
}

export async function POST(request: Request) {
  try {
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
      if (ANTHROPIC_API_KEY) {
        analysis = await analyzeWithClaude(resumeText, jobDescription);
      } else if (GEMINI_API_KEY) {
        analysis = await analyzeWithGemini(resumeText, jobDescription);
      } else {
        analysis = ruleBasedAnalysis(resumeText, jobDescription);
      }
    } catch {
      analysis = ruleBasedAnalysis(resumeText, jobDescription);
    }

    return NextResponse.json({ success: true, ...analysis }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed: ' + ((error as Error).message) }, { status: 500 });
  }
}
