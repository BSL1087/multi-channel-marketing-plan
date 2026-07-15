"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import {
  ACTION_LABELS,
  ACTION_TYPES,
  ENTITY_LABELS,
  ENTITY_TYPES,
  buildLogQuery,
} from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "__all__";

type Filters = { typ?: string; nutzer?: string; aktion?: string };

/**
 * Filter bar for the activity log. Filters live in the URL (like the calendar),
 * so the server page reads them and re-queries. Changing any filter resets to
 * page 1.
 */
export function ActivityLogFilters({
  current,
  users,
}: {
  current: Filters;
  /** Distinct actor e-mails that appear in the log, for the user filter. */
  users: string[];
}) {
  const router = useRouter();

  function update(key: keyof Filters, value: string) {
    const next = value === ALL ? "" : value;
    router.push(buildLogQuery({ ...current, page: "1" }, { [key]: next }));
  }

  const hasFilters = Boolean(current.typ || current.nutzer || current.aktion);

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <Select
        value={current.typ || ALL}
        onValueChange={(v) => update("typ", v)}
      >
        <SelectTrigger className="w-[180px]" aria-label="Nach Objekttyp filtern">
          <SelectValue placeholder="Objekttyp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Alle Objekttypen</SelectItem>
          {ENTITY_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {ENTITY_LABELS[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={current.aktion || ALL}
        onValueChange={(v) => update("aktion", v)}
      >
        <SelectTrigger className="w-[170px]" aria-label="Nach Aktionstyp filtern">
          <SelectValue placeholder="Aktionstyp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Alle Aktionstypen</SelectItem>
          {ACTION_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {ACTION_LABELS[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={current.nutzer || ALL}
        onValueChange={(v) => update("nutzer", v)}
      >
        <SelectTrigger className="w-[220px]" aria-label="Nach Nutzer filtern">
          <SelectValue placeholder="Nutzer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Alle Nutzer</SelectItem>
          {users.map((u) => (
            <SelectItem key={u} value={u}>
              {u}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("?")}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4" />
          Filter zurücksetzen
        </Button>
      )}
    </div>
  );
}
