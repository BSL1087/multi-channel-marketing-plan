"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createAction,
  findActionConflicts,
  updateAction,
  type ActionConflict,
  type ActionStatus,
  type DiscountAction,
} from "@/app/tools/multi-channel-marketing/aktionen/actions";
import { ConflictWarningDialog } from "@/components/conflict-warning-dialog";
import { DeleteActionDialog } from "@/components/delete-action-dialog";
import { ActionStatusDialog } from "@/components/action-status-dialog";
import {
  actionSchema,
  type ActionFormValues,
} from "@/lib/action-validation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  groupChannelsByType,
  type ChannelType,
} from "@/lib/channel-validation";

type Option = { id: string; name: string; type: ChannelType };
type BrandOption = { id: string; name: string; product_group_name: string };

type ActionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this action; otherwise it creates a new one. */
  action: DiscountAction | null;
  brands: BrandOption[];
  channels: Option[];
  /** Pre-fills the start date when creating (e.g. the 1st of the viewed month). */
  defaultStartDate?: string;
  /** Pre-fills the end date when creating. */
  defaultEndDate?: string;
  /** Called after a successful save (e.g. to refresh the calendar). */
  onSuccess?: () => void;
  /**
   * Where the dialog was opened from. Saving a draft in the calendar produces
   * nothing visible there (drafts live in the action management page), so that
   * case gets an explaining toast with a link (PROJ-13).
   */
  origin?: "list" | "calendar";
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Groups brands by product group; groups and brands are sorted alphabetically. */
function groupBrands(
  brands: BrandOption[],
): { group: string; items: BrandOption[] }[] {
  const groups = new Map<string, BrandOption[]>();
  for (const b of brands) {
    const arr = groups.get(b.product_group_name) ?? [];
    arr.push(b);
    groups.set(b.product_group_name, arr);
  }
  return [...groups.entries()]
    .map(([group, items]) => ({
      group,
      items: items
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, "de")),
    }))
    .sort((a, b) => a.group.localeCompare(b.group, "de"));
}

export function ActionFormDialog({
  open,
  onOpenChange,
  action,
  brands,
  channels,
  defaultStartDate,
  defaultEndDate,
  onSuccess,
  origin = "list",
}: ActionFormDialogProps) {
  const isEdit = action !== null;
  const brandGroups = useMemo(() => groupBrands(brands), [brands]);
  // Same order as the calendars: by category, alphabetical inside a category.
  const channelGroups = useMemo(() => groupChannelsByType(channels), [channels]);

  // Conflict warning flow (PROJ-7): hold the validated values while the warning
  // dialog is open so "Trotzdem speichern" can save exactly what was entered.
  const [conflicts, setConflicts] = useState<ActionConflict[]>([]);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [pending, setPending] = useState<ActionFormValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Which save button was pressed (PROJ-13). A ref, not state: the value is
  // read inside the submit handler that the very same click triggers, before
  // a state update would have been applied.
  const saveAsRef = useRef<ActionStatus>("confirmed");

  // Typed discount values per brand, including brands that are currently
  // unchecked: unchecking must not wipe what was entered (PROJ-12). The form
  // value itself only ever holds the CHECKED brands.
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  // "Same value for every selected brand" convenience field.
  const [bulkValue, setBulkValue] = useState("");

  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      title: "",
      marketplaceId: "",
      brands: [],
      startDate: today(),
      endDate: today(),
      comment: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: action?.title ?? "",
        marketplaceId: action?.marketplace_id ?? "",
        brands:
          action?.brands.map((b) => ({
            brandId: b.id,
            discountValue: b.discount_value,
          })) ?? [],
        startDate: action?.start_date ?? defaultStartDate ?? today(),
        endDate: action?.end_date ?? defaultEndDate ?? today(),
        comment: action?.comment ?? "",
      });
      setDraftValues(
        Object.fromEntries(
          action?.brands.map((b) => [b.id, b.discount_value]) ?? [],
        ),
      );
      setBulkValue("");
    }
  }, [open, action, form, defaultStartDate, defaultEndDate]);

  // Disable inputs both during the conflict check (RHF submit) and the save
  // that the warning dialog triggers afterwards.
  const isSubmitting = form.formState.isSubmitting || saving;

  /** Persists the action and closes everything. Shared by the direct path and
   *  the "Trotzdem speichern" path of the conflict dialog. */
  async function save(values: ActionFormValues) {
    const payload = {
      title: values.title,
      marketplaceId: values.marketplaceId,
      brands: values.brands,
      startDate: values.startDate,
      endDate: values.endDate,
      comment: values.comment ?? "",
    };
    // Editing never changes the status — that is a separate, deliberate step.
    const status = saveAsRef.current;
    const result = isEdit
      ? await updateAction(action.id, payload)
      : await createAction(payload, status);

    if (!result.ok) {
      toast.error(result.message);
      return false;
    }

    if (isEdit) {
      toast.success("Aktion gespeichert.");
    } else if (status === "draft") {
      // Saved from the calendar, a draft appears nowhere on screen — say where
      // it went instead of leaving the user staring at an unchanged calendar.
      toast.success("Als Entwurf gespeichert.", {
        description:
          origin === "calendar"
            ? "Der Entwurf liegt unter „Rabatt-Aktionen verwalten“ und erscheint im Kalender, sobald er übernommen wurde."
            : "Er erscheint im Kalender, sobald er übernommen wurde.",
        action:
          origin === "calendar"
            ? {
                label: "Zu den Aktionen",
                onClick: () => {
                  window.location.href =
                    "/tools/multi-channel-marketing/aktionen";
                },
              }
            : undefined,
      });
    } else {
      toast.success("Aktion angelegt.");
    }
    onSuccess?.();
    setConflictOpen(false);
    setPending(null);
    onOpenChange(false);
    return true;
  }

  async function onSubmit(values: ActionFormValues) {
    // Step 1: look for brand/period overlaps. On a technical failure we don't
    // block the user — fall through and save (PROJ-7: "im Zweifel speicherbar").
    const check = await findActionConflicts({
      marketplaceId: values.marketplaceId,
      brandIds: values.brands.map((b) => b.brandId),
      startDate: values.startDate,
      endDate: values.endDate,
      excludeId: isEdit ? action.id : undefined,
    });

    if (check.ok && check.conflicts.length > 0) {
      setConflicts(check.conflicts);
      setPending(values);
      setConflictOpen(true);
      return;
    }

    // Check failed technically (AC-9): inform the user, but don't block — save.
    if (!check.ok) {
      toast.warning(
        "Überschneidungen konnten nicht geprüft werden. Die Aktion wird ohne Prüfung gespeichert.",
      );
    }

    await save(values);
  }

  async function confirmSaveDespiteConflicts() {
    if (!pending) return;
    setSaving(true);
    try {
      await save(pending);
    } finally {
      setSaving(false);
    }
  }

  function cancelConflict() {
    // Return to the form with all inputs intact.
    setConflictOpen(false);
    setPending(null);
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Aktion bearbeiten" : "Aktion hinzufügen"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Ändere die Angaben dieser Rabatt-Aktion."
              : "Lege eine Rabatt-Aktion für einen Kanal und eine oder mehrere Marken an."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel</FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      maxLength={80}
                      placeholder="z.B. Sommer-Sale"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="marketplaceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kanal</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Kanal wählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {channelGroups.map((g) => (
                        <SelectGroup key={g.type}>
                          <SelectLabel>{g.label}</SelectLabel>
                          {g.items.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            <FormField
              control={form.control}
              name="brands"
              render={({ field }) => {
                const selected = new Set(field.value.map((b) => b.brandId));

                /** Adds or removes a brand, keeping its typed value around. */
                function setChecked(brandId: string, checked: boolean) {
                  field.onChange(
                    checked
                      ? [
                          ...field.value,
                          {
                            brandId,
                            discountValue: draftValues[brandId] ?? "",
                          },
                        ]
                      : field.value.filter((b) => b.brandId !== brandId),
                  );
                }

                /** Typing a value implies "this brand too" — check it as well. */
                function setValue(brandId: string, value: string) {
                  setDraftValues((prev) => ({ ...prev, [brandId]: value }));
                  field.onChange(
                    selected.has(brandId)
                      ? field.value.map((b) =>
                          b.brandId === brandId
                            ? { ...b, discountValue: value }
                            : b,
                        )
                      : [...field.value, { brandId, discountValue: value }],
                  );
                }

                /** Writes the bulk value into every currently selected brand. */
                function applyBulk() {
                  const value = bulkValue.trim();
                  if (value.length === 0 || field.value.length === 0) return;
                  setDraftValues((prev) => {
                    const next = { ...prev };
                    for (const b of field.value) next[b.brandId] = value;
                    return next;
                  });
                  field.onChange(
                    field.value.map((b) => ({ ...b, discountValue: value })),
                  );
                }

                const missing = field.value.filter(
                  (b) => b.discountValue.trim().length === 0,
                ).length;
                const showMissing =
                  form.formState.isSubmitted && missing > 0;

                return (
                <FormItem>
                  <FormLabel>Marken & Rabatt</FormLabel>
                  <FormDescription>
                    Wähle alle Marken, die diese Aktion betrifft, und trage je
                    Marke ihren Rabattwert ein – gruppiert nach Produktgruppe.
                  </FormDescription>
                  <div className="max-h-64 space-y-3 overflow-y-auto rounded-md border p-2">
                    {brandGroups.map((g) => (
                      <div key={g.group}>
                        <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {g.group}
                        </p>
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                          {g.items.map((b) => {
                            const checked = selected.has(b.id);
                            const value = draftValues[b.id] ?? "";
                            const invalid =
                              showMissing && checked && value.trim().length === 0;
                            return (
                              <div
                                key={b.id}
                                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
                              >
                                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                                  <Checkbox
                                    checked={checked}
                                    disabled={isSubmitting}
                                    onCheckedChange={(next) =>
                                      setChecked(b.id, next === true)
                                    }
                                  />
                                  <span className="truncate" title={b.name}>
                                    {b.name}
                                  </span>
                                </label>
                                <Input
                                  value={value}
                                  onChange={(e) =>
                                    setValue(b.id, e.target.value)
                                  }
                                  maxLength={50}
                                  placeholder="Rabatt"
                                  disabled={isSubmitting}
                                  aria-label={`Rabattwert für ${b.name}`}
                                  aria-invalid={invalid}
                                  className={cn(
                                    "h-8 w-28 shrink-0 text-sm",
                                    !checked && "opacity-50",
                                    invalid && "border-destructive",
                                  )}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={bulkValue}
                      onChange={(e) => setBulkValue(e.target.value)}
                      maxLength={50}
                      placeholder="z.B. 20% oder 10€"
                      disabled={isSubmitting}
                      aria-label="Rabattwert für alle gewählten Marken"
                      className="h-8 w-40 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={applyBulk}
                      disabled={
                        isSubmitting ||
                        bulkValue.trim().length === 0 ||
                        field.value.length === 0
                      }
                    >
                      Für alle gewählten übernehmen
                    </Button>
                  </div>
                  {showMissing && (
                    <p className="text-sm font-medium text-destructive">
                      {missing === 1
                        ? "1 gewählte Marke ohne Rabattwert."
                        : `${missing} gewählte Marken ohne Rabattwert.`}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
                );
              }}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startdatum</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enddatum</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kommentar (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      maxLength={500}
                      placeholder="z.B. nur Produkt X, Black Friday …"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className={isEdit ? "sm:justify-between" : undefined}>
              {isEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                  Aktion löschen
                </Button>
              )}
              {isEdit ? (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {action.status === "draft" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmOpen(true)}
                      disabled={isSubmitting}
                    >
                      <CalendarCheck className="h-4 w-4" />
                      In Kalender übernehmen
                    </Button>
                  )}
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Speichern
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => {
                      saveAsRef.current = "draft";
                    }}
                  >
                    Als Entwurf speichern
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => {
                      saveAsRef.current = "confirmed";
                    }}
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    In Kalender übernehmen
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    <ConflictWarningDialog
      open={conflictOpen}
      onOpenChange={(next) => {
        // Closing via Esc / overlay behaves like "Abbrechen": keep the form.
        if (!next && !saving) cancelConflict();
      }}
      conflicts={conflicts}
      onConfirm={confirmSaveDespiteConflicts}
      onCancel={cancelConflict}
      saving={saving}
    />

    {isEdit && (
      <DeleteActionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        action={action}
        onSuccess={() => {
          // Close the edit dialog too and let the caller refresh (calendar).
          onSuccess?.();
          onOpenChange(false);
        }}
      />
    )}

    {isEdit && (
      <ActionStatusDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        action={action}
        target="confirmed"
        onSuccess={() => {
          onSuccess?.();
          onOpenChange(false);
        }}
      />
    )}
    </>
  );
}
