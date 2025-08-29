
export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.redirect(302, "/");
  }

  try {
    const response = await fetch(`${process.env.BASE_URL}/functions/v1/redirect-new?code=${code}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 302) {
      const location = response.headers.get('location');
      return res.redirect(302, location);
    }

    // Handle error cases
    const text = await response.text();
    res.status(response.status).send(text);

  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Internal Server Error');
  }
}