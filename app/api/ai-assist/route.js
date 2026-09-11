import { NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

function fallbackImprove(text) {
  let improved = text.trim();

  const weakPhrases = [
    { find: /\bresponsible for\b/gi, replace: 'Managed' },
    { find: /\bhelped with\b/gi, replace: 'Contributed to' },
    { find: /\bworked on\b/gi, replace: 'Developed' },
    { find: /\bdid\b/gi, replace: 'Executed' },
  ];

  for (const pair of weakPhrases) {
    improved = improved.replace(pair.find, pair.replace);
  }

  if (improved.length > 0) {
    improved = improved.charAt(0).toUpperCase() + improved.slice(1);
  }

  if (!/[.!]$/.test(improved) && improved.length > 0) {
    improved = improved + '.';
  }

  return improved;
}

async function improveWithClaude(fieldType, text) {
  const instruction =
    fieldType === 'summary'
      ? 'Rewrite this as a punchy, professional CV summary in 1-2 sentences. Use active language. Return only the rewritten text, nothing else.'
      : 'Rewrite this as a strong, achievement-focused CV bullet point. Use an action verb, keep it concise, and highlight impact or results if implied. Return only the rewritten text, nothing else.';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [
        { role: 'user', content: instruction + '\n\nText: ' + text },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('AI request failed with status ' + response.status);
  }

  const data = await response.json();
  const textBlock = data.content && data.content[0] ? data.content[0].text : null;
  return textBlock ? textBlock.trim() : text;
}

export async function POST(request) {
  try {
    const { fieldType, text } = await request.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ improvedText: text || '' }, { status: 200 });
    }

    if (ANTHROPIC_API_KEY) {
      try {
        const improved = await improveWithClaude(fieldType, text);
        return NextResponse.json({ improvedText: improved }, { status: 200 });
      } catch (aiError) {
        const improved = fallbackImprove(text);
        return NextResponse.json({ improvedText: improved }, { status: 200 });
      }
    }

    const improved = fallbackImprove(text);
    return NextResponse.json({ improvedText: improved }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'AI assist failed: ' + error.message }, { status: 500 });
  }
}