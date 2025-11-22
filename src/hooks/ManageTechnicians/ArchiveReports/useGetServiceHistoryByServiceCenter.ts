import { useState, useEffect } from "react";
import { serviceHistoryAPI } from "@/utility";

export interface ServiceHistoryResponse {
  serviceID: number;
  vin: string;
  serviceCenterName?: string;
  claimID?: number;
  serviceDate: string;
  serviceType?: string;
  workItem?: string;
  replacementPartName?: string;
  replacementPartSerial?: string;
  technicianName?: string;
}

export function useGetServiceHistoryByServiceCenter(serviceCenterID?: number) {
  const [histories, setHistories] = useState<ServiceHistoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistories = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!serviceCenterID) {
        setHistories([]);
        return;
      }
      const response = await serviceHistoryAPI.getByServiceCenter(
        serviceCenterID
      );
      console.log("Service History loaded:", response.data);
      setHistories(response.data.result || response.data || []);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể tải lịch sử bảo hành";
      console.error("Error loading service history:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serviceCenterID) {
      loadHistories();
    }
  }, [serviceCenterID]);

  return {
    histories,
    loading,
    error,
    reload: loadHistories,
  };
}
