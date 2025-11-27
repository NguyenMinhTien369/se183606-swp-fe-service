import { useState } from "react";
import { claimAssignmentAPI } from "@/utility/index";
import type { ReassignTechnicianRequest } from "@/pages/SC_Staff/ManageTechnicians/types/warranty";

export default function useReassignTechnician() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reassignTechnician = async (data: ReassignTechnicianRequest) => {
    setIsSubmitting(true);
    try {
      const response = await claimAssignmentAPI.reassignTechnician(data);

      return {
        success: true,
        data: response?.data,
      };
    } catch (error: any) {
      console.error("Reassign error:", error);
      return {
        success: false,
        error:
          error?.response?.data?.message ||
          "Không thể tái phân công kỹ thuật viên.",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { reassignTechnician, isSubmitting };
}
