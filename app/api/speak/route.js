export async function POST(req) {
  const { text, lang } = await req.json();

  const VOICE_EN = "21m00Tcm4TlvDq8ikWAM"; // Rachel
  const VOICE_ES = "pFZP5JQG7iQjIQuC4Bku"; // Valentina
  const voiceId = lang === "es" ? VOICE_ES : VOICE_EN;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    return Response.json({ error: err }, { status: 400 });
  }

  const audioBuffer = await response.arrayBuffer();
  return new Response(audioBuffer, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
