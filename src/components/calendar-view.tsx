"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import type { DiscountAction } from "@/app/tools/multi-channel-marketing/aktionen/actions";
import {
  layoutChannel,
  monthColumns,
  isLightColor,
  formatDate,
} from "@/lib/calendar-layout";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ActionFormDialog } from "@/components/action-form-dialog";

type Option = { id: string; name: string };

const LANE_HEIGHT = 30; // px per stacked sub-lane (bar + gap)
const LABEL_WIDTH = "11rem";

export function CalendarView({
  year,
  channels,
  actions,
  brands,
}: {
  year: number;
  channels: Option[];
  actions: DiscountAction[];
  brands: Option[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountAction | null>(null);

  const months = useMemo(() => monthColumns(year), [year]);

  // Group actions by channel, then lay each channel out into stacked lanes.
  const byChannel = useMemo(() => {
    const map = new Map<string, DiscountAction[]>();
    for (const a of actions) {
      const list = map.get(a.marketplace_id) ?? [];
      list.push(a);
      map.set(a.marketplace_id, list);
    }
    return channels.map((c) => ({
      channel: c,
      layout: layoutChannel(map.get(c.id) ?? [], year),
    }));
  }, [actions, channels, year]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(action: DiscountAction) {
    setEditing(action);
    setFormOpen(true);
  }
  const refresh = () => router.refresh();

  // No channels → the matrix has no rows; guide the user.
  if (channels.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center rounded-lg border border-dashed bg-background px-6 py-16 text-center">
        <h2 className="font-medium">Noch keine Kanäle angelegt</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Der Jahreskalender zeigt Aktionen je Kanal. Lege zuerst mindestens
          einen Kanal an.
        </p>
        <Button asChild size="sm" className="mt-4">
          <Link href="/tools/multi-channel-marketing/kanaele">
            Zur Kanal-Verwaltung
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Vorheriges Jahr"
            onClick={() => router.push(`?year=${year - 1}`)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-16 text-center text-lg font-semibold tabular-nums">
            {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Nächstes Jahr"
            onClick={() => router.push(`?year=${year + 1}`)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Aktion hinzufügen
        </Button>
      </div>

      {actions.length === 0 && (
        <p className="mt-4 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Keine Aktionen in {year}. Lege eine Aktion an oder wechsle das Jahr.
        </p>
      )}

      {/* Calendar grid (horizontally scrollable on small screens) */}
      <div className="mt-4 overflow-x-auto rounded-lg border bg-background">
        <div className="min-w-[820px]">
          {/* Month axis */}
          <div className="flex border-b bg-muted/30">
            <div
              className="shrink-0 border-r px-3 py-2 text-xs font-medium text-muted-foreground"
              style={{ width: LABEL_WIDTH }}
            >
              Kanal
            </div>
            <div className="relative h-8 flex-1">
              {months.map((m) => (
                <div
                  key={m.label}
                  className="absolute top-0 flex h-full items-center justify-center border-l text-xs text-muted-foreground"
                  style={{ left: `${m.leftPct}%`, width: `${m.widthPct}%` }}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* Channel rows */}
          {byChannel.map(({ channel, layout }) => (
            <div key={channel.id} className="flex border-b last:border-b-0">
              <div
                className="shrink-0 border-r px-3 py-2 text-sm font-medium"
                style={{ width: LABEL_WIDTH }}
              >
                {channel.name}
              </div>
              <div
                className="relative flex-1"
                style={{ height: layout.lanes * LANE_HEIGHT + 8 }}
              >
                {/* Month gridlines */}
                {months.map((m) => (
                  <div
                    key={m.label}
                    className="absolute top-0 h-full border-l border-border/60"
                    style={{ left: `${m.leftPct}%` }}
                  />
                ))}

                {/* Action bars */}
                {layout.items.map(({ item, leftPct, widthPct, lane }) => {
                  const light = isLightColor(item.brand_color);
                  return (
                    <TooltipProvider key={item.id} delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="absolute flex items-center overflow-hidden rounded px-1.5 text-xs font-medium shadow-sm ring-1 ring-black/10 transition-[filter] hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                              minWidth: "0.5rem",
                              top: lane * LANE_HEIGHT + 4,
                              height: LANE_HEIGHT - 8,
                              backgroundColor: item.brand_color,
                              color: light ? "#1a1a1a" : "#ffffff",
                            }}
                          >
                            <span className="truncate">{item.brand_name}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-xs">
                            {item.brand_name} · {item.marketplace_name}
                          </p>
                          <p className="text-xs">
                            {formatDate(item.start_date)} –{" "}
                            {formatDate(item.end_date)}
                          </p>
                          <p className="text-xs">Rabatt: {item.discount_value}</p>
                          {item.comment && (
                            <p className="mt-1 text-xs italic text-muted-foreground">
                              {item.comment}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ActionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        action={editing}
        brands={brands}
        channels={channels}
        onSuccess={refresh}
      />
    </div>
  );
}
