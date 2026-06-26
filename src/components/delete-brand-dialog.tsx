"use client";

import { useEffect, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import {
  deleteBrand,
  type Brand,
} from "@/app/tools/multi-channel-marketing/marken/actions";
import { countActionsForBrand } from "@/app/tools/multi-channel-marketing/aktionen/actions";
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
  const [actionCount, setActionCount] = useState<number | null>(null);

  // Count the actions that will be cascade-deleted with this brand.
  useEffect(() => {
    let cancelled = false;
    if (open && brand) {
      setActionCount(null);
      countActionsForBrand(brand.id).then((count) => {
        if (!cancelled) setActionCount(count);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [open, brand]);

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

  const hasActions = (actionCount ?? 0) > 0;

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

        {hasActions && (
          <p className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Diese Marke hat {actionCount}{" "}
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
