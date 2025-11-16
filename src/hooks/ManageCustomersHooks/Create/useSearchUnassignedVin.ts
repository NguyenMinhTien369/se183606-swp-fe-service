import { useState } from "react";
import { vehicleAPI } from "@/utility";
import type { VehicleResponse } from "@/pages/SC_Staff/ManageCustomers/types";

export function useSearchUnassignedVin() {
  //chưa đúng

  const [vin, setVin] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const searchUnassignedVin = async (searchVin: string) => {
    try {
      setLoading(true);
      setError("");
      const response = await vehicleAPI.searchUnassignedVehicles(searchVin);
      const vehicleData: VehicleResponse[] = response.data.result;
      return vehicleData;
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Không thể tìm kiếm VIN chưa gán"
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { vin, setVin, loading, error, searchUnassignedVin };
}

//CHƯA XONG
