"use client";

import { useEffect, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import {
  deleteChannel,
  type Channel,
} from "@/app/tools/multi-channel-marketing/kanaele/actions";
import { countActionsForChannel } from "@/app/tools/multi-channel-marketing/aktionen/actions";
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
  const [actionCount, setActionCount] = useState<number | null>(null);

  // Count the actions that will be cascade-deleted with this channel.
  useEffect(() => {
    let cancelled = false;
    if (open && channel) {
      setActionCount(null);
      countActionsForChannel(channel.id).then((count) => {
        if (!cancelled) setActionCount(count);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [open, channel]);

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

  const hasActions = (actionCount ?? 0) > 0;

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

        {hasActions && (
          <p className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Dieser Kanal hat {actionCount}{" "}
              {actionCount === 1 ? "Rabatt-Aktion" : "Rabatt-Aktionen"}. Beim
              Löschen {actionCount === 1 ? "wird diese" : "werden diese"}{" "}
              ebenfalls dauerhaft entfernt und {actionCount === 1
                ? "verschwindet"
                : "verschwinden"}{" "}
              aus dem Kalender.
            </span>
          </p>
        )}

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
