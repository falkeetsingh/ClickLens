import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // Create Supabase client (service role for public access)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Extract short code from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const shortCode = pathParts[pathParts.length - 1];

    if (!shortCode) {
      return new Response("Short code not provided", { status: 400 });
    }

    // Find the URL by short code
    const { data: urlData, error: urlError } = await supabaseClient
      .from("urls")
      .select("id, original_url")
      .eq("short_code", shortCode)
      .single();

    if (urlError || !urlData) {
      return new Response("URL not found", { status: 404 });
    }

    // Get client information for analytics
    const userAgent = req.headers.get("user-agent") || "";
    const referrer = req.headers.get("referer") || "";
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

    // Log the click (fire and forget)
    supabaseClient
      .from("url_clicks")
      .insert({
        url_id: urlData.id,
        ip_address: ipAddress,
        referrer: referrer,
        user_agent: userAgent,
        country: null,
        city: null,
      })
      .then(() => {
        console.log("Click logged successfully");
      })
      .catch((error) => {
        console.error("Error logging click:", error);
      });

    // Redirect to original URL
    return new Response(null, {
      status: 302,
      headers: {
        Location: urlData.original_url,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error in redirect function:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
