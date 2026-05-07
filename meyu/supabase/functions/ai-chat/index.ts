import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM_PROMPT = `You are MEYU's premium fashion stylist AI. You help users find clothes from MEYU's catalog.

You ONLY recommend products from the MEYU database — NEVER invent products.

Process every user message in two phases:
1. Extract intent (gender, category, occasion, color, price range, style keywords).
2. Decide if you should query the catalog. If yes, call the "search_products" tool.

Then write a warm, concise stylist reply (1-3 sentences) in plain text. Keep tone elegant, like a luxury concierge. Use markdown for emphasis sparingly.

Categories you can filter by:
- Women: dresses, tops, co-ord-sets, ethnic-wear
- Men: shirts, suits, blazers, ethnic-wear, bottoms

If the user asks for "wedding", "festive", "party" → suggest ethnic-wear or suits.
If "casual" → tops/shirts.
If "formal" → suits/blazers/shirts.

If gender is unclear AND the page context says one, use the page context. If still unclear, ask.

Never make up product names or prices.`;

const tools = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Search MEYU product catalog by gender, category, keywords, and price range.",
      parameters: {
        type: "object",
        properties: {
          gender: { type: "string", enum: ["men", "women", "any"] },
          category: { type: "string", description: "e.g. shirts, dresses, ethnic-wear, suits, blazers, tops, co-ord-sets, bottoms" },
          keywords: { type: "string", description: "Free-text keywords to match against product name/description" },
          max_price: { type: "number" },
          min_price: { type: "number" },
          limit: { type: "number", default: 6 },
        },
        required: ["gender"],
        additionalProperties: false,
      },
    },
  },
];

async function searchProducts(args: any) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  let q = supabase.from("products").select("id,name,description,price,original_price,images,category,gender").limit(args.limit || 6);
  if (args.gender && args.gender !== "any") q = q.eq("gender", args.gender);
  if (args.category) q = q.eq("category", args.category);
  if (args.max_price) q = q.lte("price", args.max_price);
  if (args.min_price) q = q.gte("price", args.min_price);
  if (args.keywords) q = q.or(`name.ilike.%${args.keywords}%,description.ilike.%${args.keywords}%`);
  const { data, error } = await q;
  if (error) return [];
  return data || [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { messages, context } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ctxNote = context ? `\n\n[Page context] gender=${context.gender || "unknown"}, route=${context.route || "/"}` : "";
    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT + ctxNote },
      ...messages,
    ];

    // Phase 1: ask model with tools
    const r1 = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: fullMessages,
        tools,
        tool_choice: "auto",
      }),
    });

    if (r1.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (r1.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!r1.ok) {
      const t = await r1.text();
      console.error("AI error", r1.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const j1 = await r1.json();
    const msg1 = j1.choices?.[0]?.message;
    let products: any[] = [];

    // Tool call?
    const toolCall = msg1?.tool_calls?.[0];
    if (toolCall?.function?.name === "search_products") {
      const args = JSON.parse(toolCall.function.arguments || "{}");
      products = await searchProducts(args);

      // Phase 2: respond with tool result
      const r2 = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            ...fullMessages,
            msg1,
            { role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ count: products.length, products: products.map(p => ({ id: p.id, name: p.name, price: p.price, category: p.category })) }) },
          ],
        }),
      });
      const j2 = await r2.json();
      const reply = j2.choices?.[0]?.message?.content || "Here are some pieces I found for you.";
      return new Response(JSON.stringify({ reply, products }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ reply: msg1?.content || "How can I help you style today?", products: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat err", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
