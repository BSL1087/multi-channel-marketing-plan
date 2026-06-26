"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  createChannel,
  renameChannel,
  type Channel,
} from "@/app/tools/multi-channel-marketing/kanaele/actions";
import { channelNameSchema } from "@/lib/channel-validation";
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

const channelSchema = z.object({
  name: channelNameSchema,
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
    defaultValues: { name: "" },
  });

  // Prefill with the current name when opening for an edit, reset for a create.
  useEffect(() => {
    if (open) {
      form.reset({ name: channel?.name ?? "" });
    }
  }, [open, channel, form]);

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: ChannelValues) {
    const result = isEdit
      ? await renameChannel(channel.id, values.name)
      : await createChannel(values.name);

    if (!result.ok) {
      if (result.duplicate) {
        form.setError("name", { message: result.message });
      } else {
        toast.error(result.message);
      }
      return;
    }

    toast.success(isEdit ? "Kanal umbenannt." : "Kanal angelegt.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Kanal umbenennen" : "Kanal hinzufügen"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Ändere den Namen dieses Vertriebskanals."
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
