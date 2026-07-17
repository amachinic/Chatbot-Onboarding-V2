// Serverless proxy for the chat model — the GROQ_API_KEY stays server-side.
// Set GROQ_API_KEY in the Vercel project's Environment Variables; never commit it.
const MODEL = "llama-3.3-70b-versatile";

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  const key = process.env.GROQ_API_KEY;
  if (!key) { res.status(500).json({ error: "GROQ_API_KEY not configured" }); return; }
  try {
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ model: MODEL }, req.body || {})),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(502).json({ error: "upstream request failed" });
  }
};
