import { useState, useEffect, useCallback } from "react";
import { warrantyClaimAPI } from "@/utility/index";
import type { WarrantyClaimResponse } from "@/pages/SC_Technician/ManageWarranty/types/warranty";

export function useGetClaimsByServiceCenter(
  serviceCenterID: number | undefined
) {
  const [claims, setClaims] = useState<WarrantyClaimResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    if (!serviceCenterID) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("Service Center ID:", serviceCenterID);
      const response = await warrantyClaimAPI.getClaimsByServiceCenter(
        serviceCenterID
      );
      const data = response.data.result || [];

      const sortedData = data.sort(
        (a: WarrantyClaimResponse, b: WarrantyClaimResponse) =>
          new Date(b.creationDate).getTime() -
          new Date(a.creationDate).getTime()
      );

      setClaims(sortedData);
    } catch (err: any) {
      console.error("Error fetching claims:", err);
      setError(err.message || "Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, [serviceCenterID]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  return {
    claims,
    isLoading,
    error,
    refresh: fetchClaims,
  };
}
