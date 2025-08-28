import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_BASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export default async function handler(req, res) {
  const { code } = req.query;
  
  console.log('Full code received:', code);
  
  if (!code) {
    return res.redirect(302, '/');
  }

  try {
    // Remove 'r/' prefix if present (since your DB stores just the code)
    const shortCode = code.startsWith('r/') ? code.substring(2) : code;
    console.log('Short code after cleanup:', shortCode);
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data, error } = await supabase
      .from('urls')
      .select('id, original_url')
      .eq('short_code', shortCode)
      .single()

    console.log('Database result:', { data, error });

    if (error || !data) {
      console.log('URL not found');
      return res.redirect(302, '/');
    }

    // Log the click for analytics (same structure as your redirect-new function)
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || '';
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Fire and forget click logging
    supabase
      .from('url_clicks')
      .insert({
        url_id: data.id,
        ip_address: ipAddress,
        referrer: referrer,
        user_agent: userAgent,
        country: null,
        city: null,
      })
      .then(() => console.log('Click logged successfully'))
      .catch(err => console.error('Click log error:', err));

    console.log('Redirecting to:', data.original_url);
    
    // Add cache control headers like your Supabase function
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.redirect(302, data.original_url);
    
  } catch (error) {
    console.error('Redirect error:', error);
    return res.redirect(302, '/');
  }
}