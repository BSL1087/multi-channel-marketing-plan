import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/calendar-view";
import type { DiscountAction } from "./aktionen/actions";

type BrandJoin = { id: string; name: string; color: string };

type ActionRow = {
  id: string;
  title: string;
  marketplace_id: string;
  start_date: string;
  end_date: string;
  discount_value: string;
  comment: string | null;
  marketplaces: { name: string } | { name: string }[] | null;
  discount_action_brands:
    | { brands: BrandJoin | BrandJoin[] | null }[]
    | null;
};

type BrandRow = {
  id: string;
  name: string;
  color: string;
  product_groups: { name: string } | { name: string }[] | null;
};

type BrandOption = {
  id: string;
  name: string;
  color: string;
  product_group_name: string;
};

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function resolveYear(raw: string | undefined): number {
  const n = Number(raw);
  if (Number.isInteger(n) && n >= 1970 && n <= 9999) return n;
  return new Date().getFullYear();
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth — route protection also runs in the proxy.
  if (!user) {
    redirect("/login");
  }

  const year = resolveYear((await searchParams).year);
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const [{ data: actionRows }, { data: channels }, { data: brandRows }] =
    await Promise.all([
      supabase
        .from("discount_actions")
        .select(
          "id, title, marketplace_id, start_date, end_date, discount_value, comment, marketplaces(name), discount_action_brands(brands(id, name, color))",
        )
        .lte("start_date", yearEnd)
        .gte("end_date", yearStart)
        .returns<ActionRow[]>(),
      supabase.from("marketplaces").select("id, name").order("name"),
      supabase
        .from("brands")
        .select("id, name, color, product_groups(name)")
        .order("name")
        .returns<BrandRow[]>(),
    ]);

  const actions: DiscountAction[] = (actionRows ?? []).map((a) => {
    const mp = one(a.marketplaces);
    const actionBrands = (a.discount_action_brands ?? [])
      .map((link) => one(link.brands))
      .filter((b): b is BrandJoin => b !== null)
      .sort((x, y) => x.name.localeCompare(y.name, "de"));
    return {
      id: a.id,
      title: a.title,
      marketplace_id: a.marketplace_id,
      start_date: a.start_date,
      end_date: a.end_date,
      discount_value: a.discount_value,
      comment: a.comment,
      marketplace_name: mp?.name ?? "—",
      brands: actionBrands,
    };
  });

  const brands: BrandOption[] = (brandRows ?? []).map((b) => {
    const grp = one(b.product_groups);
    return {
      id: b.id,
      name: b.name,
      color: b.color,
      product_group_name: grp?.name ?? "Ohne Gruppe",
    };
  });

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Multi-Channel-Marketing — Jahreskalender
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rabatt-Aktionen je Kanal über das Jahr. Fahre über einen Balken für
          Details, klicke ihn zum Bearbeiten.
        </p>

        <CalendarView
          year={year}
          channels={channels ?? []}
          actions={actions}
          brands={brands}
        />
      </main>
    </div>
  );
}
