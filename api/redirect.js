export default async function handler(req, res) {
  console.log('Function started');
  console.log('Query:', req.query);
  
  const { code } = req.query;
  
  if (!code) {
    console.log('No code, redirecting home');
    return res.redirect(302, '/');
  }
  
  console.log('Code received:', code);
  
  // For now, just redirect to Google to test basic functionality
  return res.redirect(302, 'https://google.com');
}