// api/redirect.js
export default async function handler(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(302, "/");
    }

    // Forward to Supabase Edge Function with the same query
    const supabaseFunctionUrl = `${process.env.BASE_URL}/functions/v1/redirect-new?code=${code}`;

    const response = await fetch(supabaseFunctionUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: undefined, 
      },
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    // Copy Supabase response status & headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error("Redirect proxy error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
