"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import type { DiscountAction } from "@/app/tools/multi-channel-marketing/aktionen/actions";
import {
  layoutChannel,
  monthColumns,
  formatDate,
  TRACK_WIDTH,
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
type BrandOption = {
  id: string;
  name: string;
  color: string;
  product_group_name: string;
};

const BAR_HEIGHT = 8; // px — unlabeled day-accurate colour bar
const ROW_BASE = 40; // px — default row height; holds up to BASE_LANES bars
const BASE_LANES = 3; // up to 3 parallel actions fit within ROW_BASE
const LANE_EXTRA = 16; // px added per lane beyond BASE_LANES
const LABEL_WIDTH = "11rem";

/** Channel row height: 40px for up to 3 lanes, then +16px per extra lane. */
function rowHeight(lanes: number): number {
  return lanes <= BASE_LANES
    ? ROW_BASE
    : ROW_BASE + (lanes - BASE_LANES) * LANE_EXTRA;
}

/** Reference-frame pixels (768px track) → percent, so the axis fills any width. */
function pct(px: number): string {
  return `${(px / TRACK_WIDTH) * 100}%`;
}

export function CalendarView({
  year,
  channels,
  actions,
  brands,
}: {
  year: number;
  channels: Option[];
  actions: DiscountAction[];
  brands: BrandOption[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountAction | null>(null);

  const months = useMemo(() => monthColumns(), []);

  // Colour legend: brands that appear in the displayed year, grouped by product group.
  const legend = useMemo(() => {
    const present = new Set(actions.map((a) => a.brand_id));
    const groups = new Map<string, BrandOption[]>();
    for (const b of brands) {
      if (!present.has(b.id)) continue;
      const arr = groups.get(b.product_group_name) ?? [];
      arr.push(b);
      groups.set(b.product_group_name, arr);
    }
    return [...groups.entries()]
      .map(([group, items]) => ({
        group,
        items: items.sort((a, b) => a.name.localeCompare(b.name, "de")),
      }))
      .sort((a, b) => a.group.localeCompare(b.group, "de"));
  }, [actions, brands]);

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
      layout: layoutChannel(map.get(c.id) ?? [], year, (a) => a.brand_id),
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
                  style={{ left: pct(m.leftPx), width: pct(m.widthPx) }}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* Channel rows */}
          {byChannel.map(({ channel, layout }) => {
            const rowH = rowHeight(layout.lanes);
            const slot = rowH / layout.lanes;
            return (
            <div key={channel.id} className="flex border-b last:border-b-0">
              <div
                className="flex shrink-0 items-center border-r px-3 text-sm font-medium"
                style={{ width: LABEL_WIDTH }}
              >
                {channel.name}
              </div>
              <div className="relative flex-1" style={{ height: rowH }}>
                {/* Month gridlines */}
                {months.map((m) => (
                  <div
                    key={m.label}
                    className="absolute top-0 h-full border-l border-border/60"
                    style={{ left: pct(m.leftPx) }}
                  />
                ))}

                {/* Day-accurate action bars (stacked on overlap) */}
                {layout.items.map(({ item, leftPx, widthPx, lane }) => (
                  <TooltipProvider key={item.id} delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          aria-label={`${item.title} (${item.brand_name})`}
                          className="absolute rounded-[2px] ring-1 ring-black/10 transition-[filter] hover:brightness-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          style={{
                            left: pct(leftPx),
                            width: pct(widthPx),
                            minWidth: 2,
                            top: lane * slot + (slot - BAR_HEIGHT) / 2,
                            height: BAR_HEIGHT,
                            backgroundColor: item.brand_color,
                          }}
                        />
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
                ))}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Colour legend, grouped by product group */}
      {legend.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5">
          {legend.map((g) => (
            <div
              key={g.group}
              className="flex flex-wrap items-center gap-x-4 gap-y-1.5"
            >
              <span className="w-20 shrink-0 text-xs font-semibold text-muted-foreground">
                {g.group}
              </span>
              {g.items.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-1.5 text-xs"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-[2px] border"
                    style={{ backgroundColor: b.color }}
                    aria-hidden
                  />
                  {b.name}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

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
