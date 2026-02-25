export async function POST(req) {
  const { system, messages } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ reply: "AI chat not configured. Set ANTHROPIC_API_KEY env var." });
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: system || "You are an NBC News AI assistant. Answer concisely.",
        messages,
      }),
    });
    const data = await res.json();
    const reply = data.content?.map(b => b.text || "").join("") || "Unable to respond.";
    return Response.json({ reply });
  } catch (e) {
    return Response.json({ reply: "Having trouble connecting." }, { status: 500 });
  }
}
