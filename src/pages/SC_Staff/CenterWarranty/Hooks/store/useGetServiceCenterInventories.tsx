import { inventoryAPI } from "@/utility";
import type { PartInventoryResponseCenter } from "../../types/PartDistribution";
import { useState } from "react";

export default function useGetServiceCenterInventories(
  serviceCenterID: number
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [inventory, setInventory] = useState<PartInventoryResponseCenter[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    if (!serviceCenterID) return;
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryAPI.getServiceCenterInventories(
        serviceCenterID
      );
      const inventoryData = response.data || [];
      setInventory(inventoryData);
      console.log("Loaded inventory:", inventoryData);
    } catch (err: any) {
      console.error("Error loading inventory:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { inventory, loading, error, fetchInventory };
}
