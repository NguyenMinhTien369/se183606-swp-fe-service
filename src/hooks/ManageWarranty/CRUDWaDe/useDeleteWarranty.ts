import { useState } from "react";
import { warrantyClaimAPI } from "@/utility/index";

interface UseDeleteWarrantyProps {
  onSuccess?: () => void; // Callback chạy khi xóa thành công (ví dụ: chuyển trang)
  onError?: (error: any) => void;
}

export const useDeleteWarranty = ({
  onSuccess,
  onError,
}: UseDeleteWarrantyProps = {}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [claimIdToDelete, setClaimIdToDelete] = useState<number | null>(null);

  // 1. Hàm được gọi khi bấm nút "Xóa" trên UI (Chỉ mở dialog)
  const requestDelete = (id: number) => {
    setClaimIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  // 2. Hàm hủy bỏ xóa
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setClaimIdToDelete(null);
  };

  // 3. Hàm xác nhận xóa (Gọi API)
  const confirmDelete = async () => {
    if (!claimIdToDelete) return;

    try {
      setIsDeleting(true);
      // --- API CALL MÀ BẠN YÊU CẦU ---
      await warrantyClaimAPI.deleteClaim(claimIdToDelete);

      // Xử lý sau khi xóa thành công
      setDeleteDialogOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error deleting claim:", error);
      if (onError) onError(error);
    } finally {
      setIsDeleting(false);
      // Không setClaimIdToDelete(null) ngay để tránh lỗi UI dialog bị null data khi đang đóng
    }
  };

  return {
    isDeleting, // Trạng thái loading khi đang xóa
    deleteDialogOpen, // Trạng thái mở/đóng dialog
    setDeleteDialogOpen, // Hàm set state dialog (dùng cho onOpenChange)
    requestDelete, // Hàm kích hoạt từ nút Xóa
    cancelDelete, // Hàm kích hoạt từ nút Hủy
    confirmDelete, // Hàm kích hoạt từ nút Xác nhận
  };
};
