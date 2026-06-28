import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ActionManager } from "@/components/action-manager";
import type { DiscountAction } from "./actions";

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

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function ActionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth — route protection also runs in the proxy.
  if (!user) {
    redirect("/login");
  }

  const [{ data: actionRows }, { data: brands }, { data: channels }] =
    await Promise.all([
      supabase
        .from("discount_actions")
        .select(
          "id, title, marketplace_id, start_date, end_date, discount_value, comment, marketplaces(name), discount_action_brands(brands(id, name, color))",
        )
        .order("start_date", { ascending: true })
        .returns<ActionRow[]>(),
      supabase
        .from("brands")
        .select("id, name")
        .order("name", { ascending: true }),
      supabase
        .from("marketplaces")
        .select("id, name")
        .order("name", { ascending: true }),
    ]);

  const actions: DiscountAction[] = (actionRows ?? []).map((a) => {
    const mp = one(a.marketplaces);
    const brands = (a.discount_action_brands ?? [])
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
      brands,
    };
  });

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-4xl items-center px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Rabatt-Aktionen verwalten
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plane Rabatt-Aktionen je Kanal und Marke. Der Jahreskalender (kommt in
          Kürze) stellt sie grafisch dar.
        </p>

        <ActionManager
          actions={actions}
          brands={brands ?? []}
          channels={channels ?? []}
        />
      </main>
    </div>
  );
}
