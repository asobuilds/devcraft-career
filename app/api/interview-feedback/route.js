import { NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'sort of', 'kind of', 'basically', 'literally'];

function buildFallbackFeedback(answer) {
  const wordCount = answer.trim().split(/\s+/).length;
  const lowerAnswer = answer.toLowerCase();
  const fillerCount = FILLER_WORDS.reduce(function (count, word) {
    const matches = lowerAnswer.split(word).length - 1;
    return count + matches;
  }, 0);
  const hasNumber = /\d/.test(answer);

  const notes = [];

  if (wordCount < 30) {
    notes.push('Your answer is quite short. Try adding more detail about the situation and what you specifically did.');
  }
  if (wordCount > 250) {
    notes.push('Your answer is fairly long. Try to keep it under 2 minutes when spoken out loud — aim for the key points.');
  }
  if (fillerCount > 2) {
    notes.push('Watch out for filler words (like "um", "you know") — practice pausing instead.');
  }
  if (!hasNumber) {
    notes.push('Consider adding a number or measurable result to make your impact concrete (e.g. "reduced errors by 20%").');
  }
  if (notes.length === 0) {
    notes.push('Solid structure. Make sure you clearly stated the Situation, Action, and Result.');
  }

  return notes.join(' ');
}

async function feedbackWithClaude(question, answer) {
  const instruction =
    'You are an interview coach. The candidate was asked this interview question:\n"' + question + '"\n\n' +
    'Their practice answer was:\n"' + answer + '"\n\n' +
    'Give brief, constructive feedback in 2-3 sentences: mention one strength and one specific improvement (e.g. structure, missing metrics, clarity). Be direct and encouraging. Return only the feedback text, nothing else.';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{ role: 'user', content: instruction }],
    }),
  });

  if (!response.ok) {
    throw new Error('AI request failed with status ' + response.status);
  }

  const data = await response.json();
  const textBlock = data.content && data.content[0] ? data.content[0].text : null;
  if (!textBlock) throw new Error('No content returned from AI');

  return textBlock.trim();
}

export async function POST(request) {
  try {
    const { question, answer } = await request.json();

    if (!answer || answer.trim().length === 0) {
      return NextResponse.json({ error: 'No answer provided' }, { status: 400 });
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ success: true, aiGenerated: false, feedback: buildFallbackFeedback(answer) }, { status: 200 });
    }

    try {
      const feedback = await feedbackWithClaude(question || '', answer);
      return NextResponse.json({ success: true, aiGenerated: true, feedback: feedback }, { status: 200 });
    } catch (aiError) {
      return NextResponse.json({ success: true, aiGenerated: false, feedback: buildFallbackFeedback(answer) }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Feedback generation failed: ' + error.message }, { status: 500 });
  }
}