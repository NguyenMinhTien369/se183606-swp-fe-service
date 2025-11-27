import { partDistributionAPI } from "@/utility";
import type { PartDistributionResponseCenter } from "../../types/PartDistribution";
import { useEffect, useState } from "react";

export default function useGetDistributionsByServiceCenter(
  serviceCenterID: number
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [distributions, setDistributions] = useState<
    PartDistributionResponseCenter[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDistributions = async () => {
    if (!serviceCenterID) return;
    try {
      setLoading(true);
      setError(null);
      const response =
        await partDistributionAPI.getDistributionsByServiceCenter(
          serviceCenterID
        );
      const distributionsData = response.data.result || [];

      setDistributions(distributionsData);
      console.log("Loaded distributions:", distributionsData);
    } catch (err: any) {
      console.error("Error loading distributions:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributions();
  }, [serviceCenterID]);

  return { distributions, loading, error, fetchDistributions };
}
