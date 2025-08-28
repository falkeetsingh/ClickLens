export default async function handler(req, res) {
  try {
    console.log('Function started');
    
    const { code } = req.query;
    console.log('Raw code from query:', code);
    
    if (!code) {
      return res.redirect(302, '/');
    }
    
    // Import Supabase inside the try block
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = 'https://uquvvzokpfkbqvngbmeq.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdXZ2em9rcGZrYnF2bmdibWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODg0MDAsImV4cCI6MjA3MTI2NDQwMH0.J4AvRSSZjLQfLrXon36kqGw87EkNm1Wqo_fksKMXdPs';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Remove 'r/' prefix if present
    const shortCode = code.startsWith('r/') ? code.substring(2) : code;
    console.log('Short code after cleanup:', shortCode);
    
    // First, let's see all URLs in the database to debug
    console.log('Fetching all URLs for debugging...');
    const { data: allUrls, error: allError } = await supabase
      .from('urls')
      .select('short_code, original_url')
      .limit(10);
    
    console.log('All URLs in database:', allUrls);
    console.log('All URLs error:', allError);
    
    // Now try to find our specific URL
    console.log('Looking for short_code:', shortCode);
    const { data, error } = await supabase
      .from('urls')
      .select('short_code, original_url')
      .eq('short_code', shortCode);
    
    console.log('Search result (array):', data);
    console.log('Search error:', error);
    
    // Try case-insensitive search too
    const { data: caseInsensitive, error: caseError } = await supabase
      .from('urls')
      .select('short_code, original_url')
      .ilike('short_code', shortCode);
    
    console.log('Case insensitive result:', caseInsensitive);
    console.log('Case insensitive error:', caseError);

    if (error || !data || data.length === 0) {
      console.log('URL not found, redirecting home');
      return res.redirect(302, '/');
    }

    console.log('Redirecting to:', data[0].original_url);
    return res.redirect(302, data[0].original_url);
    
  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}