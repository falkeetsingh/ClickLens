import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the request
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user's URLs with click analytics
    const { data: urls, error: urlsError } = await supabaseClient
      .from('urls')
      .select(`
        id,
        original_url,
        short_code,
        created_at,
        url_clicks (
          id,
          clicked_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (urlsError) {
      return new Response(
        JSON.stringify({ error: urlsError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Process URLs with analytics
    const urlsWithAnalytics = urls?.map(url => {
      const clicks = url.url_clicks || []
      const totalClicks = clicks.length
      const lastClickTime = clicks.length > 0 
        ? clicks.reduce((latest, click) => {
            return new Date(click.clicked_at) > new Date(latest.clicked_at) 
              ? click 
              : latest
          }).clicked_at
        : null

      return {
        id: url.id,
        original_url: url.original_url,
        short_code: url.short_code,
        short_url: `${req.headers.get('origin') || 'http://localhost:5173'}/r/${url.short_code}`,
        created_at: url.created_at,
        analytics: {
          total_clicks: totalClicks,
          last_click_time: lastClickTime
        }
      }
    }) || []

    return new Response(
      JSON.stringify({ urls: urlsWithAnalytics }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})