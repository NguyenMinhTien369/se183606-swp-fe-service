import { UserPlus, CheckCircle } from "lucide-react"; // Gom import cho gọn
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
import { NavLink } from "react-router"; // Sửa thành react-router-dom

interface SuccessAlertProps {
  open: boolean;
  onConfirm: () => void;
}

export default function SuccessAlert({ open, onConfirm }: SuccessAlertProps) {
  return (
    <Dialog open={open} onOpenChange={onConfirm}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg text-green-600">
            Thành công
          </DialogTitle>
          <DialogDescription className="text-base flex items-center gap-3 mt-2">
            <CheckCircle size={32} className="text-green-500" />
            <span>Khách hàng đã được đăng ký thành công.</span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            onClick={onConfirm}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <UserPlus className="h-4 w-4" />
            Làm mới
          </Button>

          <Button
            asChild // Quan trọng: Biến button thành link
            className="gap-2 bg-blue-600 hover:bg-blue-700 ml-2"
          >
            <NavLink to={ROUTERS_PATH.MANAGE_CUSTOMER}>Quay về</NavLink>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
