const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function readText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const apiKey = Deno.env.get('JOOBLE_API_KEY');
    if (!apiKey) {
      return jsonResponse({ error: 'JOOBLE_API_KEY secret is not configured' }, 500);
    }

    const url = new URL(req.url);
    let search = readText(url.searchParams.get('search'), 'developer');
    let location = readText(url.searchParams.get('location'), 'Nigeria');

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        search = readText(body?.search, search);
        location = readText(body?.location, location);
      } catch {
        return jsonResponse({ error: 'Request body must be valid JSON' }, 400);
      }
    }

    const joobleResponse = await fetch(`https://jooble.org/api/${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: search, location }),
    });

    const rawBody = await joobleResponse.text();
    let payload: unknown = {};
    if (rawBody) {
      try {
        payload = JSON.parse(rawBody);
      } catch {
        payload = { raw: rawBody };
      }
    }

    if (!joobleResponse.ok) {
      const message =
        joobleResponse.status === 429
          ? 'Jooble rate limit reached. Please try again shortly.'
          : `Jooble API failed with status ${joobleResponse.status}`;
      return jsonResponse(
        { error: message, status: joobleResponse.status },
        joobleResponse.status === 429 ? 429 : 502,
      );
    }

    return jsonResponse(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return jsonResponse({ error: message }, 500);
  }
});
