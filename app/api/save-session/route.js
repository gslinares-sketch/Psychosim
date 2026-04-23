export const dynamic = "force-dynamic";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { cookieStore.set({ name, value, ...options }); },
        remove(name, options) { cookieStore.set({ name, value: "", ...options }); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { error, data } = await supabase.from("sessions").insert({
    student_id: user.id,
    modality: body.modality,
    difficulty: body.difficulty,
    patient_name: body.patientName,
    patient_case_id: body.caseId,
    presenting: body.presenting,
    hidden_condition: body.hiddenCondition,
    defense_mechanism: body.defense,
    exchange_count: body.exchangeCount,
    duration_seconds: body.durationSeconds,
    feedback: body.feedback,
    lang: body.lang,
  }).select().single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ session: data });
}
