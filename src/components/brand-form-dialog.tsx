"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import {
  createBrand,
  updateBrand,
  type Brand,
} from "@/app/tools/multi-channel-marketing/marken/actions";
import type { ProductGroup } from "@/app/tools/multi-channel-marketing/produktgruppen/actions";
import {
  brandNameSchema,
  brandColorSchema,
  productGroupIdSchema,
} from "@/lib/brand-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const brandSchema = z.object({
  name: brandNameSchema,
  color: brandColorSchema,
  productGroupId: productGroupIdSchema,
});

type BrandValues = z.infer<typeof brandSchema>;

/** A distinguishable suggested colour, avoiding ones already in use if possible. */
function suggestColor(used: string[]): string {
  const palette = [
    "#2f6f4f", "#b4534b", "#3a6ea5", "#c98a2b", "#6a4c93",
    "#1f7a8c", "#a23e8c", "#4f7942", "#d4612e", "#5b7db1",
    "#8c6d1f", "#b03a48",
  ];
  const usedLower = used.map((c) => c.toLowerCase());
  const free = palette.find((c) => !usedLower.includes(c.toLowerCase()));
  if (free) return free;
  // Fallback: random hex.
  return (
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
  );
}

type BrandFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this brand; otherwise it creates a new one. */
  brand: Brand | null;
  groups: ProductGroup[];
  /** All brands — used to detect an exact colour clash and name the culprit. */
  brands: Brand[];
};

export function BrandFormDialog({
  open,
  onOpenChange,
  brand,
  groups,
  brands,
}: BrandFormDialogProps) {
  const isEdit = brand !== null;

  const form = useForm<BrandValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: "", color: "#2f6f4f", productGroupId: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: brand?.name ?? "",
        color: brand?.color ?? suggestColor(brands.map((b) => b.color)),
        productGroupId: brand?.product_group_id ?? "",
      });
    }
  }, [open, brand, brands, form]);

  const isSubmitting = form.formState.isSubmitting;
  const currentColor = form.watch("color");

  // Soft, non-blocking warning when the exact colour is already taken.
  const colorClash = useMemo(() => {
    if (!currentColor) return null;
    return brands.find(
      (b) =>
        b.id !== brand?.id &&
        b.color.toLowerCase() === currentColor.toLowerCase(),
    );
  }, [brands, brand, currentColor]);

  async function onSubmit(values: BrandValues) {
    const result = isEdit
      ? await updateBrand(brand.id, {
          name: values.name,
          color: values.color,
          productGroupId: values.productGroupId,
        })
      : await createBrand({
          name: values.name,
          color: values.color,
          productGroupId: values.productGroupId,
        });

    if (!result.ok) {
      if (result.duplicate) {
        form.setError("name", { message: result.message });
      } else {
        toast.error(result.message);
      }
      return;
    }

    toast.success(isEdit ? "Marke gespeichert." : "Marke angelegt.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Marke bearbeiten" : "Marke hinzufügen"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Ändere Name, Farbe oder Produktgruppe dieser Marke."
              : "Lege eine Marke mit Farbe und Produktgruppe an."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      maxLength={60}
                      placeholder="z.B. Protein One"
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
              name="productGroupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produktgruppe</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Produktgruppe auswählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farbe</FormLabel>
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <input
                        type="color"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                        aria-label="Farbe wählen"
                        className="h-9 w-14 cursor-pointer rounded border border-input bg-background p-1"
                      />
                    </FormControl>
                    <span className="text-sm font-mono uppercase text-muted-foreground">
                      {field.value}
                    </span>
                  </div>
                  {colorClash && (
                    <p className="flex items-center gap-1.5 text-sm text-amber-600">
                      <TriangleAlert className="h-3.5 w-3.5" />
                      Farbe wird bereits von „{colorClash.name}" genutzt —
                      Speichern ist trotzdem möglich.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Speichern
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
