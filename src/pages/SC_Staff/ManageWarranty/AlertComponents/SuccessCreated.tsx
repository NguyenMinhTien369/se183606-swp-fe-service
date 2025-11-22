import { useNavigate } from "react-router";
import { CheckCircle, List } from "lucide-react";
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

interface SuccessCreatedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimID?: number;
}

export default function SuccessCreated({
  open,
  onOpenChange,
  claimID,
}: SuccessCreatedProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleGoToList = () => {
    onOpenChange(false);
    navigate(ROUTERS_PATH.WARRANTY_LIST);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <DialogTitle className="text-lg">
              Gửi yêu cầu thành công
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Yêu cầu bảo hành {claimID ? <strong>#{claimID} </strong> : ""}
            đã được gửi lên hệ thống và đang ở trạng thái{" "}
            <strong>Chờ duyệt</strong>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} className="gap-2">
            Đóng
          </Button>
          <Button
            onClick={handleGoToList}
            className="gap-2 ml-2.5 bg-green-600 hover:bg-green-700"
          >
            <List className="h-4 w-4" />
            Về danh sách
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
