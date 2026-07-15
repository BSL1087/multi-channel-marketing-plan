import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  ACTIVITY_LOG_EMAIL,
  PAGE_SIZE,
  buildLogQuery,
  isActionType,
  isEntityType,
  type ActivityEntry,
} from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { ActivityLogFilters } from "@/components/activity-log-filters";
import { ActivityLogList } from "@/components/activity-log-list";

type SearchParams = {
  typ?: string;
  nutzer?: string;
  aktion?: string;
  page?: string;
};

function resolvePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export default async function ActivityLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth — proxy protects the route, RLS protects the data, and
  // this check keeps non-authorised users off the page entirely.
  if (!user) {
    redirect("/login");
  }
  if (user.email !== ACTIVITY_LOG_EMAIL) {
    redirect("/");
  }

  const sp = await searchParams;
  const typ = isEntityType(sp.typ) ? sp.typ : undefined;
  const aktion = isActionType(sp.aktion) ? sp.aktion : undefined;
  const nutzer = sp.nutzer?.trim() || undefined;
  const page = resolvePage(sp.page);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Build the filtered, paginated query. If the table does not exist yet
  // (backend not built), fall back to an empty view instead of crashing.
  let query = supabase
    .from("activity_log")
    .select("id, actor_email, action_type, entity_type, entity_name, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (typ) query = query.eq("entity_type", typ);
  if (aktion) query = query.eq("action_type", aktion);
  if (nutzer) query = query.eq("actor_email", nutzer);

  const { data, count, error } = await query.returns<ActivityEntry[]>();
  const entries = error ? [] : data ?? [];
  const total = error ? 0 : count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Distinct actors for the user filter (only people who appear in the log).
  const { data: actorRows } = await supabase
    .from("activity_log")
    .select("actor_email")
    .order("actor_email")
    .limit(1000);
  const users = [...new Set((actorRows ?? []).map((r) => r.actor_email))];

  const current = { typ: sp.typ, nutzer: sp.nutzer, aktion: sp.aktion };
  const filtered = Boolean(typ || aktion || nutzer);

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Aktivitätsprotokoll
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Wer hat wann was angelegt, geändert oder gelöscht — über alle Kanäle,
          Produktgruppen, Marken und Rabatt-Aktionen.
        </p>

        <ActivityLogFilters current={current} users={users} />

        <ActivityLogList entries={entries} filtered={filtered} />

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} {total === 1 ? "Eintrag" : "Einträge"} · Seite {page} von{" "}
              {totalPages}
            </p>
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  {page > 1 ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        href={buildLogQuery(current, { page: String(page - 1) })}
                      >
                        Zurück
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" disabled>
                      Zurück
                    </Button>
                  )}
                </PaginationItem>
                <PaginationItem>
                  {page < totalPages ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        href={buildLogQuery(current, { page: String(page + 1) })}
                      >
                        Weiter
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" disabled>
                      Weiter
                    </Button>
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
}
