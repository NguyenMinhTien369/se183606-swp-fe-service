import { useState } from "react";
import { warrantyClaimAPI } from "@/utility/index";
import type { ScApprovalRequest } from "@/pages/SC_Staff/CenterWarranty/types/CenterWarranty";

interface UseWarrantyActionProps {
  onSuccess?: () => void; // Callback khi thành công - dùng để reload dữ liệu
}

interface WarrantyActionResult {
  isProcessing: boolean; // State loading cho các nút button
  issueParts: (
    claimId: number,
    appointmentDate?: string,
    note?: string
  ) => Promise<void>; // Hàm cấp phụ tùng
  sendToFactory: (claimId: number, note?: string) => Promise<void>; // Hàm gửi hãng
}

export function useWarrantyAction({
  onSuccess,
}: UseWarrantyActionProps): WarrantyActionResult {
  const [isProcessing, setIsProcessing] = useState(false);

  const processClaimAction = async (
    claimId: number,
    requestData: ScApprovalRequest
  ) => {
    try {
      setIsProcessing(true);

      const response = await warrantyClaimAPI.processClaimByScStaff(
        claimId,
        requestData
      );

      console.log("✅ Xử lý thành công:", response.data);

      // Gọi callback để reload dữ liệu
      if (onSuccess) {
        onSuccess();
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Lỗi xử lý yêu cầu:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể xử lý yêu cầu";
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // ===== BƯỚC 4: HÀM CẤP PHỤ TÙNG (PUBLIC) =====
  /**
   * Cấp phụ tùng từ kho của Service Center
   * @param claimId - ID của warranty claim
   * @param appointmentDate - Ngày hẹn (nếu hết hàng), format: YYYY-MM-DD
   * @param note - Ghi chú thêm
   */
  const issueParts = async (
    claimId: number,
    appointmentDate?: string,
    note?: string
  ) => {
    // Dữ liệu gửi lên API
    const requestData: ScApprovalRequest = {
      hasStock: true, // Có hàng trong kho
      appointmentDate: appointmentDate, // Ngày hẹn (optional)
      note: note || "Cấp phụ tùng từ kho trung tâm",
    };

    await processClaimAction(claimId, requestData);
  };

  // ===== BƯỚC 5: HÀM GỬI HÃNG (PUBLIC) =====
  /**
   * Gửi yêu cầu lên hãng (khi không có hàng trong kho)
   * @param claimId - ID của warranty claim
   * @param note - Ghi chú thêm
   */
  const sendToFactory = async (claimId: number, note?: string) => {
    // Dữ liệu gửi lên API
    const requestData: ScApprovalRequest = {
      hasStock: false, // KHÔNG có hàng trong kho
      note: note || "Chuyển lên hãng do thiếu phụ tùng tại trung tâm",
    };

    await processClaimAction(claimId, requestData);
  };

  // ===== BƯỚC 6: TRẢ VỀ CÁC HÀM VÀ STATE =====
  return {
    isProcessing,
    issueParts,
    sendToFactory,
  };
}
