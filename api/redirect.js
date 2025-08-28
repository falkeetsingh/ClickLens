export default async function handler(req, res) {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect(302, '/');
  }

  try {
    const response = await fetch('https://uquvvzokpfkbqvngbmeq.supabase.co/functions/v1/redirect-new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shortCode: code })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.originalUrl) {
        return res.redirect(302, data.originalUrl);
      }
    }
    
    return res.redirect(302, '/');
    
  } catch (error) {
    console.error('Redirect error:', error);
    return res.redirect(302, '/');
  }
}