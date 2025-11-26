import { useState } from "react";
import { warrantyClaimAPI } from "@/utility/index";
import type { ScRejectRequest } from "@/pages/SC_Staff/CenterWarranty/types/CenterWarranty";

interface UseRejectClaimProps {
  onSuccess?: () => void; // Callback khi từ chối thành công
}

interface RejectClaimResult {
  isRejecting: boolean; // State loading cho nút từ chối
  rejectClaim: (claimId: number, reason: string) => Promise<void>; // Hàm từ chối
}

export function useRejectClaim({
  onSuccess,
}: UseRejectClaimProps): RejectClaimResult {
  const [isRejecting, setIsRejecting] = useState(false);

  const rejectClaim = async (claimId: number, reason: string) => {
    // Validate lý do từ chối
    if (!reason || reason.trim() === "") {
      throw new Error("Vui lòng nhập lý do từ chối");
    }

    try {
      setIsRejecting(true);

      // Chuẩn bị dữ liệu theo kiểu ScRejectRequest
      const requestData: ScRejectRequest = {
        reason: reason.trim(),
      };

      // Gọi API từ chối
      const response = await warrantyClaimAPI.rejectClaimByScStaff(
        claimId,
        requestData
      );

      console.log("✅ Từ chối thành công:", response.data);

      // Gọi callback để reload dữ liệu
      if (onSuccess) {
        onSuccess();
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Lỗi từ chối yêu cầu:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể từ chối yêu cầu";
      throw new Error(errorMessage);
    } finally {
      setIsRejecting(false);
    }
  };

  return {
    isRejecting,
    rejectClaim,
  };
}
