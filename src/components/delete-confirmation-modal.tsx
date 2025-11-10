import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface DeleteConfirmationModalProps {
  title?: string;
  subtitle?: string;
  open: boolean;
  setOpen: (val: boolean) => void;
  onConfirm?: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({
  open,
  setOpen,
  title,
  onConfirm,
  subtitle,
  isDeleting,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] border-2 border-black rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-black font-medium text-base">
            {subtitle}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              className="border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 flex-1"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={onConfirm}
            isLoading={isDeleting}
            className="bg-red-600 hover:bg-red-700 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 text-black flex-1"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
