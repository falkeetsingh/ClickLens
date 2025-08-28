export default async function handler(req, res) {
  try {
    console.log('Function started');
    
    const { code } = req.query;
    console.log('Code received:', code);
    
    if (!code) {
      return res.redirect(302, '/');
    }
    
    // Import Supabase inside the try block
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = 'https://uquvvzokpfkbqvngbmeq.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdXZ2em9rcGZrYnF2bmdibWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODg0MDAsImV4cCI6MjA3MTI2NDQwMH0.J4AvRSSZjLQfLrXon36kqGw87EkNm1Wqo_fksKMXdPs';
    
    console.log('Creating Supabase client');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Remove 'r/' prefix if present
    const shortCode = code.startsWith('r/') ? code.substring(2) : code;
    console.log('Short code:', shortCode);
    
    console.log('Querying database');
    const { data, error } = await supabase
      .from('urls')
      .select('original_url')
      .eq('short_code', shortCode)
      .single();

    console.log('Query result:', { data, error });

    if (error || !data) {
      console.log('URL not found, redirecting home');
      return res.redirect(302, '/');
    }

    console.log('Redirecting to:', data.original_url);
    return res.redirect(302, data.original_url);
    
  } catch (error) {
    console.error('Function error:', error);
    console.error('Error stack:', error.stack);
    
    // Return JSON error instead of redirect to see the error
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}