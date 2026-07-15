"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import type {
  ActionBrand,
  DiscountAction,
} from "@/app/tools/multi-channel-marketing/aktionen/actions";
import {
  datePx,
  layoutChannel,
  monthColumns,
  formatDate,
  TRACK_WIDTH,
} from "@/lib/calendar-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ActionFormDialog } from "@/components/action-form-dialog";
import type { ChannelType } from "@/lib/channel-validation";

type Option = { id: string; name: string; type: ChannelType };
type BrandOption = {
  id: string;
  name: string;
  color: string;
  product_group_name: string;
};

/**
 * One renderable bar = one brand of one action. A multi-brand action produces
 * several segments (one per brand), so every brand keeps its own coloured track
 * — which is what makes per-brand overlaps visible across channels.
 */
type ActionSegment = {
  id: string;
  start_date: string;
  end_date: string;
  action: DiscountAction;
  brand: ActionBrand;
};

function toSegments(actions: DiscountAction[]): ActionSegment[] {
  return actions.flatMap((action) =>
    action.brands.map((brand) => ({
      id: `${action.id}:${brand.id}`,
      start_date: action.start_date,
      end_date: action.end_date,
      action,
      brand,
    })),
  );
}

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

  // Channel-type filter (PROJ-3 extension): show own webshops and/or marketplaces.
  const [visibleTypes, setVisibleTypes] = useState<Record<ChannelType, boolean>>(
    { webshop: true, marketplace: true },
  );

  const months = useMemo(() => monthColumns(), []);

  // "Today" marker — resolved after mount (local date, avoids a hydration
  // mismatch). datePx returns null unless the displayed year is the current
  // year, so the line only appears when it is meaningful.
  const [todayIso, setTodayIso] = useState<string | null>(null);
  useEffect(() => {
    const d = new Date();
    setTodayIso(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}`,
    );
  }, []);
  const todayPx = todayIso ? datePx(todayIso, year) : null;
  const todayLeft = todayPx !== null ? pct(todayPx) : null;

  // One bar per (action × brand). Multi-brand actions become several segments.
  const segments = useMemo(() => toSegments(actions), [actions]);

  // Rows to render = channels whose type is currently enabled in the filter.
  const visibleChannels = useMemo(
    () => channels.filter((c) => visibleTypes[c.type]),
    [channels, visibleTypes],
  );

  // Segments that fall in a currently visible channel — drives the legend.
  const visibleSegments = useMemo(() => {
    const visibleIds = new Set(visibleChannels.map((c) => c.id));
    return segments.filter((s) => visibleIds.has(s.action.marketplace_id));
  }, [segments, visibleChannels]);

  const counts = useMemo(() => {
    let webshop = 0;
    let marketplace = 0;
    for (const c of channels) {
      if (c.type === "webshop") webshop++;
      else marketplace++;
    }
    return { webshop, marketplace };
  }, [channels]);

  // Colour legend: brands that appear in the visible rows, grouped by product group.
  const legend = useMemo(() => {
    const present = new Set(visibleSegments.map((s) => s.brand.id));
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
  }, [visibleSegments, brands]);

  // Group segments by channel, then lay each visible channel out into stacked
  // lanes (keyed by brand, so one brand's non-overlapping bars line up).
  const byChannel = useMemo(() => {
    const map = new Map<string, ActionSegment[]>();
    for (const s of segments) {
      const list = map.get(s.action.marketplace_id) ?? [];
      list.push(s);
      map.set(s.action.marketplace_id, list);
    }
    return visibleChannels.map((c) => ({
      channel: c,
      layout: layoutChannel(map.get(c.id) ?? [], year, (s) => s.brand.id),
    }));
  }, [segments, visibleChannels, year]);

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

      {/* Channel-type filter: toggle own webshops vs. external marketplaces. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          Anzeigen:
        </span>
        <div className="flex items-center gap-2">
          <Checkbox
            id="filter-webshop"
            checked={visibleTypes.webshop}
            onCheckedChange={(v) =>
              setVisibleTypes((prev) => ({ ...prev, webshop: v === true }))
            }
          />
          <Label htmlFor="filter-webshop" className="font-normal">
            Eigene Webshops{" "}
            <span className="text-muted-foreground">({counts.webshop})</span>
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="filter-marketplace"
            checked={visibleTypes.marketplace}
            onCheckedChange={(v) =>
              setVisibleTypes((prev) => ({ ...prev, marketplace: v === true }))
            }
          />
          <Label htmlFor="filter-marketplace" className="font-normal">
            Marketplaces{" "}
            <span className="text-muted-foreground">({counts.marketplace})</span>
          </Label>
        </div>
      </div>

      {visibleChannels.length === 0 ? (
        <p className="mt-4 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Kein Kanal entspricht dem Filter. Aktiviere oben mindestens einen
          Kanal-Typ.
        </p>
      ) : (
        actions.length === 0 && (
          <p className="mt-4 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Keine Aktionen in {year}. Lege eine Aktion an oder wechsle das Jahr.
          </p>
        )
      )}

      {/* Calendar grid (horizontally scrollable on small screens) */}
      {visibleChannels.length > 0 && (
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
              {months.map((m, i) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => router.push(`?year=${year}&month=${i + 1}`)}
                  title={`${m.label} im Detail öffnen`}
                  className="absolute top-0 flex h-full items-center justify-center border-l text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ left: pct(m.leftPx), width: pct(m.widthPx) }}
                >
                  {m.label}
                </button>
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
                          onClick={() => openEdit(item.action)}
                          aria-label={`${item.action.title} (${item.brand.name})`}
                          className="absolute rounded-[2px] ring-1 ring-black/10 transition-[filter] hover:brightness-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          style={{
                            left: pct(leftPx),
                            width: pct(widthPx),
                            minWidth: 2,
                            top: lane * slot + (slot - BAR_HEIGHT) / 2,
                            height: BAR_HEIGHT,
                            backgroundColor: item.brand.color,
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold">{item.action.title}</p>
                        <p className="text-xs">
                          {item.action.brands.map((b) => b.name).join(", ")} ·{" "}
                          {item.action.marketplace_name}
                        </p>
                        <p className="text-xs">
                          {formatDate(item.start_date)} –{" "}
                          {formatDate(item.end_date)}
                        </p>
                        <p className="text-xs">
                          Rabatt: {item.action.discount_value}
                        </p>
                        {item.action.comment && (
                          <p className="mt-1 text-xs italic text-muted-foreground">
                            {item.action.comment}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}

                {/* "Today" marker: dashed line, below the month axis, click-through */}
                {todayLeft !== null && (
                  <div
                    className="pointer-events-none absolute top-0 z-10 h-full w-0 border-l border-dashed border-primary/70"
                    style={{ left: todayLeft }}
                    aria-hidden
                  />
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>
      )}

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
