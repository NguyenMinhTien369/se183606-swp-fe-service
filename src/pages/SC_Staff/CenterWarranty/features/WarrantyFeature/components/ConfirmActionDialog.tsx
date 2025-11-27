import {
  AlertTriangle,
  HelpCircle,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Hàm merge class của shadcn/ui

// Định nghĩa các loại màu sắc/trạng thái
type DialogVariant = "default" | "destructive" | "info" | "warning";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;

  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant; // 'info' cho cấp hàng, 'warning' cho gửi hãng
}

export default function ConfirmActionDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "default",
}: ConfirmActionDialogProps) {
  // Cấu hình style và icon dựa trên variant
  const getVariantConfig = () => {
    switch (variant) {
      case "destructive":
        return {
          icon: AlertTriangle,
          iconColor: "text-red-600",
          buttonClass: "bg-red-600 hover:bg-red-700 text-white",
        };
      case "info": // Dùng cho Cấp phụ tùng (Xanh)
        return {
          icon: CheckCircle2,
          iconColor: "text-blue-600",
          buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
        };
      case "warning": // Dùng cho Gửi hãng (Cam)
        return {
          icon: HelpCircle,
          iconColor: "text-orange-600",
          buttonClass: "bg-orange-600 hover:bg-orange-700 text-white",
        };
      default:
        return {
          icon: Info,
          iconColor: "text-slate-900",
          buttonClass: "", // Mặc định của Button
        };
    }
  };

  const config = getVariantConfig();
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle
            className={cn("flex items-center gap-2", config.iconColor)}
          >
            <Icon className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="pt-2 text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="mr-2"
          >
            {cancelText}
          </Button>

          <Button
            className={cn("gap-2", config.buttonClass)}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
