import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogPrimitive,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Delete",
  pending = false,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{body}</AlertDialogDescription>
        <div className="mt-8 flex flex-wrap justify-end gap-2">
          <AlertDialogPrimitive.Cancel asChild>
            <Button type="button" variant="paperOutline" disabled={pending}>
              Keep
            </Button>
          </AlertDialogPrimitive.Cancel>
          <Button
            type="button"
            variant="invert"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? "Removing…" : confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
