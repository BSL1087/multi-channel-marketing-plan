import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarRange, ChevronRight, Store, Tags } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ChangePasswordDialog } from "@/components/change-password-dialog";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth — route protection also runs in the proxy.
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name ?? user.email;

  return (
    <div className="min-h-screen bg-secondary/40">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Image
            src="/agonsworld-logo-white-background.jpg"
            alt="agon's world"
            width={140}
            height={98}
            priority
            className="h-auto w-28 rounded"
          />
          <span className="text-sm text-muted-foreground">
            Eingeloggt als{" "}
            <span className="font-medium text-foreground">{displayName}</span>
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Wähle ein Tool, um loszulegen.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/tools/multi-channel-marketing"
            className="group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="h-full transition-colors hover:border-primary/40 hover:bg-accent/50">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <CalendarRange className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-medium">Multi-Channel-Marketing</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Jahresübersicht der Rabatt-Aktionen über alle Marketplaces.
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center text-sm font-medium text-primary">
                  Öffnen
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link
            href="/tools/multi-channel-marketing/kanaele"
            className="group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="h-full transition-colors hover:border-primary/40 hover:bg-accent/50">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-medium">Kanäle verwalten</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Marketplaces &amp; Webshops für die Aktionsplanung pflegen.
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center text-sm font-medium text-primary">
                  Öffnen
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link
            href="/tools/multi-channel-marketing/produktgruppen"
            className="group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="h-full transition-colors hover:border-primary/40 hover:bg-accent/50">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Tags className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-medium">Produktgruppen verwalten</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Kategorien (z.B. Fitness, Familie) zum Gruppieren der Marken
                    pflegen.
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center text-sm font-medium text-primary">
                  Öffnen
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Account */}
        <div className="mt-12 flex flex-col items-start gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <ChangePasswordDialog />
          <LogoutButton />
        </div>
      </main>
    </div>
  );
}
