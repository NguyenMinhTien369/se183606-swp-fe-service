import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface SubmitConfirmationDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  hasVin: boolean;
  hasPartSelected: boolean;
  hasReportAndImages: boolean;
}

export function SubmitConfirmationDialog({
  open,
  onConfirm,
  onCancel,
  hasVin,
  hasPartSelected,
  hasReportAndImages,
}: SubmitConfirmationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const allValid = hasVin && hasPartSelected && hasReportAndImages;

  // Simulate sending process
  useEffect(() => {
    if (isSubmitting) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsSuccess(true);
            setTimeout(() => onConfirm(), 1200);
            return 100;
          }
          return prev + 10;
        });
      }, 180);
      return () => clearInterval(interval);
    }
  }, [isSubmitting, onConfirm]);

  const handleConfirm = () => {
    if (allValid) setIsSubmitting(true);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setProgress(0);
      setIsSuccess(false);
      setIsSubmitting(false);
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isSuccess ? "🎉 Gửi thành công!" : "Xác nhận gửi yêu cầu"}
          </DialogTitle>
          <DialogDescription>
            {isSuccess
              ? "Yêu cầu bảo hành đã được gửi lên hãng thành công."
              : "Bạn có chắc chắn muốn gửi yêu cầu này lên hãng không?"}
          </DialogDescription>
        </DialogHeader>

        {/* Trạng thái kiểm tra hợp lệ */}
        {!isSubmitting && !isSuccess && (
          <div className="space-y-3 py-4">
            {[
              { label: "VIN hợp lệ", ok: hasVin },
              { label: "Đã chọn phụ tùng", ok: hasPartSelected },
              { label: "Có báo cáo & hình ảnh", ok: hasReportAndImages },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                {item.ok ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span>{item.label}</span>
              </div>
            ))}

            {!allValid && (
              <div className="flex items-start gap-2 bg-destructive/10 p-3 rounded-md mt-4">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  Vui lòng hoàn thiện các yêu cầu trên trước khi gửi.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Trạng thái đang gửi */}
        {isSubmitting && !isSuccess && (
          <div className="space-y-4 py-6">
            <Progress value={progress} />
            <p className="text-center text-sm text-muted-foreground">
              {progress < 100
                ? `${progress}% - Đang gửi dữ liệu...`
                : "Hoàn tất!"}
            </p>
          </div>
        )}

        {/* Trạng thái gửi thành công */}
        {isSuccess && (
          <div className="flex flex-col items-center py-6">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <p className="text-center text-base font-medium">
              Đã gửi yêu cầu thành công!
            </p>
          </div>
        )}

        {/* Footer */}
        {!isSubmitting && !isSuccess && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button onClick={handleConfirm} disabled={!allValid}>
              Xác nhận gửi
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
