import { useState, useCallback } from "react";
import { vehicleAPI } from "@/utility";
import type { UnassignedVehicle } from "@/pages/SC_Staff/ManageCustomers/types";

export const useGetVehicleDetails = () => {
  const [vehicleDetails, setVehicleDetails] =
    useState<UnassignedVehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy chi tiết xe theo VIN
  const getVehicleDetails = useCallback(async (vin: string) => {
    if (!vin.trim()) {
      setError("VIN không hợp lệ");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await vehicleAPI.getUnassignedVehicles(vin);
      // API có thể trả result hoặc object trực tiếp
      const vehicle: UnassignedVehicle | null =
        response.data?.result || response.data || null;

      setVehicleDetails(vehicle);
      return vehicle;
    } catch (err: any) {
      console.error("Error fetching vehicle details:", err);
      setError(err?.message || "Không thể tải thông tin xe. Vui lòng thử lại!");
      setVehicleDetails(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Xóa thông tin xe
  const clearVehicleDetails = useCallback(() => {
    setVehicleDetails(null);
    setError(null);
  }, []);

  return {
    vehicleDetails,
    loading,
    error,
    getVehicleDetails,
    clearVehicleDetails,
  };
};
