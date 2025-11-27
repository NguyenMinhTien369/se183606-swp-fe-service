import { useState } from "react";
import { warrantyClaimAPI } from "@/utility/index";

// Props đầu vào cho Hook
interface UseIssuePartsProps {
  onSuccess?: () => void; // Callback khi thành công
}

// Kiểu dữ liệu trả về từ Hook
interface IssuePartsResult {
  handleIssueParts: (claimId: number) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
}

export default function useIssueParts({
  onSuccess,
}: UseIssuePartsProps = {}): IssuePartsResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleIssueParts = async (claimId: number) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Gọi API bạn đã cung cấp
      await warrantyClaimAPI.issueParts(claimId);

      // Nếu thành công
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err?.response?.data?.message || "Đã xảy ra lỗi khi cấp phụ tùng.";
      setError(errorMessage);

      console.error("Issue Parts Error:", err);
    } finally {
      // Luôn chạy sau khi xong (dù thành công hay thất bại)
      setIsProcessing(false);
    }
  };

  return {
    handleIssueParts,
    isProcessing,
    error,
  };
}
