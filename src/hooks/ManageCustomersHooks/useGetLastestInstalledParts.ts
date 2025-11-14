import { useEffect, useState } from "react";
import type { InstalledPart } from "@/pages/SC_Staff/ManageCustomers/types";
import { installedPartAPI } from "@/utility";

export function useGetLastestInstalledParts(vin?: string) {
  const [parts, setParts] = useState<InstalledPart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const loadInstalledParts = async () => {
    if (!vin) {
      setParts([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log(
        "🔍 [useGetLastestInstalledParts] Fetching parts for VIN:",
        vin
      );
      const response = await installedPartAPI.getLatestInstalledParts(vin);
      const partsData = response.data.result || [];

      console.log("Parts data:", partsData);
      setParts(partsData);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Không thể tải danh sách phụ tùng"
      );
      console.error("Error loading parts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstalledParts();
  }, [vin]);

  return {
    parts,
    loading,
    error,
    reload: loadInstalledParts,
  };
}
