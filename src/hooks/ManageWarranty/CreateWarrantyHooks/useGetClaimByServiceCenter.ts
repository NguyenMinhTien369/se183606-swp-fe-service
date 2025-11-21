import { useState, useCallback } from "react";
import { warrantyClaimAPI } from "@/utility/index";
import type { WarrantyClaimResponse } from "@/pages/SC_Staff/ManageWarranty/types/warranty";

export const useGetClaimByServiceCenter = (serviceCenterID: number) => {
  const [history, setHistory] = useState<WarrantyClaimResponse[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const getHistoryByVin = useCallback(
    async (vin: string) => {
      if (!vin) return;

      setIsLoadingHistory(true);
      try {
        const claimsResponse = await warrantyClaimAPI.getClaimsByServiceCenter(
          serviceCenterID
        );
        const allClaims = claimsResponse.data.result || [];
        const vehicleClaims = allClaims.filter(
          (c: WarrantyClaimResponse) => c.vin === vin
        );
        setHistory(vehicleClaims);
      } catch (error) {
        console.error("Error loading warranty history:", error);
        setHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [serviceCenterID]
  );

  const resetHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    setHistory,
    isLoadingHistory,
    getHistoryByVin,
    resetHistory,
  };
};
