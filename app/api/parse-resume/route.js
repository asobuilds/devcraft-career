import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function extractTextFromFile(file) {
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

function buildFallbackResumeData(rawText) {
  return {
    fullName: '',
    email: '',
    phone: '',
    website: '',
    summary: rawText.slice(0, 500),
    skills: '',
    experience: [{ id: '1', company: '', role: '', dates: '', bullets: rawText.slice(0, 1000) }],
  };
}

async function parseWithClaude(rawText) {
  const instruction =
    'Extract resume information from the following text and return ONLY valid JSON, no other text, matching exactly this shape: ' +
    '{"fullName":"","email":"","phone":"","website":"","summary":"","skills":"comma,separated,skills","experience":[{"company":"","role":"","dates":"","bullets":""}]}. ' +
    'Combine all work history bullet points for each job into a single "bullets" string separated by newlines. If a field is not found, leave it as an empty string.';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: instruction + '\n\nResume text:\n' + rawText.slice(0, 8000) }],
    }),
  });

  if (!response.ok) {
    throw new Error('AI request failed with status ' + response.status);
  }

  const data = await response.json();
  const textBlock = data.content && data.content[0] ? data.content[0].text : null;
  if (!textBlock) throw new Error('No content returned from AI');

  const jsonMatch = textBlock.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not find JSON in AI response');

  const parsed = JSON.parse(jsonMatch[0]);

  if (!Array.isArray(parsed.experience)) {
    parsed.experience = [];
  }
  parsed.experience = parsed.experience.map(function (exp, index) {
    return {
      id: (index + 1).toString(),
      company: exp.company || '',
      role: exp.role || '',
      dates: exp.dates || '',
      bullets: exp.bullets || '',
    };
  });

  return parsed;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const rawText = await extractTextFromFile(file);

    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json({ error: 'Could not read any text from this file. Try a different file.' }, { status: 400 });
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: true,
        aiParsed: false,
        data: buildFallbackResumeData(rawText),
        message: 'AI parsing is not configured, so your resume text was extracted but not automatically organized. Please review and adjust the fields.',
      }, { status: 200 });
    }

    try {
      const parsedData = await parseWithClaude(rawText);
      return NextResponse.json({ success: true, aiParsed: true, data: parsedData }, { status: 200 });
    } catch (aiError) {
      return NextResponse.json({
        success: true,
        aiParsed: false,
        data: buildFallbackResumeData(rawText),
        message: 'AI parsing failed, so your resume text was extracted but not automatically organized. Please review and adjust the fields.',
      }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Resume import failed: ' + error.message }, { status: 500 });
  }
}