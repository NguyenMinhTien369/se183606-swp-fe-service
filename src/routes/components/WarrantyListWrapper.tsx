// Wrapper component to inject serviceCenterID from auth context
import { useAuth } from "@/pages/Login/feature/AuthContext";
import { useNavigate } from "react-router";
import WarrantyList from "@/pages/SC_Technician/ManageWarranty/features/WarrantyList";
import type { WarrantyClaimResponse } from "@/pages/SC_Technician/ManageWarranty/types/warranty";

export default function WarrantyListWithAuth() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ Get serviceCenterID from authenticated user
  const serviceCenterID = user?.serviceCenterID || 1;

  // ✅ Handle edit: Navigate to create-warranty page with claim data
  const handleEdit = (claim: WarrantyClaimResponse) => {
    console.log("Editing claim:", claim);
    // Navigate to create-warranty route with state
    navigate("/sc-staff/manage-warranty/create-warranty", {
      state: { editingClaim: claim },
    });
  };

  return <WarrantyList serviceCenterID={serviceCenterID} onEdit={handleEdit} />;
}
