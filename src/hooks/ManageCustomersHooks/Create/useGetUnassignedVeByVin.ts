import { useEffect, useState } from "react";
import { vehicleAPI } from "@/utility";
import type { VehicleResponse } from "@/pages/SC_Staff/ManageCustomers/types";

export function useGetUnassignedVeByVin(vin: string) {
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchUnassignedVehicle = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await vehicleAPI.getUnassignedVehicles(vin);
      const vehicleData: VehicleResponse = response.data.result;
      setVehicle(vehicleData);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Không thể tải thông tin xe chưa gán"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnassignedVehicle();
  }, [vin]);

  return { vehicle, loading, error, fetchUnassignedVehicle };
}
//CHƯA XONG
