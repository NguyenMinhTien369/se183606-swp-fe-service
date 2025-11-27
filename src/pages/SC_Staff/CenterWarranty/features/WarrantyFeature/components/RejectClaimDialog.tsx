import { XCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RejectClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimId: number; // ID của đơn bảo hành để hiển thị
  reason: string; // State lưu lý do từ chối (rejectReason)
  onReasonChange: (value: string) => void; // Hàm set state (setRejectReason)
  onConfirm: () => void; // Hàm gọi API (handleConfirmReject)
  isRejecting: boolean; // Trạng thái loading
}

export default function RejectClaimDialog({
  open,
  onOpenChange,
  claimId,
  reason,
  onReasonChange,
  onConfirm,
  isRejecting,
}: RejectClaimDialogProps) {
  // Hàm xử lý khi bấm Hủy: Đóng dialog và reset lý do (nếu cần thiết bên ngoài)
  const handleCancel = () => {
    onOpenChange(false);
    onReasonChange(""); // Xóa nội dung đã nhập khi hủy
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Từ chối yêu cầu bảo hành
          </DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do từ chối cho yêu cầu bảo hành #{claimId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Lý do từ chối <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Nhập lý do từ chối yêu cầu bảo hành..."
              rows={5}
              className="resize-none focus-visible:ring-destructive"
              disabled={isRejecting}
            />
            <p className="text-xs text-muted-foreground">
              Lý do này sẽ được gửi đến khách hàng và lưu vào hệ thống.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isRejecting}
            className="mr-2"
          >
            Hủy
          </Button>

          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isRejecting || !reason.trim()}
          >
            {isRejecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Xác nhận từ chối
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
