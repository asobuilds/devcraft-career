import { NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const FALLBACK_QUESTIONS = [
  'Tell me about yourself and your background.',
  'Why are you interested in this role?',
  'Describe a challenge you faced at work and how you handled it.',
  'Tell me about a time you worked well under pressure.',
  'Where do you see yourself in three to five years?',
  'What is a mistake you made and what did you learn from it?',
  'Why should we hire you over other candidates?',
  'Do you have any questions for us?',
];

const FALLBACK_TIPS = [
  'Arrive (or log in) at least 5 minutes early.',
  'Research the company beforehand — know what they do and why you want to work there.',
  'Use the STAR method for behavioral questions: Situation, Task, Action, Result.',
  'Prepare 2-3 thoughtful questions to ask the interviewer.',
  'Send a short thank-you message within 24 hours after the interview.',
  'Dress appropriately for the company culture, even for virtual interviews.',
];

function buildFallbackResponse(skills) {
  const skillQuestions = (skills || '')
    .split(',')
    .map(function (s) { return s.trim(); })
    .filter(Boolean)
    .slice(0, 2)
    .map(function (skill) { return 'Can you walk me through your experience with ' + skill + '?'; });

  return {
    questions: FALLBACK_QUESTIONS.concat(skillQuestions),
    tips: FALLBACK_TIPS,
  };
}

async function generateWithClaude(jobTitle, company, jobDescription, skills) {
  const context =
    'Job title: ' + (jobTitle || 'Not specified') +
    '\nCompany: ' + (company || 'Not specified') +
    '\nCandidate skills: ' + (skills || 'Not specified') +
    (jobDescription ? '\nJob description:\n' + jobDescription.slice(0, 2000) : '');

  const instruction =
    'Based on the job context below, generate interview preparation content. Return ONLY valid JSON, no other text, ' +
    'matching exactly this shape: {"questions": ["...", "..."], "tips": ["...", "..."]}. ' +
    'Give 8 realistic interview questions specific to this role (mix behavioral and role-specific), and 6 practical, specific work ethics and professionalism tips relevant to this job and company.\n\n' +
    context;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      messages: [{ role: 'user', content: instruction }],
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

  return JSON.parse(jsonMatch[0]);
}

export async function POST(request) {
  try {
    const { jobTitle, company, jobDescription, skills } = await request.json();

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: true,
        aiGenerated: false,
        data: buildFallbackResponse(skills),
      }, { status: 200 });
    }

    try {
      const generated = await generateWithClaude(jobTitle, company, jobDescription, skills);
      return NextResponse.json({ success: true, aiGenerated: true, data: generated }, { status: 200 });
    } catch (aiError) {
      return NextResponse.json({
        success: true,
        aiGenerated: false,
        data: buildFallbackResponse(skills),
      }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Interview prep generation failed: ' + error.message }, { status: 500 });
  }
}