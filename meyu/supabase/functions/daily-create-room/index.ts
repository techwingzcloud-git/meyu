// Creates a Daily.co video room for a consultation
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { consultationId } = await req.json();
    if (!consultationId || typeof consultationId !== "string") {
      return new Response(JSON.stringify({ error: "consultationId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const DAILY_API_KEY = Deno.env.get("DAILY_API_KEY");
    if (!DAILY_API_KEY) {
      // Fallback: mock room URL so the UI flow still works without a key
      const mockUrl = `https://meyu.daily.co/mock-${consultationId.slice(0, 8)}`;
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await admin.from("consultations").update({
        room_name: `mock-${consultationId.slice(0, 8)}`,
        room_url: mockUrl,
      }).eq("id", consultationId);
      return new Response(JSON.stringify({
        room_url: mockUrl,
        mock: true,
        message: "DAILY_API_KEY not set — using mock room.",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const roomName = `meyu-${consultationId.slice(0, 8)}-${Date.now().toString(36)}`;
    const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 2; // 2 hours

    const dailyResp = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: roomName,
        privacy: "private",
        properties: {
          exp: expiry,
          enable_chat: true,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    const dailyData = await dailyResp.json();
    if (!dailyResp.ok) {
      console.error("Daily API error:", dailyData);
      return new Response(JSON.stringify({ error: "Failed to create room", details: dailyData }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    await admin.from("consultations").update({
      room_name: roomName,
      room_url: dailyData.url,
    }).eq("id", consultationId);

    return new Response(JSON.stringify({ room_url: dailyData.url, room_name: roomName }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
