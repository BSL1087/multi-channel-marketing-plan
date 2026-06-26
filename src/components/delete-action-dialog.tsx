"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteAction,
  type DiscountAction,
} from "@/app/tools/multi-channel-marketing/aktionen/actions";
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

type DeleteActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: DiscountAction | null;
  /** Called after a successful delete (e.g. to refresh the calendar). */
  onSuccess?: () => void;
};

export function DeleteActionDialog({
  open,
  onOpenChange,
  action,
  onSuccess,
}: DeleteActionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!action) return;
    setIsDeleting(true);
    const result = await deleteAction(action.id);
    setIsDeleting(false);

    if (!result.ok) {
      toast.error(result.message);
      onOpenChange(false);
      return;
    }

    toast.success("Aktion gelöscht.");
    onSuccess?.();
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Aktion löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            „{action?.title}" wird dauerhaft entfernt. Diese Aktion kann nicht
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
