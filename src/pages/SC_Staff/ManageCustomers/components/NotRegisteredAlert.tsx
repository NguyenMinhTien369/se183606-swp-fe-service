import { useNavigate } from "react-router";
import { UserPlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ROUTERS_PATH from "@/constants/routers";

interface NotRegisteredAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchKeyword?: string;
}

export default function NotRegisteredAlert({
  open,
  onOpenChange,
  searchKeyword,
}: NotRegisteredAlertProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleRegister = () => {
    onOpenChange(false);
    // Navigate đến trang đăng ký khách hàng với absolute path
    navigate(ROUTERS_PATH.REGISTER_CUSTOMER, {
      state: {
        searchKeyword,
        fromSearch: true,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Không tìm thấy khách hàng
          </DialogTitle>
          <DialogDescription className="text-base">
            Không tìm thấy khách hàng với từ khóa{" "}
            <strong>"{searchKeyword}"</strong>. Bạn có muốn đăng ký khách hàng
            mới không?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} className="gap-2">
            <X className="h-4 w-4" />
            Hủy
          </Button>
          <Button onClick={handleRegister} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Đăng Ký Khách Hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
