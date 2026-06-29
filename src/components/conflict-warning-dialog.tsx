"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

import type { ActionConflict } from "@/app/tools/multi-channel-marketing/aktionen/actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConflictWarningDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: ActionConflict[];
  /** "Trotzdem speichern" — save despite the conflicts. */
  onConfirm: () => void;
  /** "Abbrechen" — return to the form, inputs preserved. */
  onCancel: () => void;
  /** True while the save triggered by "Trotzdem speichern" is in flight. */
  saving: boolean;
};

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

function ConflictList({ conflicts }: { conflicts: ActionConflict[] }) {
  return (
    <ul className="space-y-2">
      {conflicts.map((c) => (
        <li
          key={`${c.actionId}:${c.brandId}`}
          className="rounded-md border bg-muted/40 px-3 py-2 text-sm"
        >
          <span className="font-medium">{c.brandName}</span>
          <span className="text-muted-foreground">
            {" "}
            · {c.channelName} · {formatRange(c.startDate, c.endDate)}
          </span>
          <div className="text-xs text-muted-foreground">
            Aktion: {c.actionTitle}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ConflictWarningDialog({
  open,
  onOpenChange,
  conflicts,
  onConfirm,
  onCancel,
  saving,
}: ConflictWarningDialogProps) {
  const sameChannel = conflicts.filter((c) => c.sameChannel);
  const otherChannel = conflicts.filter((c) => !c.sameChannel);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />
            Mögliche Überschneidung
          </AlertDialogTitle>
          <AlertDialogDescription>
            Diese Marke(n) sind im gewählten Zeitraum bereits rabattiert. Du
            kannst trotzdem speichern, wenn das beabsichtigt ist.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-[50vh] space-y-4 overflow-y-auto">
          {sameChannel.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">
                Gleicher Kanal — Doppelrabatt-Risiko
              </h3>
              <p className="text-xs text-muted-foreground">
                Auf demselben Kanal läuft schon eine Aktion. Prüfe vor der
                Freigabe, ob sich Rabatte stapeln.
              </p>
              <ConflictList conflicts={sameChannel} />
            </section>
          )}

          {otherChannel.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">
                Anderer Kanal — Kannibalisierung
              </h3>
              <p className="text-xs text-muted-foreground">
                Auf einem anderen Kanal läuft schon eine Aktion. Anzeigen können
                miteinander konkurrieren.
              </p>
              <ConflictList conflicts={otherChannel} />
            </section>
          )}
        </div>

        <AlertDialogFooter>
          {/* Plain buttons (not AlertDialogAction/Cancel) so closing is driven
              by the save result, not Radix's auto-close on click. */}
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Abbrechen
          </Button>
          <Button onClick={onConfirm} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Trotzdem speichern
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
