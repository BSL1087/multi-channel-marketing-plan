"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteChannel,
  type Channel,
} from "@/app/tools/multi-channel-marketing/kanaele/actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteChannelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: Channel | null;
};

export function DeleteChannelDialog({
  open,
  onOpenChange,
  channel,
}: DeleteChannelDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!channel) return;
    setIsDeleting(true);
    const result = await deleteChannel(channel.id);
    setIsDeleting(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success("Kanal gelöscht.");
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kanal löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            „{channel?.name}" wird dauerhaft entfernt. Diese Aktion kann nicht
            rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Löschen
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
