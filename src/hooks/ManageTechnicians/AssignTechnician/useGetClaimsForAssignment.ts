import { useState, useCallback } from "react";
import { warrantyClaimAPI } from "@/utility/index";
import type { WarrantyClaimResponse } from "@/pages/SC_Staff/ManageTechnicians/types";

export const useGetClaimsForAssignment = () => {
  const [claims, setClaims] = useState<WarrantyClaimResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await warrantyClaimAPI.getUnassignedClaims();

      const claimsData = response.data.result || [];
      setClaims(claimsData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Không thể tải danh sách yêu cầu cần phân công";
      setError(errorMessage);
      console.error("Error loading unassigned claims:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { claims, isLoading, error, fetchClaims };
};
