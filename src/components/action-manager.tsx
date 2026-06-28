"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, Pencil, Plus, Trash2 } from "lucide-react";

import type { DiscountAction } from "@/app/tools/multi-channel-marketing/aktionen/actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionFormDialog } from "@/components/action-form-dialog";
import { DeleteActionDialog } from "@/components/delete-action-dialog";

type Option = { id: string; name: string };

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

function formatRange(start: string, end: string): string {
  return start === end
    ? formatDate(start)
    : `${formatDate(start)} – ${formatDate(end)}`;
}

export function ActionManager({
  actions,
  brands,
  channels,
}: {
  actions: DiscountAction[];
  brands: Option[];
  channels: Option[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountAction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DiscountAction | null>(null);

  const canCreate = brands.length > 0 && channels.length > 0;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(action: DiscountAction) {
    setEditing(action);
    setFormOpen(true);
  }

  // Missing prerequisites → creating an action is not possible yet.
  if (!canCreate) {
    return (
      <div className="mt-6 flex flex-col items-center rounded-lg border border-dashed bg-background px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CalendarPlus className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-medium">Voraussetzungen fehlen</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Für eine Rabatt-Aktion brauchst du mindestens einen Kanal und eine
          Marke. Lege zuerst das Fehlende an.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {channels.length === 0 && (
            <Button asChild size="sm" variant="outline">
              <Link href="/tools/multi-channel-marketing/kanaele">
                Kanal anlegen
              </Link>
            </Button>
          )}
          {brands.length === 0 && (
            <Button asChild size="sm" variant="outline">
              <Link href="/tools/multi-channel-marketing/marken">
                Marke anlegen
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {actions.length} {actions.length === 1 ? "Aktion" : "Aktionen"}
        </p>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" />
          Aktion hinzufügen
        </Button>
      </div>

      {actions.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-lg border border-dashed bg-background px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarPlus className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-medium">Noch keine Aktionen angelegt</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Lege deine erste Rabatt-Aktion an (Kanal, Marke(n), Zeitraum,
            Rabattwert).
          </p>
          <Button onClick={openCreate} size="sm" className="mt-4">
            <Plus className="h-4 w-4" />
            Aktion hinzufügen
          </Button>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Marken</TableHead>
                <TableHead>Kanal</TableHead>
                <TableHead>Zeitraum</TableHead>
                <TableHead>Rabatt</TableHead>
                <TableHead className="w-px" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell className="font-medium">{action.title}</TableCell>
                  <TableCell>
                    <span className="flex flex-wrap gap-x-3 gap-y-1">
                      {action.brands.map((brand) => (
                        <span
                          key={brand.id}
                          className="inline-flex items-center gap-2 whitespace-nowrap"
                        >
                          <span
                            className="block h-4 w-4 shrink-0 rounded-full border"
                            style={{ backgroundColor: brand.color }}
                            aria-hidden
                          />
                          {brand.name}
                        </span>
                      ))}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {action.marketplace_name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatRange(action.start_date, action.end_date)}
                  </TableCell>
                  <TableCell>{action.discount_value}</TableCell>
                  <TableCell className="w-px whitespace-nowrap py-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(action)}
                    >
                      <Pencil className="h-4 w-4" />
                      Bearbeiten
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(action)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Löschen
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ActionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        action={editing}
        brands={brands}
        channels={channels}
      />
      <DeleteActionDialog
        open={deleteTarget !== null}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        action={deleteTarget}
      />
    </div>
  );
}
