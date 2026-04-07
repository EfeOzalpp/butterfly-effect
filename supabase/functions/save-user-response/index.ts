import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@sanity/client@6";

type Weights = {
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  q5?: number;
};

type SaveUserResponsePayload = {
  section?: string;
  weights?: Weights;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const clamp01 = (v?: number) =>
  typeof v === "number" ? Math.max(0, Math.min(1, v)) : undefined;

const round3 = (v?: number) =>
  typeof v === "number" ? Math.round(v * 1000) / 1000 : undefined;

const computeAvg = (w: Weights) => {
  const vals = [w.q1, w.q2, w.q3, w.q4, w.q5].filter(
    (x): x is number => Number.isFinite(x),
  );
  if (!vals.length) return undefined;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
};

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required secret: ${name}`);
  return value;
}

const sanity = createClient({
  projectId: getRequiredEnv("SANITY_PROJECT_ID"),
  dataset: getRequiredEnv("SANITY_DATASET"),
  apiVersion: Deno.env.get("SANITY_API_VERSION") ?? "2022-03-07",
  useCdn: false,
  token: getRequiredEnv("SANITY_TOKEN"),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { section, weights }: SaveUserResponsePayload = await req.json();

    if (typeof section !== "string" || section.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Invalid section" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clamped: Weights = {
      q1: round3(clamp01(weights?.q1)),
      q2: round3(clamp01(weights?.q2)),
      q3: round3(clamp01(weights?.q3)),
      q4: round3(clamp01(weights?.q4)),
      q5: round3(clamp01(weights?.q5)),
    };

    const avgWeight = round3(computeAvg(clamped));

    const doc: Record<string, unknown> = {
      _type: "userResponseV4",
      section: section.trim(),
      ...clamped,
      ...(typeof avgWeight === "number" ? { avgWeight } : {}),
      submittedAt: new Date().toISOString(),
    };

    const created = await sanity.create(doc);

    return new Response(JSON.stringify(created), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
