import { useEffect, useState } from "react";
import { warrantyClaimAPI } from "@/utility";
import type { WarrantyClaimResponse } from "@/pages/SC_Staff/ManageTechnicians/types";

export function useGetClaimsByServiceCenter(serviceCenterID?: number) {
  const [claims, setClaims] = useState<WarrantyClaimResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const loadClaims = async () => {
    if (!serviceCenterID) {
      setClaims([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await warrantyClaimAPI.getClaimsByServiceCenter(
        serviceCenterID
      );
      const claimsData = response.data.result || [];

      const sortedClaims = claimsData.sort(
        (a: WarrantyClaimResponse, b: WarrantyClaimResponse) => {
          const dateA = new Date(a.creationDate).getTime();
          const dateB = new Date(b.creationDate).getTime();
          return dateB - dateA;
        }
      );

      console.log("Claims data (sorted):", sortedClaims);
      setClaims(sortedClaims);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách yêu cầu bảo hành"
      );
      console.error("Error loading claims:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [serviceCenterID]);

  return {
    claims,
    loading,
    error,
    reload: loadClaims,
  };
}
