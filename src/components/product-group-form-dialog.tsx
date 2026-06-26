"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  createProductGroup,
  renameProductGroup,
  type ProductGroup,
} from "@/app/tools/multi-channel-marketing/produktgruppen/actions";
import { productGroupNameSchema } from "@/lib/product-group-validation";
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

const groupSchema = z.object({
  name: productGroupNameSchema,
});

type GroupValues = z.infer<typeof groupSchema>;

type ProductGroupFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog renames this group; otherwise it creates a new one. */
  group: ProductGroup | null;
};

export function ProductGroupFormDialog({
  open,
  onOpenChange,
  group,
}: ProductGroupFormDialogProps) {
  const isEdit = group !== null;

  const form = useForm<GroupValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: "" },
  });

  // Prefill with the current name when opening for an edit, reset for a create.
  useEffect(() => {
    if (open) {
      form.reset({ name: group?.name ?? "" });
    }
  }, [open, group, form]);

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: GroupValues) {
    const result = isEdit
      ? await renameProductGroup(group.id, values.name)
      : await createProductGroup(values.name);

    if (!result.ok) {
      if (result.duplicate) {
        form.setError("name", { message: result.message });
      } else {
        toast.error(result.message);
      }
      return;
    }

    toast.success(isEdit ? "Produktgruppe umbenannt." : "Produktgruppe angelegt.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Produktgruppe umbenennen" : "Gruppe hinzufügen"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Ändere den Namen dieser Produktgruppe."
              : "Lege eine Produktgruppe an (z.B. Fitness, Familie), um Marken danach zu gruppieren."}
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
                      placeholder="z.B. Fitness"
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
