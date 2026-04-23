export async function POST(req) {
  const { system, messages } = await req.json();

  // Gemini v1 format - system goes as first user message
  const contents = [];
  
  // Add system as first turn
  contents.push({ role: "user", parts: [{ text: system }] });
  contents.push({ role: "model", parts: [{ text: "Understood. I will stay in character as instructed." }] });
  
  // Add conversation messages
  messages.forEach(m => {
    contents.push({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    });
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens: 1024, temperature: 0.9 }
      }),
    }
  );

  const data = await response.json();
  if (data.error) return Response.json({ error: data.error.message }, { status: 400 });
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return Response.json({ text });
}
