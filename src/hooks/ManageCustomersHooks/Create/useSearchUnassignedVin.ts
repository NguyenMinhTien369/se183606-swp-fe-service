import { useState, useCallback } from "react";
import { vehicleAPI } from "@/utility"; // điều chỉnh đường dẫn nếu cần

export const useSearchUnassignedVin = () => {
  const [vinSuggestions, setVinSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchVin = useCallback(async (keyword: string) => {
    // Không tìm kiếm nếu keyword quá ngắn
    if (!keyword || keyword.trim().length < 3) {
      setVinSuggestions([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await vehicleAPI.searchUnassignedVehicles(keyword);
      const vehicles = response.data?.result || [];
      setVinSuggestions(vehicles);
    } catch (err: any) {
      console.error("Error searching VIN:", err);
      setError(err.message || "Không thể tìm kiếm VIN. Vui lòng thử lại!");
      setVinSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setVinSuggestions([]);
    setError(null);
  }, []);

  return { vinSuggestions, loading, error, searchVin, clearSuggestions };
};
