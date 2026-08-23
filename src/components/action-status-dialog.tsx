"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  findActionConflicts,
  setActionStatus,
  type ActionConflict,
  type ActionStatus,
  type DiscountAction,
} from "@/app/tools/multi-channel-marketing/aktionen/actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ActionStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The action whose status is about to change. */
  action: DiscountAction | null;
  /** Where it should end up. */
  target: ActionStatus;
  /** Called after a successful change (e.g. to close the surrounding dialog). */
  onSuccess?: () => void;
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

/** Local calendar date as `YYYY-MM-DD`, matching the DB date format. */
function todayIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * Confirms moving an action between draft and calendar (PROJ-13). Committing
 * re-runs the overlap check so the user sees what they are about to collide
 * with — but, per the project's "warn, don't block" rule, it never prevents it.
 */
export function ActionStatusDialog({
  open,
  onOpenChange,
  action,
  target,
  onSuccess,
}: ActionStatusDialogProps) {
  const [saving, setSaving] = useState(false);
  const [conflicts, setConflicts] = useState<ActionConflict[]>([]);
  const [checking, setChecking] = useState(false);

  const confirming = target === "confirmed";

  useEffect(() => {
    if (!open || !action || !confirming) {
      setConflicts([]);
      return;
    }
    let cancelled = false;
    setChecking(true);
    findActionConflicts({
      marketplaceId: action.marketplace_id,
      brandIds: action.brands.map((b) => b.id),
      startDate: action.start_date,
      endDate: action.end_date,
      excludeId: action.id,
    })
      .then((result) => {
        // A failed check must not block the dialog — show it without warnings.
        if (!cancelled) setConflicts(result.ok ? result.conflicts : []);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, action, confirming]);

  if (!action) return null;

  const isRunning =
    action.start_date <= todayIso() && action.end_date >= todayIso();

  async function submit() {
    if (!action) return;
    setSaving(true);
    try {
      const result = await setActionStatus(action.id, target);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(
        confirming
          ? "Aktion in den Kalender übernommen."
          : "Aktion zurück auf Entwurf gesetzt.",
      );
      onOpenChange(false);
      onSuccess?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={saving ? undefined : onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {confirming
              ? "In den Kalender übernehmen?"
              : "Zurück auf Entwurf setzen?"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                {confirming
                  ? "Die Aktion gilt danach als verbindlich eingebucht und erscheint im Jahreskalender."
                  : "Die Aktion verschwindet danach aus dem Jahreskalender und liegt wieder als Entwurf hier."}
              </p>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                <span className="font-medium text-foreground">
                  {action.title}
                </span>
                <div className="text-muted-foreground">
                  {action.marketplace_name} ·{" "}
                  {formatRange(action.start_date, action.end_date)}
                </div>
                <div className="text-muted-foreground">
                  {action.brands
                    .map((b) => `${b.name} ${b.discount_value}`)
                    .join(" · ")}
                </div>
              </div>

              {!confirming && isRunning && (
                <p className="text-sm text-amber-700 dark:text-amber-500">
                  Achtung: Diese Aktion läuft aktuell.
                </p>
              )}

              {confirming && checking && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Überschneidungen werden geprüft …
                </p>
              )}

              {confirming && !checking && conflicts.length > 0 && (
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-500">
                    <AlertTriangle className="h-4 w-4" />
                    {conflicts.length === 1
                      ? "1 Überschneidung gefunden:"
                      : `${conflicts.length} Überschneidungen gefunden:`}
                  </p>
                  <ul className="space-y-1">
                    {conflicts.map((c) => (
                      <li
                        key={`${c.actionId}:${c.brandId}`}
                        className="rounded-md border bg-muted/40 px-3 py-1.5 text-sm"
                      >
                        <span className="font-medium text-foreground">
                          {c.brandName}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {c.channelName} ·{" "}
                          {formatRange(c.startDate, c.endDate)}
                          {c.status === "draft" && " · Entwurf"}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    Übernehmen ist trotzdem möglich — du entscheidest.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Abbrechen
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirming ? "In Kalender übernehmen" : "Zurück auf Entwurf"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
