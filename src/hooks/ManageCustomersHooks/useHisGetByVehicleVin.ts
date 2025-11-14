import { useEffect, useState } from "react";
import { serviceHistoryAPI } from "@/utility";
import type { ServiceHistoryItem } from "@/pages/SC_Staff/ManageCustomers/types";

export function useHisGetByVehicleVin(vin?: string) {
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryItem[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const loadServiceHistory = async () => {
    if (!vin) {
      setServiceHistory([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await serviceHistoryAPI.getByVehicleVin(vin);
      const historyData = response.data.result || [];

      console.log("Service history data:", historyData);
      setServiceHistory(historyData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải lịch sử dịch vụ");
      console.error("Error loading service history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServiceHistory();
  }, [vin]);

  return {
    serviceHistory,
    loading,
    error,
    reload: loadServiceHistory,
  };
}
