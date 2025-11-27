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
  ) => Promise<void>;
  sendToFactory: (
    claimId: number,
    appointmentDate: string,
    note?: string
  ) => Promise<void>;
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

      console.log("Xử lý thành công:", response.data);

      // Gọi callback để reload dữ liệu
      if (onSuccess) {
        onSuccess();
      }

      return response.data;
    } catch (error: any) {
      console.error("Lỗi xử lý yêu cầu:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể xử lý yêu cầu";
      console.log(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const issueParts = async (
    claimId: number,
    appointmentDate?: string,
    note?: string
  ) => {
    const requestData: ScApprovalRequest = {
      hasStock: true, // Có hàng trong kho
      appointmentDate: appointmentDate, // Ngày hẹn (optional)
      note: note || "Cấp phụ tùng từ kho trung tâm",
    };

    await processClaimAction(claimId, requestData);
  };

  const sendToFactory = async (claimId: number, appointmentDate: string) => {
    const requestData: ScApprovalRequest = {
      hasStock: false, // KHÔNG có hàng trong kho
      appointmentDate: appointmentDate, // Ngày hẹn
      note: "Gửi yêu cầu bảo hành đến hãng do không có phụ tùng trong kho",
    };

    await processClaimAction(claimId, requestData);
  };

  return {
    isProcessing,
    issueParts,
    sendToFactory,
  };
}
