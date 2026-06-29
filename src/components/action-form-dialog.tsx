"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createAction,
  findActionConflicts,
  updateAction,
  type ActionConflict,
  type DiscountAction,
} from "@/app/tools/multi-channel-marketing/aktionen/actions";
import { ConflictWarningDialog } from "@/components/conflict-warning-dialog";
import { DeleteActionDialog } from "@/components/delete-action-dialog";
import {
  actionSchema,
  type ActionFormValues,
} from "@/lib/action-validation";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { id: string; name: string };
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
}: ActionFormDialogProps) {
  const isEdit = action !== null;
  const brandGroups = useMemo(() => groupBrands(brands), [brands]);

  // Conflict warning flow (PROJ-7): hold the validated values while the warning
  // dialog is open so "Trotzdem speichern" can save exactly what was entered.
  const [conflicts, setConflicts] = useState<ActionConflict[]>([]);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [pending, setPending] = useState<ActionFormValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      title: "",
      marketplaceId: "",
      brandIds: [],
      startDate: today(),
      endDate: today(),
      discountValue: "",
      comment: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: action?.title ?? "",
        marketplaceId: action?.marketplace_id ?? "",
        brandIds: action?.brands.map((b) => b.id) ?? [],
        startDate: action?.start_date ?? defaultStartDate ?? today(),
        endDate: action?.end_date ?? defaultEndDate ?? today(),
        discountValue: action?.discount_value ?? "",
        comment: action?.comment ?? "",
      });
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
      brandIds: values.brandIds,
      startDate: values.startDate,
      endDate: values.endDate,
      discountValue: values.discountValue,
      comment: values.comment ?? "",
    };
    const result = isEdit
      ? await updateAction(action.id, payload)
      : await createAction(payload);

    if (!result.ok) {
      toast.error(result.message);
      return false;
    }

    toast.success(isEdit ? "Aktion gespeichert." : "Aktion angelegt.");
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
      brandIds: values.brandIds,
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
      <DialogContent className="sm:max-w-lg">
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
                      {channels.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brandIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marken</FormLabel>
                  <FormDescription>
                    Wähle alle Marken, die diese Aktion betrifft – gruppiert nach
                    Produktgruppe.
                  </FormDescription>
                  <div className="max-h-56 space-y-3 overflow-y-auto rounded-md border p-2">
                    {brandGroups.map((g) => (
                      <div key={g.group}>
                        <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {g.group}
                        </p>
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                          {g.items.map((b) => {
                            const checked = field.value.includes(b.id);
                            return (
                              <label
                                key={b.id}
                                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
                              >
                                <Checkbox
                                  checked={checked}
                                  disabled={isSubmitting}
                                  onCheckedChange={(value) => {
                                    field.onChange(
                                      value === true
                                        ? [...field.value, b.id]
                                        : field.value.filter(
                                            (id) => id !== b.id,
                                          ),
                                    );
                                  }}
                                />
                                {b.name}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
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
              name="discountValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rabattwert</FormLabel>
                  <FormControl>
                    <Input
                      maxLength={50}
                      placeholder="z.B. 20% oder 10€"
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Speichern
              </Button>
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
    </>
  );
}
