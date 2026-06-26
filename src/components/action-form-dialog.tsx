"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  createAction,
  updateAction,
  type DiscountAction,
} from "@/app/tools/multi-channel-marketing/aktionen/actions";
import {
  actionSchema,
  type ActionFormValues,
} from "@/lib/action-validation";
import { Button } from "@/components/ui/button";
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

type ActionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this action; otherwise it creates a new one. */
  action: DiscountAction | null;
  brands: Option[];
  channels: Option[];
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ActionFormDialog({
  open,
  onOpenChange,
  action,
  brands,
  channels,
}: ActionFormDialogProps) {
  const isEdit = action !== null;

  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      title: "",
      marketplaceId: "",
      brandId: "",
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
        brandId: action?.brand_id ?? "",
        startDate: action?.start_date ?? today(),
        endDate: action?.end_date ?? today(),
        discountValue: action?.discount_value ?? "",
        comment: action?.comment ?? "",
      });
    }
  }, [open, action, form]);

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: ActionFormValues) {
    const payload = {
      title: values.title,
      marketplaceId: values.marketplaceId,
      brandId: values.brandId,
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
      return;
    }

    toast.success(isEdit ? "Aktion gespeichert." : "Aktion angelegt.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Aktion bearbeiten" : "Aktion hinzufügen"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Ändere die Angaben dieser Rabatt-Aktion."
              : "Lege eine Rabatt-Aktion für einen Kanal und eine Marke an."}
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marke</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Marke wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
