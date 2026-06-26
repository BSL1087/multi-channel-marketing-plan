"use client";

import { useState } from "react";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";

import type { ProductGroup } from "@/app/tools/multi-channel-marketing/produktgruppen/actions";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ProductGroupFormDialog } from "@/components/product-group-form-dialog";
import { DeleteProductGroupDialog } from "@/components/delete-product-group-dialog";

export function ProductGroupManager({ groups }: { groups: ProductGroup[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductGroup | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(group: ProductGroup) {
    setEditing(group);
    setFormOpen(true);
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {groups.length}{" "}
          {groups.length === 1 ? "Produktgruppe" : "Produktgruppen"}
        </p>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" />
          Gruppe hinzufügen
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-lg border border-dashed bg-background px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Tags className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-medium">Noch keine Produktgruppen angelegt</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Lege deine erste Produktgruppe an (z.B. Fitness, Familie), um Marken
            danach zu gruppieren.
          </p>
          <Button onClick={openCreate} size="sm" className="mt-4">
            <Plus className="h-4 w-4" />
            Gruppe hinzufügen
          </Button>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border bg-background">
          <Table>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="w-px whitespace-nowrap py-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(group)}
                    >
                      <Pencil className="h-4 w-4" />
                      Umbenennen
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(group)}
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

      <ProductGroupFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        group={editing}
      />
      <DeleteProductGroupDialog
        open={deleteTarget !== null}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        group={deleteTarget}
      />
    </div>
  );
}
