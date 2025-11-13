import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { Car } from "lucide-react";
import VehicleSearch from "./VehicleSearch";
import VehicleDetail from "./VehicleDetail";
import CreateWarrantyForm from "./CreateWarrantyForm";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { VehicleInfo, WarrantyClaimResponse } from "../types/warranty";
import { warrantyClaimAPI } from "@/utility/index";
import { useAuth } from "@/pages/Login/feature/AuthContext";

export default function Warranty() {
  const { user } = useAuth();
  const location = useLocation();
  const [currentVehicleInfo, setCurrentVehicleInfo] =
    useState<VehicleInfo | null>(null);
  const [warrantyHistory, setWarrantyHistory] = useState<
    WarrantyClaimResponse[]
  >([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingClaim, setEditingClaim] =
    useState<WarrantyClaimResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // ✅ Check if we're in edit mode from navigation state
  useEffect(() => {
    const state = location.state as { editingClaim?: WarrantyClaimResponse };
    if (state?.editingClaim) {
      const claim = state.editingClaim;
      setEditingClaim(claim);

      // Load vehicle info for the VIN
      const loadVehicleInfo = async () => {
        try {
          const response = await warrantyClaimAPI.getVehicleInfoByVin(
            claim.vin
          );
          const vehicleData = response.data.result;
          setCurrentVehicleInfo(vehicleData);
          setShowCreateForm(true);

          // Load warranty history
          const claimsResponse =
            await warrantyClaimAPI.getClaimsByServiceCenter(
              user?.serviceCenterID || 1
            );
          const allClaims = claimsResponse.data.result || [];
          const vehicleClaims = allClaims.filter(
            (c: WarrantyClaimResponse) => c.vin === claim.vin
          );
          setWarrantyHistory(vehicleClaims);
        } catch (error) {
          console.error("Error loading vehicle info:", error);
        }
      };

      loadVehicleInfo();
    }
  }, [location.state, user?.serviceCenterID]);

  // ✅ Get serviceCenterID from authenticated user
  const SERVICE_CENTER_ID = user?.serviceCenterID || 1;

  const handleSearch = async (
    vehicleInfo: VehicleInfo | null,
    error?: string
  ) => {
    if (error) {
      setCurrentVehicleInfo(null);
      setWarrantyHistory([]);
      setShowCreateForm(false);
      setSearchError(error); // ✅ Lưu error để hiển thị
      return;
    }

    if (vehicleInfo) {
      setSearchError(null); // ✅ Clear error khi tìm thấy xe
      setCurrentVehicleInfo(vehicleInfo);
      setShowCreateForm(false);

      // Load warranty history for this VIN
      try {
        const claimsResponse = await warrantyClaimAPI.getClaimsByServiceCenter(
          SERVICE_CENTER_ID
        );
        const allClaims = claimsResponse.data.result || [];
        const vehicleClaims = allClaims.filter(
          (claim: WarrantyClaimResponse) => claim.vin === vehicleInfo.vin
        );
        setWarrantyHistory(vehicleClaims);
      } catch (error) {
        console.error("Error loading warranty history:", error);
        setWarrantyHistory([]);
      }
    }
  };

  const handleCreateWarranty = () => {
    setEditingClaim(null); // Reset edit mode
    setShowCreateForm(true);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setEditingClaim(null);
  };

  const handleCreateSuccess = async (claimID: number, isDraft: boolean) => {
    setShowCreateForm(false);
    setEditingClaim(null);

    // Reload warranty history
    if (currentVehicleInfo) {
      try {
        const claimsResponse = await warrantyClaimAPI.getClaimsByServiceCenter(
          SERVICE_CENTER_ID
        );
        const allClaims = claimsResponse.data.result || [];
        const vehicleClaims = allClaims.filter(
          (claim: WarrantyClaimResponse) => claim.vin === currentVehicleInfo.vin
        );
        setWarrantyHistory(vehicleClaims);
      } catch (error) {
        console.error("Error reloading warranty history:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Search Section */}
        <VehicleSearch onSearch={handleSearch} />

        {searchError && !currentVehicleInfo && !showCreateForm && (
          <Alert
            variant="destructive"
            className="border-red-200 text-red-700 bg-red-50 !grid-cols-1"
          >
            <div className="flex items-center justify-between gap-4 col-span-full">
              {/* Icon + Nội dung - không wrap */}
              <div className="flex items-center gap-2 flex-1">
                <Car className="h-5 w-5 flex-shrink-0" />
                <span className="font-semibold flex-1">
                  Không tìm thấy xe với VIN này
                </span>
              </div>

              {/* Nút đóng - luôn ở bên phải */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchError(null)}
                className="text-red-600 hover:bg-red-100 flex-shrink-0 whitespace-nowrap"
              >
                Đóng
              </Button>
            </div>
          </Alert>
        )}

        {/* Vehicle Details */}
        {currentVehicleInfo && (
          <VehicleDetail
            vehicleInfo={currentVehicleInfo}
            warrantyHistory={warrantyHistory}
            onCreateWarranty={handleCreateWarranty}
          />
        )}

        {/* Create Warranty Form Dialog */}
        {currentVehicleInfo && (
          <CreateWarrantyForm
            open={showCreateForm}
            vin={currentVehicleInfo.vin}
            installedParts={currentVehicleInfo.installedParts}
            serviceCenterID={SERVICE_CENTER_ID}
            onSuccess={handleCreateSuccess}
            onCancel={handleCancelCreate}
            editMode={!!editingClaim}
            claimID={editingClaim?.claimID}
            initialDescription={editingClaim?.description}
            initialSelectedParts={editingClaim?.affectedParts?.map((part) => ({
              partSerialNumber: part.partSerialNumber,
              description: part.description || "",
            }))}
          />
        )}

        {/* Empty State */}
        {!currentVehicleInfo && !showCreateForm && !searchError && (
          <div className="text-center py-12 text-muted-foreground">
            <Car className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Nhập VIN để bắt đầu tra cứu thông tin xe</p>
          </div>
        )}
      </main>
    </div>
  );
}
