import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale"; // Import tiếng Việt cho lịch
import { Calendar as CalendarIcon, Loader2, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SendToFactoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (dateStr: string) => void; // Trả về chuỗi ngày YYYY-MM-DD
  isLoading: boolean;
}

export default function SendToFactoryDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: SendToFactoryDialogProps) {
  const [date, setDate] = useState<Date>();

  // Reset date khi đóng dialog (tuỳ chọn)
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) setDate(undefined);
    onOpenChange(newOpen);
  };

  const handleConfirm = () => {
    if (date) {
      // Format ngày thành YYYY-MM-DD để gửi xuống Backend
      const formattedDate = format(date, "yyyy-MM-dd");
      onConfirm(formattedDate);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <Send className="h-5 w-5" />
            Gửi yêu cầu lên hãng sản xuất
          </DialogTitle>
          <DialogDescription>
            Hành động này áp dụng khi <b>không có phụ tùng trong kho</b>. <br />
            Vui lòng chọn <b>ngày hẹn dự kiến</b> có hàng để thông báo cho
            khách.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Ngày hẹn trả hàng dự kiến{" "}
              <span className="text-destructive">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? (
                    format(date, "dd/MM/yyyy", { locale: vi })
                  ) : (
                    <span>Chọn ngày...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()} // Không chọn ngày quá khứ
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Hủy bỏ
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
            onClick={handleConfirm}
            disabled={isLoading || !date}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Xác nhận gửi
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
