import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.redirect(302, "/");
  }

  // Create Supabase client
  const supabase = createClient(
    process.env.BASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    // Find the URL by short code
    const { data: url, error } = await supabase
      .from('urls')
      .select('id, original_url')
      .eq('short_code', code)
      .single();

    if (error || !url) {
      return res.redirect(302, '/');
    }

    // Log the click
    await supabase
      .from('url_clicks')
      .insert({
        url_id: url.id,
        ip_address: req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'unknown',
        referrer: req.headers.referer || '',
        user_agent: req.headers['user-agent'] || '',
      });

    // Redirect to original URL
    res.redirect(302, url.original_url);

  } catch (error) {
    console.error('Redirect error:', error);
    res.redirect(302, '/');
  }
}