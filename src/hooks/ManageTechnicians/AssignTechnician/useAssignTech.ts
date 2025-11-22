import { useState } from "react";
import { claimAssignmentAPI } from "@/utility/index";

interface AssignPayload {
  claimIDs: number[];
  mainTechnicianID: number;
  expectedCompletionDate?: string;
  internalNotes?: string;
}

export const useAssignTech = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignTechnician = async ({
    claimIDs,
    mainTechnicianID,
    expectedCompletionDate,
    internalNotes,
  }: AssignPayload) => {
    setIsSubmitting(true);
    try {
      // Tạo mảng các promise để gọi API song song
      const assignPromises = claimIDs.map((claimID) =>
        claimAssignmentAPI.assignTechnician({
          claimID,
          technicianIDs: [mainTechnicianID],
          expectedCompletionDate: expectedCompletionDate || undefined,
          internalNotes: internalNotes || undefined,
        })
      );

      await Promise.all(assignPromises);

      return { success: true };
    } catch (error: any) {
      console.error("Error assigning technician:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Không thể phân công kỹ thuật viên.";

      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { assignTechnician, isSubmitting };
};
