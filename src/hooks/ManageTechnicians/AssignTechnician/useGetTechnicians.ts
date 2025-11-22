import { useState, useCallback } from "react";
import { claimAssignmentAPI } from "@/utility/index";
import type { TechnicianUser } from "@/pages/SC_Staff/ManageTechnicians/types";

export const useGetTechnicians = () => {
  const [technicians, setTechnicians] = useState<TechnicianUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTechnicians = useCallback(async () => {
    try {
      // Nếu muốn loading state cho technicians riêng
      setIsLoading(true);
      const response = await claimAssignmentAPI.getTechnicians();
      setTechnicians(response.data.result || []);
    } catch (error) {
      console.error("Error loading technicians:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { technicians, isLoading, fetchTechnicians };
};
