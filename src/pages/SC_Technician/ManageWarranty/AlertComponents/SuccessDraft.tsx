import { useNavigate } from "react-router";
import { FileText } from "lucide-react";
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

interface SuccessDraftProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimID?: number;
}

export default function SuccessDraft({
  open,
  onOpenChange,
  claimID,
}: SuccessDraftProps) {
  const navigate = useNavigate();

  const handleGoToList = () => {
    onOpenChange(false);
    navigate(ROUTERS_PATH.WARRANTY_LIST);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-6 w-6 text-blue-500" />
            <DialogTitle className="text-lg">
              Lưu bản nháp thành công
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Bản nháp {claimID ? <strong>#{claimID} </strong> : ""}
            đã được lưu lại. Bạn có muốn tiếp tục chỉnh sửa không?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            onClick={handleGoToList}
            className="gap-2 bg-blue-500 hover:bg-blue-600"
          >
            Về danh sách
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
