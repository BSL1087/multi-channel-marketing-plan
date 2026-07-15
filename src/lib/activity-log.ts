/**
 * Shared types, labels and helpers for the activity log (PROJ-9).
 *
 * The log is readable ONLY by the account below. This constant gates the
 * dashboard card and the page; the real security boundary is the RLS policy
 * on `activity_log` (added by /backend), which references the same address.
 * Changing the authorised person requires updating BOTH this constant and the
 * RLS policy (migration).
 */
export const ACTIVITY_LOG_EMAIL = "benedikt@agonsworld.com";

/** How many entries per page. */
export const PAGE_SIZE = 50;

export const ENTITY_TYPES = [
  "discount_action",
  "brand",
  "marketplace",
  "product_group",
] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export const ACTION_TYPES = ["created", "updated", "deleted"] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

/** German labels for the object type shown per entry / in the filter. */
export const ENTITY_LABELS: Record<EntityType, string> = {
  discount_action: "Rabatt-Aktion",
  brand: "Marke",
  marketplace: "Kanal",
  product_group: "Produktgruppe",
};

/** German labels for the action type shown per entry / in the filter. */
export const ACTION_LABELS: Record<ActionType, string> = {
  created: "angelegt",
  updated: "geändert",
  deleted: "gelöscht",
};

/** One row of the log, as rendered in the UI. */
export type ActivityEntry = {
  id: string;
  actor_email: string;
  action_type: ActionType;
  entity_type: EntityType;
  entity_name: string;
  created_at: string; // ISO timestamp
};

export function isEntityType(value: string | undefined): value is EntityType {
  return !!value && (ENTITY_TYPES as readonly string[]).includes(value);
}

export function isActionType(value: string | undefined): value is ActionType {
  return !!value && (ACTION_TYPES as readonly string[]).includes(value);
}

/** Badge colour per action type: green = created, neutral = updated, red = deleted. */
export function actionBadgeClass(type: ActionType): string {
  switch (type) {
    case "created":
      return "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    case "deleted":
      return "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/10";
    case "updated":
    default:
      return "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary";
  }
}

/**
 * Build a querystring for a log URL, taking the current filters and applying
 * overrides. Empty / "all" values are dropped so the URL stays clean. Any
 * filter change resets to page 1 unless `page` is explicitly provided.
 */
export function buildLogQuery(
  current: { typ?: string; nutzer?: string; aktion?: string; page?: string },
  overrides: Partial<{
    typ: string;
    nutzer: string;
    aktion: string;
    page: string;
  }>,
): string {
  const merged = { ...current, ...overrides };
  const params = new URLSearchParams();
  if (merged.typ) params.set("typ", merged.typ);
  if (merged.nutzer) params.set("nutzer", merged.nutzer);
  if (merged.aktion) params.set("aktion", merged.aktion);
  if (merged.page && merged.page !== "1") params.set("page", merged.page);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
