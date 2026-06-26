"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";

import type { Brand } from "@/app/tools/multi-channel-marketing/marken/actions";
import type { ProductGroup } from "@/app/tools/multi-channel-marketing/produktgruppen/actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BrandFormDialog } from "@/components/brand-form-dialog";
import { DeleteBrandDialog } from "@/components/delete-brand-dialog";

export function BrandManager({
  brands,
  groups,
}: {
  brands: Brand[];
  groups: ProductGroup[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  const hasGroups = groups.length > 0;

  // Sort by product group, then by brand name.
  const sorted = useMemo(
    () =>
      [...brands].sort(
        (a, b) =>
          a.product_group_name.localeCompare(b.product_group_name, "de") ||
          a.name.localeCompare(b.name, "de"),
      ),
    [brands],
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(brand: Brand) {
    setEditing(brand);
    setFormOpen(true);
  }

  // No product groups yet → creating a brand is not possible.
  if (!hasGroups) {
    return (
      <div className="mt-6 flex flex-col items-center rounded-lg border border-dashed bg-background px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Tag className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-medium">Zuerst eine Produktgruppe anlegen</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Jede Marke gehört zu einer Produktgruppe. Lege zuerst mindestens eine
          Gruppe an, dann kannst du hier Marken hinzufügen.
        </p>
        <Button asChild size="sm" className="mt-4">
          <Link href="/tools/multi-channel-marketing/produktgruppen">
            Zur Produktgruppen-Verwaltung
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {brands.length} {brands.length === 1 ? "Marke" : "Marken"}
        </p>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" />
          Marke hinzufügen
        </Button>
      </div>

      {brands.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-lg border border-dashed bg-background px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Tag className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-medium">Noch keine Marken angelegt</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Lege deine erste Marke an und ordne sie einer Produktgruppe zu.
          </p>
          <Button onClick={openCreate} size="sm" className="mt-4">
            <Plus className="h-4 w-4" />
            Marke hinzufügen
          </Button>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-px">Farbe</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Produktgruppe</TableHead>
                <TableHead className="w-px" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <span
                      className="block h-5 w-5 rounded-full border"
                      style={{ backgroundColor: brand.color }}
                      title={brand.color}
                      aria-label={`Farbe ${brand.color}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {brand.product_group_name}
                  </TableCell>
                  <TableCell className="w-px whitespace-nowrap py-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(brand)}
                    >
                      <Pencil className="h-4 w-4" />
                      Bearbeiten
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(brand)}
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

      <BrandFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        brand={editing}
        groups={groups}
        brands={brands}
      />
      <DeleteBrandDialog
        open={deleteTarget !== null}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        brand={deleteTarget}
      />
    </div>
  );
}
