// api/redirect.js
export default async function handler(req, res) {
  try {
    // grab the short code from query (?code=xyz)
    const { code } = req.query;

    if (!code) {
      return res.redirect(302, "/");
    }

    // call your Supabase Edge Function instead of duplicating logic
    const supabaseFunctionUrl = `${process.env.BASE_URL}/functions/v1/redirect-new`;

    const response = await fetch(supabaseFunctionUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: undefined, // remove host header to avoid conflicts
      },
    });

    // forward redirect headers/status back to client
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
