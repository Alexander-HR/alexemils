import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";

// Called daily by Vercel Cron (vercel.json). Supabase pauses free projects
// after a week without database activity; a real query keeps it awake.
export async function GET() {
  // Only ever run on a real request, never prerendered at build time.
  await connection();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { error } = await supabase.from("wishes").select("id").limit(1);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
