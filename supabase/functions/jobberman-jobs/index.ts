import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");
const APIFY_ACTOR_ID = Deno.env.get("APIFY_JOBBERMAN_ACTOR_ID") || "e.g-jobberman-actor-id";

serve(async (req) => {
  try {
    if (req.method !== "POST" && req.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!APIFY_API_TOKEN) {
      return new Response(JSON.stringify({ error: "APIFY_API_TOKEN is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    let keywords = "software engineer";
    let location = "Nigeria";

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.keywords) keywords = body.keywords;
        if (body.location) location = body.location;
      } catch (_e) {
        // use defaults if body parsing fails
      }
    } else {
      const url = new URL(req.url);
      const kw = url.searchParams.get("keywords");
      const loc = url.searchParams.get("location");
      if (kw) keywords = kw;
      if (loc) location = loc;
    }

    // Call Apify Actor run or dataset endpoint
    const runUrl = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs?token=${APIFY_API_TOKEN}`;
    const runResponse = await fetch(runUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        search: keywords,
        location: location,
        maxItems: 25,
      }),
    });

    if (!runResponse.ok) {
      // Fallback: If actor run fails or mock mode is requested, return mock/empty array or fetch dataset if run already finished
      return new Response(
        JSON.stringify({
          success: true,
          jobs: [],
          message: "Apify actor execution triggered or returned status " + runResponse.status,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const runData = await runResponse.json();
    const datasetId = runData.data?.defaultDatasetId;

    if (!datasetId) {
      return new Response(JSON.stringify({ success: true, jobs: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch items from Apify dataset
    const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}`;
    const datasetResponse = await fetch(datasetUrl);
    
    if (!datasetResponse.ok) {
      return new Response(JSON.stringify({ success: true, jobs: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const items = await datasetResponse.json();
    const jobs = Array.isArray(items)
      ? items.map((item) => ({
          source: "Jobberman (Apify)",
          title: item.title || item.position || "",
          company: item.company || item.companyName || "Unknown Company",
          location: item.location || "Nigeria",
          url: item.url || item.link || null,
          description: item.description || item.snippet || "",
          salary: item.salary || null,
          postedDate: item.postedDate || null,
        }))
      : [];

    return new Response(JSON.stringify({ success: true, jobs }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Edge function error: " + error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
