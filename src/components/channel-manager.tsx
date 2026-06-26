"use client";

import { useState } from "react";
import { Pencil, Plus, Store, Trash2 } from "lucide-react";

import type { Channel } from "@/app/tools/multi-channel-marketing/kanaele/actions";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ChannelFormDialog } from "@/components/channel-form-dialog";
import { DeleteChannelDialog } from "@/components/delete-channel-dialog";

export function ChannelManager({ channels }: { channels: Channel[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Channel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Channel | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(channel: Channel) {
    setEditing(channel);
    setFormOpen(true);
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {channels.length} {channels.length === 1 ? "Kanal" : "Kanäle"}
        </p>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" />
          Kanal hinzufügen
        </Button>
      </div>

      {channels.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-lg border border-dashed bg-background px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Store className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-medium">Noch keine Kanäle angelegt</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Lege deinen ersten Vertriebskanal an (z.B. Amazon, Otto, eigener
            Webshop), um Aktionen darauf zu planen.
          </p>
          <Button onClick={openCreate} size="sm" className="mt-4">
            <Plus className="h-4 w-4" />
            Kanal hinzufügen
          </Button>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border bg-background">
          <Table>
            <TableBody>
              {channels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell className="font-medium">{channel.name}</TableCell>
                  <TableCell className="w-px whitespace-nowrap py-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(channel)}
                    >
                      <Pencil className="h-4 w-4" />
                      Umbenennen
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(channel)}
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

      <ChannelFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        channel={editing}
      />
      <DeleteChannelDialog
        open={deleteTarget !== null}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        channel={deleteTarget}
      />
    </div>
  );
}
