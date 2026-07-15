import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Keep-alive endpoint.
 *
 * A daily Vercel Cron (see `vercel.json`) hits this route to generate a little
 * database activity, so the Supabase free-tier project does not auto-pause after
 * ~7 days of inactivity. A paused project breaks login for the whole team.
 *
 * This route is excluded from the auth proxy (see `src/proxy.ts`), so the cron
 * request is not redirected to /login. The query runs unauthenticated — RLS may
 * return zero rows, but the request itself is what keeps the project awake.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Optional hardening: when CRON_SECRET is set in Vercel, Vercel Cron sends it
  // as a Bearer token. If configured, reject anything that doesn't match.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 },
      );
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("marketplaces")
    .select("id", { head: true, count: "exact" });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, ranAt: new Date().toISOString() });
}
