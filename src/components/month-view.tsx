"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

import type {
  ActionBrand,
  DiscountAction,
} from "@/app/tools/multi-channel-marketing/aktionen/actions";
import {
  DAY_WIDTH,
  formatDate,
  isLightColor,
  layoutMonthChannel,
  monthDays,
  monthName,
  monthTrackWidth,
} from "@/lib/month-layout";
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

/** One renderable bar = one brand of one action (multi-brand → several bars). */
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

const LABEL_WIDTH = "11rem";
const BAR_HEIGHT = 20; // px — fixed labelled bar height (no stretch)
const LANE_SLOT = 26; // px per lane (bar + gap)
const ROW_PAD = 6; // px top/bottom padding inside a channel row
const BASE_LANES = 2; // base row holds 2 lanes; only a 3rd+ lane grows the row

/** Row height: fixed for up to 2 lanes, then +LANE_SLOT per additional lane. */
function rowHeight(lanes: number): number {
  const effective = Math.max(lanes, BASE_LANES);
  return ROW_PAD * 2 + (effective - 1) * LANE_SLOT + BAR_HEIGHT;
}

export function MonthView({
  year,
  month,
  channels,
  actions,
  brands,
}: {
  year: number;
  /** 0-based month index (Jan = 0). */
  month: number;
  channels: Option[];
  actions: DiscountAction[];
  brands: BrandOption[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountAction | null>(null);

  const days = useMemo(() => monthDays(year, month), [year, month]);
  // Reference width = days × DAY_REF. Positions are percentages of this, so the
  // track stretches to fill any width (like the year view) but keeps day ratios.
  const trackRef = useMemo(() => monthTrackWidth(year, month), [year, month]);
  const pct = (px: number) => `${(px / trackRef) * 100}%`;
  const segments = useMemo(() => toSegments(actions), [actions]);

  // Group segments by channel, then lay each channel into stacked lanes.
  const byChannel = useMemo(() => {
    const map = new Map<string, ActionSegment[]>();
    for (const s of segments) {
      const list = map.get(s.action.marketplace_id) ?? [];
      list.push(s);
      map.set(s.action.marketplace_id, list);
    }
    return channels.map((c) => ({
      channel: c,
      layout: layoutMonthChannel(
        map.get(c.id) ?? [],
        year,
        month,
        (s) => s.brand.id,
      ),
    }));
  }, [segments, channels, year, month]);

  // Colour legend: brands present this month, grouped by product group.
  const legend = useMemo(() => {
    const present = new Set(segments.map((s) => s.brand.id));
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
  }, [segments, brands]);

  function goToMonth(y: number, m0: number) {
    router.push(`?year=${y}&month=${m0 + 1}`);
  }
  const prev = () =>
    month === 0 ? goToMonth(year - 1, 11) : goToMonth(year, month - 1);
  const next = () =>
    month === 11 ? goToMonth(year + 1, 0) : goToMonth(year, month + 1);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(action: DiscountAction) {
    setEditing(action);
    setFormOpen(true);
  }
  const refresh = () => router.refresh();

  // First day of the displayed month — pre-fills the create dialog (PROJ-8).
  const monthFirstDay = `${year}-${String(month + 1).padStart(2, "0")}-01`;

  if (channels.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center rounded-lg border border-dashed bg-background px-6 py-16 text-center">
        <h2 className="font-medium">Noch keine Kanäle angelegt</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Der Kalender zeigt Aktionen je Kanal. Lege zuerst mindestens einen
          Kanal an.
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
            aria-label="Vorheriger Monat"
            onClick={prev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-44 text-center text-lg font-semibold">
            {monthName(month)} {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Nächster Monat"
            onClick={next}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`?year=${year}`}>
              <CalendarRange className="h-4 w-4" />
              Zur Jahresansicht
            </Link>
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Aktion hinzufügen
          </Button>
        </div>
      </div>

      {actions.length === 0 && (
        <p className="mt-4 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Keine Aktionen im {monthName(month)} {year}. Lege eine Aktion an oder
          wechsle den Monat.
        </p>
      )}

      {/* Calendar grid (fills width like the year view; scrolls on small screens) */}
      <div className="mt-4 overflow-x-auto rounded-lg border bg-background">
        <div style={{ minWidth: `calc(${LABEL_WIDTH} + ${trackRef}px)` }}>
          {/* Day axis */}
          <div className="flex border-b bg-muted/30">
            <div
              className="shrink-0 border-r px-3 py-1.5 text-xs font-medium text-muted-foreground"
              style={{ width: LABEL_WIDTH }}
            >
              Kanal
            </div>
            <div className="flex flex-1">
              {days.map((d) => (
                <div
                  key={d.day}
                  className={`flex flex-1 flex-col items-center justify-center border-l py-1 text-center ${
                    d.isWeekend ? "bg-muted/60" : ""
                  } ${d.isToday ? "bg-primary/10" : ""}`}
                  style={{ minWidth: DAY_WIDTH }}
                >
                  <span className="text-[10px] leading-none text-muted-foreground">
                    {d.weekday}
                  </span>
                  <span
                    className={`text-xs leading-tight tabular-nums ${
                      d.isToday ? "font-bold text-primary" : ""
                    }`}
                  >
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Channel rows */}
          {byChannel.map(({ channel, layout }) => {
            const rowH = rowHeight(layout.lanes);
            return (
              <div key={channel.id} className="flex border-b last:border-b-0">
                <div
                  className="flex shrink-0 items-center border-r px-3 text-sm font-medium"
                  style={{ width: LABEL_WIDTH }}
                >
                  {channel.name}
                </div>
                <div className="relative flex-1" style={{ height: rowH }}>
                  {/* Day gridlines + weekend/today shading */}
                  {days.map((d) => (
                    <div
                      key={d.day}
                      className={`absolute top-0 h-full border-l border-border/50 ${
                        d.isWeekend ? "bg-muted/40" : ""
                      } ${d.isToday ? "bg-primary/5" : ""}`}
                      style={{ left: pct(d.leftPx), width: pct(DAY_WIDTH) }}
                    />
                  ))}

                  {/* Labelled action bars (stacked on overlap) */}
                  {layout.items.map(
                    ({ item, leftPx, widthPx, lane, clippedStart, clippedEnd }) => {
                      const light = isLightColor(item.brand.color);
                      const showDiscount = widthPx >= 4 * DAY_WIDTH;
                      return (
                        <TooltipProvider key={item.id} delayDuration={150}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => openEdit(item.action)}
                                aria-label={`${item.action.title} (${item.brand.name})`}
                                className={`absolute flex items-center gap-1 overflow-hidden px-1.5 text-left ring-1 ring-black/10 transition-[filter] hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                  clippedStart ? "rounded-l-none" : "rounded-l-[3px]"
                                } ${
                                  clippedEnd ? "rounded-r-none" : "rounded-r-[3px]"
                                }`}
                                style={{
                                  left: pct(leftPx),
                                  width: pct(widthPx),
                                  top: ROW_PAD + lane * LANE_SLOT,
                                  height: BAR_HEIGHT,
                                  backgroundColor: item.brand.color,
                                  color: light ? "#111827" : "#ffffff",
                                }}
                              >
                                {clippedStart && (
                                  <ChevronLeft className="h-3 w-3 shrink-0 opacity-80" />
                                )}
                                <span className="truncate text-[11px] font-medium leading-none">
                                  {item.action.title}
                                  {showDiscount && (
                                    <span className="font-normal opacity-90">
                                      {" · "}
                                      {item.action.discount_value}
                                    </span>
                                  )}
                                </span>
                                {clippedEnd && (
                                  <ChevronRight className="ml-auto h-3 w-3 shrink-0 opacity-80" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold">{item.action.title}</p>
                              <p className="text-xs">
                                {item.action.brands.map((b) => b.name).join(", ")}{" "}
                                · {item.action.marketplace_name}
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
                      );
                    },
                  )}
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
        defaultStartDate={monthFirstDay}
        defaultEndDate={monthFirstDay}
        onSuccess={refresh}
      />
    </div>
  );
}
