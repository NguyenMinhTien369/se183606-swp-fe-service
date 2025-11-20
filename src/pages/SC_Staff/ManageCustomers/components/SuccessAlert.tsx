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
import { CheckCircle } from "lucide-react";

interface NotRegisteredAlertProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function NotRegisteredAlert({
  open,
  setOpen,
}: NotRegisteredAlertProps) {
  const navigate = useNavigate();

  const handleRegister = () => {
    setOpen(false);
    // Navigate đến trang đăng ký khách hàng với absolute path
    navigate(ROUTERS_PATH.MANAGE_CUSTOMER);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Thành công</DialogTitle>
          <DialogDescription className="text-base">
            <CheckCircle size={24} />
            Khách hàng đã được đăng ký thành công khách hàng.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button onClick={handleRegister} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
