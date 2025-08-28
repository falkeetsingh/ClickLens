import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uquvvzokpfkbqvngbmeq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdXZ2em9rcGZrYnF2bmdibWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODg0MDAsImV4cCI6MjA3MTI2NDQwMH0.J4AvRSSZjLQfLrXon36kqGw87EkNm1Wqo_fksKMXdPs'

export default async function handler(req, res) {
  const { code } = req.query;
  
  console.log('Redirect API called with code:', code);
  
  if (!code) {
    console.log('No code provided, redirecting to home');
    return res.redirect(302, '/');
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Query directly from your database
    const { data, error } = await supabase
      .from('urls')
      .select('original_url')
      .eq('short_code', code)
      .single()

    console.log('Database query result:', { data, error });

    if (error || !data) {
      console.log('URL not found, redirecting to home');
      return res.redirect(302, '/');
    }

    // Optionally increment click count
    await supabase
      .from('urls')
      .update({ clicks: supabase.raw('clicks + 1') })
      .eq('short_code', code)

    console.log('Redirecting to:', data.original_url);
    return res.redirect(302, data.original_url);
    
  } catch (error) {
    console.error('Redirect error:', error);
    return res.redirect(302, '/');
  }
}