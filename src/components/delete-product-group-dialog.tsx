"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteProductGroup,
  type ProductGroup,
} from "@/app/tools/multi-channel-marketing/produktgruppen/actions";
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

type DeleteProductGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: ProductGroup | null;
};

export function DeleteProductGroupDialog({
  open,
  onOpenChange,
  group,
}: DeleteProductGroupDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!group) return;
    setIsDeleting(true);
    const result = await deleteProductGroup(group.id);
    setIsDeleting(false);

    if (!result.ok) {
      // Blocked (still has brands) or a generic error — both surface as a hint;
      // the group stays untouched and the dialog closes.
      toast.error(result.message);
      onOpenChange(false);
      return;
    }

    toast.success("Produktgruppe gelöscht.");
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Produktgruppe löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            „{group?.name}" wird dauerhaft entfernt. Diese Aktion kann nicht
            rückgängig gemacht werden. Gruppen mit zugeordneten Marken können
            nicht gelöscht werden.
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
