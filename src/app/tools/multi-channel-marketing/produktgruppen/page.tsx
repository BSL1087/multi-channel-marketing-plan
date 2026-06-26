import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProductGroupManager } from "@/components/product-group-manager";

export default async function ProductGroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth — route protection also runs in the proxy.
  if (!user) {
    redirect("/login");
  }

  const { data: groups } = await supabase
    .from("product_groups")
    .select("id, name")
    .order("name", { ascending: true });

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
          Produktgruppen verwalten
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kategorien (z.B. Fitness, Familie), nach denen ihr Marken gruppiert und
          später den Kalender filtert.
        </p>

        <ProductGroupManager groups={groups ?? []} />
      </main>
    </div>
  );
}
