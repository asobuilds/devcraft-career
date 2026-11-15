import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

function formatResume(resumeData: any): string {
  if (typeof resumeData === 'string') return resumeData;
  if (!resumeData) return '';
  const { name = '', email = '', summary = '', skills = [], experience = [] } = resumeData;
  return `Name: ${name}
Email: ${email}
Summary: ${summary}
Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
Experience: ${Array.isArray(experience) ? experience.map((e: any) => `${e.role || e.title || ''} at ${e.company || ''}: ${e.description || e.details || ''}`).join('\n') : JSON.stringify(experience)}`;
}

function ruleBasedCoverLetter(resumeData: any, jobDescription: string): string {
  const name = (typeof resumeData === 'object' && resumeData?.name) ? resumeData.name : 'Candidate';
  const skills = (typeof resumeData === 'object' && Array.isArray(resumeData?.skills)) ? resumeData.skills.slice(0, 5).join(', ') : 'relevant technical skills';
  
  let jobTitle = 'the position';
  if (typeof jobDescription === 'string' && jobDescription.length > 0) {
    const lines = jobDescription.split('\n');
    if (lines.length > 0 && lines[0].length < 60) {
      jobTitle = lines[0].trim();
    }
  }

  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} role. With a proven track record in building high-performing applications and expertise in ${skills}, I am confident in my ability to bring immediate value to your team. My background aligns closely with the goals outlined in your job description, and I am eager to contribute my technical acumen and problem-solving skills to your organization.

Throughout my career, I have focused on delivering robust solutions, collaborating across cross-functional teams, and maintaining high standards of code quality and performance. The challenges described in your job description resonate deeply with my professional experience, particularly my proficiency in modern engineering practices and swift adaptability to new domains.

Thank you for considering my application. I welcome the opportunity to discuss how my skills and experiences make me an ideal fit for your team. I look forward to the possibility of speaking with you soon.

Sincerely,
${name}`;
}

async function generateWithClaude(prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) throw new Error('Claude API error: ' + res.status);
  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Claude');
  return text.trim();
}

async function generateWithGemini(prompt: string): Promise<string> {
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
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text.trim();
}

export async function POST(request: Request) {
  try {
    const { resumeData, jobDescription } = await request.json();

    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const formattedResume = formatResume(resumeData);
    const prompt = `You are an expert career coach. Write a compelling cover letter based on this resume and job description. Keep it under 300 words.

Job Description:
${typeof jobDescription === 'string' ? jobDescription.slice(0, 4000) : JSON.stringify(jobDescription).slice(0, 4000)}

Resume Data:
${formattedResume.slice(0, 4000)}`;

    let coverLetter = '';

    if (ANTHROPIC_API_KEY) {
      try {
        coverLetter = await generateWithClaude(prompt);
      } catch (e) {
        console.error('Claude generation failed, trying Gemini or fallback:', e);
      }
    }

    if (!coverLetter && GEMINI_API_KEY) {
      try {
        coverLetter = await generateWithGemini(prompt);
      } catch (e) {
        console.error('Gemini generation failed, using rule-based fallback:', e);
      }
    }

    if (!coverLetter) {
      coverLetter = ruleBasedCoverLetter(resumeData, jobDescription);
    }

    return NextResponse.json({ coverLetter }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Cover letter generation failed: ' + error.message }, { status: 500 });
  }
}
