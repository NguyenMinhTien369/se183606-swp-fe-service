// hooks/useWarrantyClaims.ts
import { useState, useEffect, useCallback } from "react";
import { warrantyClaimAPI } from "@/utility/index";
import type { WarrantyClaimResponse } from "@/pages/SC_Staff/CenterWarranty/types/CenterWarranty";

export function useWarrantyClaims(serviceCenterID: number) {
  const [claims, setClaims] = useState<WarrantyClaimResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchClaims = useCallback(async () => {
    if (!serviceCenterID) return;

    try {
      setLoading(true);
      setError(null);

      const response = await warrantyClaimAPI.getNonDraftClaims(
        serviceCenterID
      );
      const claimsData = response.data.result || [];

      const sortedClaims = claimsData.sort(
        (a: WarrantyClaimResponse, b: WarrantyClaimResponse) =>
          b.claimID - a.claimID
      );

      setClaims(sortedClaims);
      console.log("Loaded warranty claims:", sortedClaims);
    } catch (err) {
      console.error("Error loading claims:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [serviceCenterID]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  return { claims, loading, error, refresh: fetchClaims };
}
