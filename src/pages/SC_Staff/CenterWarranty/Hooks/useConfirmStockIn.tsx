import { useState } from "react";
import { warrantyClaimAPI } from "@/utility/index";

interface UseConfirmStockInProps {
  onSuccess?: () => void; // Callback khi nhập kho thành công
}

// Kiểu dữ liệu trả về từ Hook
interface ConfirmStockInResult {
  handleConfirmStockIn: (claimId: number) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
}

export default function useConfirmStockIn({
  onSuccess,
}: UseConfirmStockInProps = {}): ConfirmStockInResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmStockIn = async (claimId: number) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Gọi API xác nhận nhập kho
      await warrantyClaimAPI.confirmStockIn(claimId);

      // Nếu thành công
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      // Xử lý thông báo lỗi từ backend (nếu có)
      const errorMessage =
        err?.response?.data?.message || "Đã xảy ra lỗi khi xác nhận nhập kho.";
      setError(errorMessage);

      console.error("Confirm Stock In Error:", err);
    } finally {
      // Luôn tắt loading dù thành công hay thất bại
      setIsProcessing(false);
    }
  };

  return {
    handleConfirmStockIn,
    isProcessing,
    error,
  };
}
