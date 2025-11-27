import { useState, useCallback } from "react";
import { warrantyClaimAPI } from "@/utility/index";
import type { VehicleInfo } from "@/pages/SC_Staff/CenterWarranty/types/CenterWarranty";

export const useVehicleInfoByVin = () => {
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  const getVehicleInfo = useCallback(async (vin: string) => {
    setIsLoadingVehicle(true);
    setVehicleError(null);
    try {
      const response = await warrantyClaimAPI.getVehicleInfoByVin(vin);
      const data = response.data.result;
      setVehicleInfo(data);
      return data;
    } catch (error) {
      console.error("Error loading vehicle info:", error);
      setVehicleError("Không thể tải thông tin xe");
      setVehicleInfo(null);
      throw error;
    } finally {
      setIsLoadingVehicle(false);
    }
  }, []);

  const resetVehicleInfo = useCallback(() => {
    setVehicleInfo(null);
    setVehicleError(null);
  }, []);

  return {
    vehicleInfo,
    setVehicleInfo,
    isLoadingVehicle,
    vehicleError,
    getVehicleInfo,
    resetVehicleInfo,
  };
};
