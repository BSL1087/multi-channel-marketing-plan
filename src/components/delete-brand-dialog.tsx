"use client";

import { useEffect, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import {
  deleteBrand,
  type Brand,
} from "@/app/tools/multi-channel-marketing/marken/actions";
import {
  getBrandDeletionImpact,
  type BrandDeletionImpact,
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
  const [impact, setImpact] = useState<BrandDeletionImpact | null>(null);

  // Work out how deleting this brand affects its discount actions.
  useEffect(() => {
    let cancelled = false;
    if (open && brand) {
      setImpact(null);
      getBrandDeletionImpact(brand.id).then((result) => {
        if (!cancelled) setImpact(result);
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

  const total = impact?.total ?? 0;
  const removed = impact?.removed ?? 0;
  const kept = total - removed;

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

        {total > 0 && (
          <p className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Diese Marke ist {total}{" "}
              {total === 1 ? "Rabatt-Aktion" : "Rabatt-Aktionen"} zugeordnet.{" "}
              {removed > 0 && (
                <>
                  {removed === total
                    ? `${removed === 1 ? "Diese wird" : "Diese werden"} beim Löschen ebenfalls dauerhaft entfernt`
                    : `${removed} davon ${removed === 1 ? "hat" : "haben"} nur diese Marke und ${removed === 1 ? "wird" : "werden"} mitgelöscht`}
                  {kept > 0
                    ? `; die übrigen ${kept} ${kept === 1 ? "bleibt" : "bleiben"} mit ihren anderen Marken erhalten.`
                    : " und verschwinden aus dem Kalender."}
                </>
              )}
              {removed === 0 && (
                <>
                  {total === 1 ? "Diese bleibt" : "Diese bleiben"} erhalten – nur
                  die Zuordnung zu dieser Marke wird entfernt.
                </>
              )}
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
