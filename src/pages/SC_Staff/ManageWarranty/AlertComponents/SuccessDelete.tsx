import { AlertTriangle, Trash2 } from "lucide-react"; // Gom import icon
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SuccessDeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function SuccessDelete({
  open,
  onOpenChange,
  onCancel,
  onConfirm,
}: SuccessDeleteProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận xóa yêu cầu bảo hành
          </DialogTitle>
          <DialogDescription className="text-base mt-2 text-slate-600">
            Bạn có chắc chắn muốn xóa yêu cầu bảo hành này không? <br />
            Hành động này{" "}
            <span className="font-semibold text-red-500">
              không thể hoàn tác.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>

          <Button className="gap-2 bg-red-500 ml-2" onClick={onConfirm}>
            <Trash2 className="h-4 w-4" />
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
