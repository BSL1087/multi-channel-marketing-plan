"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Plus,
} from "lucide-react";

import type {
  ActionBrand,
  DiscountAction,
} from "@/app/tools/multi-channel-marketing/aktionen/actions";
import {
  datePx,
  layoutChannelCollapsible,
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
import { barFill, DRAFT_SWATCH } from "@/lib/draft-style";
import {
  CHANNEL_TYPES,
  CHANNEL_TYPE_LABELS_PLURAL,
  CHANNEL_TYPE_STYLES,
  countChannelsByType,
  groupChannelsByType,
  type ChannelType,
} from "@/lib/channel-validation";

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
const CHIP_HEIGHT = 12; // px — bare-text toggle, sits inside one lane
const CHIP_RESERVE = 44; // px (reference frame) needed right of the toggle
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
  /** Both states: drafts are drawn hatched, committed actions solid. */
  actions: DiscountAction[];
  brands: BrandOption[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountAction | null>(null);

  // Channel-type filter (PROJ-3 extension): marketplaces, own webshops and
  // retailers. Every category is visible by default.
  const [visibleTypes, setVisibleTypes] = useState<Record<ChannelType, boolean>>(
    () =>
      CHANNEL_TYPES.reduce(
        (acc, type) => {
          acc[type] = true;
          return acc;
        },
        {} as Record<ChannelType, boolean>,
      ),
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

  // Drafts share the year view since 2026-08-24 — a draft occupies the slot
  // just as much when you are hunting for a free week. Switching them off
  // restores the purely binding "what is really booked" view.
  const [showDrafts, setShowDrafts] = useState(true);
  const draftCount = useMemo(
    () => actions.filter((a) => a.status === "draft").length,
    [actions],
  );
  const shownActions = useMemo(
    () => (showDrafts ? actions : actions.filter((a) => a.status !== "draft")),
    [actions, showDrafts],
  );

  // One bar per (action × brand). Multi-brand actions become several segments.
  const segments = useMemo(() => toSegments(shownActions), [shownActions]);

  // Rows to render = channels whose type is currently enabled in the filter,
  // grouped by category (Marketplaces → eigene Webshops → Händler) and sorted
  // alphabetically inside a category, independent of the channel name.
  const visibleGroups = useMemo(
    () => groupChannelsByType(channels.filter((c) => visibleTypes[c.type])),
    [channels, visibleTypes],
  );
  const visibleChannels = useMemo(
    () => visibleGroups.flatMap((g) => g.items),
    [visibleGroups],
  );

  // Segments that fall in a currently visible channel — drives the legend.
  const visibleSegments = useMemo(() => {
    const visibleIds = new Set(visibleChannels.map((c) => c.id));
    return segments.filter((s) => visibleIds.has(s.action.marketplace_id));
  }, [segments, visibleChannels]);

  const counts = useMemo(() => countChannelsByType(channels), [channels]);

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

  // Channels whose finished actions the user unfolded again (by channel id).
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(
    () => new Set(),
  );
  function toggleChannel(id: string) {
    setExpandedChannels((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  // Group segments by channel, then lay each visible channel out into stacked
  // lanes (keyed by brand, so one brand's non-overlapping bars line up).
  // Finished actions with many brands are truncated behind a toggle; running
  // and planned ones always show every brand.
  const rowGroups = useMemo(() => {
    const map = new Map<string, ActionSegment[]>();
    for (const s of segments) {
      const list = map.get(s.action.marketplace_id) ?? [];
      list.push(s);
      map.set(s.action.marketplace_id, list);
    }
    return visibleGroups.map((group) => ({
      ...group,
      rows: group.items.map((c) => ({
        channel: c,
        row: layoutChannelCollapsible(map.get(c.id) ?? [], year, {
          cutoff: todayIso,
          expanded: expandedChannels.has(c.id),
          baseLanes: BASE_LANES,
          getGroup: (s) => s.brand.id,
          getActionId: (s) => s.action.id,
          getSortKey: (s) => s.brand.name,
        }),
      })),
    }));
  }, [segments, visibleGroups, year, todayIso, expandedChannels]);

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

      {/* Channel-type filter: one toggle per category, colour-coded like the rows. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          Anzeigen:
        </span>
        {CHANNEL_TYPES.map((type) => (
          <div key={type} className="flex items-center gap-2">
            <Checkbox
              id={`filter-${type}`}
              checked={visibleTypes[type]}
              onCheckedChange={(v) =>
                setVisibleTypes((prev) => ({ ...prev, [type]: v === true }))
              }
            />
            <Label
              htmlFor={`filter-${type}`}
              className="flex items-center gap-1.5 font-normal"
            >
              <span
                className={`h-3 w-3 shrink-0 rounded-[2px] ${CHANNEL_TYPE_STYLES[type].swatch}`}
                aria-hidden
              />
              {CHANNEL_TYPE_LABELS_PLURAL[type]}{" "}
              <span className="text-muted-foreground">({counts[type]})</span>
            </Label>
          </div>
        ))}

        {/* Drafts are a different question from the channel categories, hence
            the divider — same row, separate dimension. */}
        {draftCount > 0 && (
          <>
            <span className="h-4 w-px bg-border" aria-hidden />
            <div className="flex items-center gap-2">
              <Checkbox
                id="filter-drafts"
                checked={showDrafts}
                onCheckedChange={(v) => setShowDrafts(v === true)}
              />
              <Label
                htmlFor="filter-drafts"
                className="flex items-center gap-1.5 font-normal"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-[2px]"
                  style={DRAFT_SWATCH}
                  aria-hidden
                />
                Entwürfe{" "}
                <span className="text-muted-foreground">({draftCount})</span>
              </Label>
            </div>
          </>
        )}
      </div>

      {visibleChannels.length === 0 ? (
        <p className="mt-4 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Kein Kanal entspricht dem Filter. Aktiviere oben mindestens einen
          Kanal-Typ.
        </p>
      ) : (
        shownActions.length === 0 && (
          <p className="mt-4 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {/* An empty grid despite existing drafts looks like data loss —
                say that they are merely hidden. */}
            {actions.length === 0 ? (
              <>
                Keine Aktionen in {year}. Lege eine Aktion an oder wechsle das
                Jahr.
              </>
            ) : (
              <>
                Keine übernommenen Aktionen in {year}.{" "}
                {draftCount === 1
                  ? "1 Entwurf ist"
                  : `${draftCount} Entwürfe sind`}{" "}
                ausgeblendet — aktiviere oben „Entwürfe", um sie zu sehen.
              </>
            )}
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

          {/* Channel rows, grouped by category (Marketplaces → Webshops → Händler) */}
          {rowGroups.map((group) => (
            <Fragment key={group.type}>
              {/* Category header — same tint as the label cells beneath it */}
              <div
                className={`flex items-center gap-2 border-b px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${CHANNEL_TYPE_STYLES[group.type].header}`}
              >
                {group.label}
                <span className="font-normal opacity-70">
                  ({group.items.length})
                </span>
              </div>

              {group.rows.map(({ channel, row }) => {
                const rowH = rowHeight(row.lanes);
                const slot = rowH / row.lanes;
                const expanded = expandedChannels.has(channel.id);
                return (
                <div
                  key={channel.id}
                  className={`flex border-b last:border-b-0 ${CHANNEL_TYPE_STYLES[group.type].row}`}
                >
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
                  {row.items.map(({ item, leftPx, widthPx, lane }) => {
                    const isDraft = item.action.status === "draft";
                    return (
                    <TooltipProvider key={item.id} delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => openEdit(item.action)}
                            aria-label={`${item.action.title} (${item.brand.name})${
                              isDraft ? " — Entwurf" : ""
                            }`}
                            data-draft={isDraft || undefined}
                            className="absolute rounded-[2px] ring-1 ring-black/10 transition-[filter] hover:brightness-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            style={{
                              left: pct(leftPx),
                              width: pct(widthPx),
                              minWidth: 2,
                              top: lane * slot + (slot - BAR_HEIGHT) / 2,
                              height: BAR_HEIGHT,
                              ...barFill(item.brand.color, isDraft),
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          {isDraft && (
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                              Entwurf
                            </p>
                          )}
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
                            Rabatt: {item.brand.discount_value}
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
                  })}

                  {/* Truncated past actions: the toggle sits in the next lane,
                      anchored at the action whose brands it hides. */}
                  {row.chips.map((chip) => (
                    <button
                      key={chip.actionId}
                      type="button"
                      onClick={() => toggleChannel(channel.id)}
                      aria-expanded={expanded}
                      title={
                        expanded
                          ? `Alle Marken in ${channel.name} wieder einklappen`
                          : `Alle Marken in ${channel.name} anzeigen`
                      }
                      className="absolute inline-flex items-center gap-0.5 whitespace-nowrap rounded-sm text-[10px] font-medium leading-none text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      style={{
                        top: chip.lane * slot + (slot - CHIP_HEIGHT) / 2,
                        height: CHIP_HEIGHT,
                        ...(chip.leftPx > TRACK_WIDTH - CHIP_RESERVE
                          ? { right: 4 }
                          : { left: pct(chip.leftPx) }),
                      }}
                    >
                      {expanded ? (
                        <ChevronUp className="h-2.5 w-2.5 shrink-0" aria-hidden />
                      ) : (
                        <ChevronDown
                          className="h-2.5 w-2.5 shrink-0"
                          aria-hidden
                        />
                      )}
                      {expanded ? "weniger" : "mehr"}
                    </button>
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
            </Fragment>
          ))}
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
          {/* Texture key — only where hatched bars can actually be seen. */}
          {showDrafts && draftCount > 0 && (
            <div className="flex items-center gap-1.5 pt-0.5 text-xs text-muted-foreground">
              <span
                className="h-3 w-3 shrink-0 rounded-[2px] border"
                style={DRAFT_SWATCH}
                aria-hidden
              />
              schraffiert = Entwurf (noch nicht in den Kalender übernommen)
            </div>
          )}
        </div>
      )}

      <ActionFormDialog
        origin="calendar"
        draftsVisible={showDrafts}
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
