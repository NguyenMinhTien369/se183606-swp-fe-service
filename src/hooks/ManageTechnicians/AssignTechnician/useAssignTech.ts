// import { useState } from "react";
// import { claimAssignmentAPI } from "@/utility/index";

// interface AssignPayload {
//   claimIDs: number[];
//   mainTechnicianID: number;
//   expectedCompletionDate?: string;
//   internalNotes?: string;
// }

// export const useAssignTech = () => {
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const assignTechnician = async ({
//     claimIDs,
//     mainTechnicianID,
//     expectedCompletionDate,
//     internalNotes,
//   }: AssignPayload) => {
//     setIsSubmitting(true);
//     try {
//       // Tạo mảng các promise để gọi API song song
//       const assignPromises = claimIDs.map((claimID) =>
//         claimAssignmentAPI.assignTechnician({
//           claimID,
//           technicianIDs: [mainTechnicianID],
//           expectedCompletionDate: expectedCompletionDate || undefined,
//           internalNotes: internalNotes || undefined,
//         })
//       );

//       await Promise.all(assignPromises);

//       return { success: true };
//     } catch (error: any) {
//       console.error("Error assigning technician:", error);
//       const errorMessage =
//         error.response?.data?.message ||
//         error.response?.data?.error ||
//         "Không thể phân công kỹ thuật viên.";

//       return { success: false, error: errorMessage };
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return { assignTechnician, isSubmitting };
// };
import { useState } from "react";
import { claimAssignmentAPI } from "@/utility/index"; // Đảm bảo đường dẫn đúng
// Import type từ file định nghĩa của bạn
import type { AssignTechnicianRequest } from "@/pages/SC_Staff/ManageTechnicians/types";

interface UseAssignTechPayload {
  claimIDs: number[]; // UI gửi xuống một mảng
  technicianIDs: number[];
  expectedCompletionDate?: string;
  internalNotes?: string;
}

export const useAssignTech = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignTechnician = async (params: UseAssignTechPayload) => {
    setIsSubmitting(true);
    try {
      // Vì Backend chỉ nhận từng claimID một (theo type AssignTechnicianRequest)
      // Ta dùng Promise.all để gửi đồng thời nhiều request
      const promises = params.claimIDs.map((singleClaimID) => {
        // Tạo payload đúng chuẩn Backend yêu cầu
        const requestBody: AssignTechnicianRequest = {
          claimID: singleClaimID,
          technicianIDs: params.technicianIDs, // Backend đã nhận mảng tech
          expectedCompletionDate: params.expectedCompletionDate,
          internalNotes: params.internalNotes,
        };

        return claimAssignmentAPI.assignTechnician(requestBody);
      });

      // Chờ tất cả request hoàn thành
      await Promise.all(promises);

      return { success: true };
    } catch (error: any) {
      console.error("Assign error:", error);
      return {
        success: false,
        error: error?.response?.data?.message || "Có lỗi xảy ra khi phân công.",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { assignTechnician, isSubmitting };
};
