import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { BrandManager } from "@/components/brand-manager";
import type { Brand } from "./actions";

type BrandRow = {
  id: string;
  name: string;
  color: string;
  product_group_id: string;
  product_groups: { name: string } | { name: string }[] | null;
};

export default async function BrandsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth — route protection also runs in the proxy.
  if (!user) {
    redirect("/login");
  }

  const [{ data: brandRows }, { data: groups }] = await Promise.all([
    supabase
      .from("brands")
      .select("id, name, color, product_group_id, product_groups(name)")
      .returns<BrandRow[]>(),
    supabase
      .from("product_groups")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  const brands: Brand[] = (brandRows ?? []).map((b) => {
    const group = Array.isArray(b.product_groups)
      ? b.product_groups[0]
      : b.product_groups;
    return {
      id: b.id,
      name: b.name,
      color: b.color,
      product_group_id: b.product_group_id,
      product_group_name: group?.name ?? "—",
    };
  });

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Marken verwalten
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Marken mit Farbe und Produktgruppe — Grundlage für die farbige
          Wiedererkennung im Jahreskalender.
        </p>

        <BrandManager brands={brands} groups={groups ?? []} />
      </main>
    </div>
  );
}
