import { History } from "lucide-react";

import {
  ACTION_LABELS,
  ENTITY_LABELS,
  actionBadgeClass,
  type ActivityEntry,
} from "@/lib/activity-log";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const dateFormat = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateFormat.format(d);
}

/**
 * Presentational, read-only list of activity entries. Any filtering /
 * pagination is decided by the page from the URL; this component just renders
 * whatever it is given, newest first.
 */
export function ActivityLogList({
  entries,
  filtered,
}: {
  entries: ActivityEntry[];
  /** True when filters are active — changes the empty-state wording. */
  filtered: boolean;
}) {
  if (entries.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center rounded-lg border border-dashed bg-background px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <History className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-medium">
          {filtered
            ? "Keine Einträge für diese Filter"
            : "Noch keine Aktivitäten"}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {filtered
            ? "Passe die Filter an oder setze sie zurück, um mehr zu sehen."
            : "Sobald jemand im Team etwas anlegt, ändert oder löscht, erscheint es hier."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">Zeitpunkt</TableHead>
            <TableHead className="w-28">Aktion</TableHead>
            <TableHead className="w-32">Objekttyp</TableHead>
            <TableHead>Objekt</TableHead>
            <TableHead>Nutzer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground tabular-nums">
                {formatWhen(entry.created_at)}
              </TableCell>
              <TableCell>
                <Badge className={actionBadgeClass(entry.action_type)}>
                  {ACTION_LABELS[entry.action_type]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {ENTITY_LABELS[entry.entity_type]}
              </TableCell>
              <TableCell className="font-medium">{entry.entity_name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {entry.actor_email}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
