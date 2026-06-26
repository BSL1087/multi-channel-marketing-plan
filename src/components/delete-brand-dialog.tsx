"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteBrand,
  type Brand,
} from "@/app/tools/multi-channel-marketing/marken/actions";
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

type DeleteBrandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
};

export function DeleteBrandDialog({
  open,
  onOpenChange,
  brand,
}: DeleteBrandDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!brand) return;
    setIsDeleting(true);
    const result = await deleteBrand(brand.id);
    setIsDeleting(false);

    if (!result.ok) {
      toast.error(result.message);
      onOpenChange(false);
      return;
    }

    toast.success("Marke gelöscht.");
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Marke löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            „{brand?.name}" wird dauerhaft entfernt. Diese Aktion kann nicht
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
