import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Force error logging to ensure visibility
function forceLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  // Use error level to ensure it shows up
  console.error(`🔴 [${timestamp}] ${message}`);
  if (data) {
    console.error('📊 DATA:', JSON.stringify(data, null, 2));
  }
}

async function getGeolocation(ip: string) {
  forceLog('🌍 Starting geolocation', { ip });
  
  if (!ip || ip === 'unknown' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '127.0.0.1' || ip.startsWith('172.')) {
    forceLog('🏠 Skipping geolocation for local IP', { ip });
    return { country: 'Unknown', city: 'Unknown' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,message`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'URL-Shortener-Analytics/1.0' }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      forceLog('❌ Geolocation API failed', { status: response.status });
      return { country: 'Unknown', city: 'Unknown' };
    }
    
    const data = await response.json();
    forceLog('🌍 Geolocation response', data);
    
    if (data.status === 'success') {
      const result = {
        country: data.country || 'Unknown',
        city: data.city || 'Unknown'
      };
      forceLog('✅ Geolocation successful', result);
      return result;
    } else {
      forceLog('❌ Geolocation failed', { message: data.message });
      return { country: 'Unknown', city: 'Unknown' };
    }
    
  } catch (error) {
    forceLog('💥 Geolocation error', { error: error.message });
    return { country: 'Unknown', city: 'Unknown' };
  }
}

function parseUserAgent(userAgent: string) {
  forceLog('🔍 Parsing User-Agent', { userAgent: userAgent?.substring(0, 100) });
  
  if (!userAgent || userAgent.trim() === '') {
    forceLog('❌ Empty user agent');
    return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
  }
  
  let device = 'Desktop';
  let browser = 'Unknown';
  let os = 'Unknown';
  
  // Device detection
  if (/Mobile/i.test(userAgent)) {
    if (/Tablet|iPad/i.test(userAgent)) {
      device = 'Tablet';
    } else {
      device = 'Mobile';
    }
  } else if (/Tablet|iPad/i.test(userAgent)) {
    device = 'Tablet';
  }
  
  // Browser detection
  if (/Edg\//i.test(userAgent)) {
    browser = 'Edge';
  } else if (/Chrome\//i.test(userAgent) && !/Chromium/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Firefox\//i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/Safari\//i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/Opera|OPR\//i.test(userAgent)) {
    browser = 'Opera';
  }
  
  // OS detection
  if (/Windows NT/i.test(userAgent)) {
    os = 'Windows';
  } else if (/Mac OS X|Macintosh/i.test(userAgent)) {
    os = 'macOS';
  } else if (/Linux/i.test(userAgent) && !/Android/i.test(userAgent)) {
    os = 'Linux';
  } else if (/iPhone|iOS/i.test(userAgent)) {
    os = 'iOS';
  } else if (/Android/i.test(userAgent)) {
    os = 'Android';
  }

  const result = { device, browser, os };
  forceLog('📋 User agent parsed', result);
  
  return result;
}

serve(async (req) => {
  // GUARANTEED VISIBLE LOGS
  forceLog('🚀🚀🚀 REDIRECT-NEW FUNCTION STARTED 🚀🚀🚀');
  forceLog('📍 Request details', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    forceLog('⚪ CORS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Environment check
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    forceLog('🔧 Environment check', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlPreview: supabaseUrl?.substring(0, 30) + '...'
    });
    
    if (!supabaseUrl || !supabaseKey) {
      forceLog('❌ Missing environment variables');
      return new Response('Configuration error', { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    forceLog('✅ Supabase client created');

    // Extract short code
    const url = new URL(req.url);
    const shortCode = url.pathname.slice(1);
    
    forceLog('🔗 Short code extracted', { shortCode, pathname: url.pathname });

    if (!shortCode) {
      forceLog('❌ No short code provided');
      return new Response('Short code required', { status: 400 });
    }

    // Look up URL
    forceLog('🔍 Looking up URL in database');
    const { data: urlData, error: urlError } = await supabase
      .from('urls')
      .select('id, original_url')
      .eq('short_code', shortCode)
      .single();

    if (urlError) {
      forceLog('❌ URL lookup error', urlError);
      return new Response('URL not found', { status: 404 });
    }
    
    if (!urlData) {
      forceLog('❌ No URL data found');
      return new Response('URL not found', { status: 404 });
    }

    forceLog('✅ URL found', { 
      id: urlData.id, 
      originalUrl: urlData.original_url 
    });

    // Extract request data
    const clientIP = req.headers.get('CF-Connecting-IP') ||
                    req.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
                    req.headers.get('X-Real-IP') ||
                    'unknown';
    
    const userAgent = req.headers.get('User-Agent') || '';
    const referrer = req.headers.get('Referer') || req.headers.get('Referrer') || '';

    forceLog('📊 Request data extracted', {
      clientIP,
      userAgentLength: userAgent.length,
      referrer: referrer || '(empty)',
      hasUserAgent: !!userAgent
    });

    // Parse user agent
    const { device, browser, os } = parseUserAgent(userAgent);
    
    // Get geolocation
    const geoData = await getGeolocation(clientIP);

    // Prepare click data
    const clickData = {
      url_id: urlData.id,
      ip_address: clientIP,
      referrer: referrer || null,
      user_agent: userAgent || null,
      country: geoData?.country || 'Unknown',
      city: geoData?.city || 'Unknown',
      device_type: device,
      browser: browser,
      os: os,
      clicked_at: new Date().toISOString()
    };

    forceLog('💾 Prepared click data', clickData);

    // Insert click data
    forceLog('💽 Inserting into database...');
    const { data: insertResult, error: clickError } = await supabase
      .from('url_clicks')
      .insert(clickData)
      .select();

    if (clickError) {
      forceLog('❌ Database insert failed', {
        error: clickError,
        code: clickError.code,
        message: clickError.message,
        details: clickError.details,
        hint: clickError.hint
      });
    } else {
      forceLog('✅ Click data inserted successfully', insertResult);
    }

    // Redirect
    forceLog('🔀 Redirecting to original URL', { originalUrl: urlData.original_url });
    forceLog('🏁🏁🏁 REDIRECT-NEW FUNCTION COMPLETED 🏁🏁🏁');
    
    return Response.redirect(urlData.original_url, 302);

  } catch (error) {
    forceLog('💥 FUNCTION ERROR', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return new Response('Internal server error', { status: 500, headers: corsHeaders });
  }
});