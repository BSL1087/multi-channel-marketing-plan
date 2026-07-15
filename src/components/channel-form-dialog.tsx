"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  createChannel,
  updateChannel,
  type Channel,
} from "@/app/tools/multi-channel-marketing/kanaele/actions";
import {
  CHANNEL_TYPE_LABELS,
  CHANNEL_TYPES,
  channelNameSchema,
  channelTypeSchema,
} from "@/lib/channel-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const channelSchema = z.object({
  name: channelNameSchema,
  type: channelTypeSchema,
});

type ChannelValues = z.infer<typeof channelSchema>;

type ChannelFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog renames this channel; otherwise it creates a new one. */
  channel: Channel | null;
};

export function ChannelFormDialog({
  open,
  onOpenChange,
  channel,
}: ChannelFormDialogProps) {
  const isEdit = channel !== null;

  const form = useForm<ChannelValues>({
    resolver: zodResolver(channelSchema),
    defaultValues: { name: "", type: "marketplace" },
  });

  // Prefill with the current values when opening for an edit, reset for a create.
  useEffect(() => {
    if (open) {
      form.reset({
        name: channel?.name ?? "",
        type: channel?.type ?? "marketplace",
      });
    }
  }, [open, channel, form]);

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: ChannelValues) {
    const result = isEdit
      ? await updateChannel(channel.id, values.name, values.type)
      : await createChannel(values.name, values.type);

    if (!result.ok) {
      if (result.duplicate) {
        form.setError("name", { message: result.message });
      } else {
        toast.error(result.message);
      }
      return;
    }

    toast.success(isEdit ? "Kanal gespeichert." : "Kanal angelegt.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Kanal bearbeiten" : "Kanal hinzufügen"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Ändere Name und Typ dieses Vertriebskanals."
              : "Lege einen Marketplace oder eigenen Webshop an (z.B. Amazon, Otto, eigener Shop)."}
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
                      placeholder="z.B. Amazon"
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typ</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="gap-2"
                    >
                      {CHANNEL_TYPES.map((t) => (
                        <FormItem
                          key={t}
                          className="flex items-center gap-2 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={t} disabled={isSubmitting} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {CHANNEL_TYPE_LABELS[t]}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
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
