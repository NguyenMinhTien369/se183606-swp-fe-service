import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { Car } from "lucide-react";
import VehicleSearch from "./VehicleSearch";
import VehicleDetail from "./VehicleDetail";
import CreateWarrantyForm from "./CreateWarrantyForm";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { VehicleInfo, WarrantyClaimResponse } from "../types/warranty";
import { useAuth } from "@/pages/Login/feature/AuthContext";
import { useVehicleInfoByVin } from "@/hooks/ManageWarranty/CreateWarrantyHooks/useVehicleInfoByVin";
import { useGetClaimByServiceCenter } from "@/hooks/ManageWarranty/CreateWarrantyHooks/useGetClaimByServiceCenter";

export default function Warranty() {
  const { user } = useAuth();
  const location = useLocation();

  const SERVICE_CENTER_ID = user?.serviceCenterID;

  const {
    vehicleInfo: currentVehicleInfo,
    setVehicleInfo: setCurrentVehicleInfo,
    getVehicleInfo,
  } = useVehicleInfoByVin();

  const {
    history: warrantyHistory,
    setHistory: setWarrantyHistory,
    getHistoryByVin,
  } = useGetClaimByServiceCenter(SERVICE_CENTER_ID);

  // UI State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingClaim, setEditingClaim] =
    useState<WarrantyClaimResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { editingClaim?: WarrantyClaimResponse };

    if (state?.editingClaim) {
      const claim = state.editingClaim;
      setEditingClaim(claim);
      setShowCreateForm(true);

      const initData = async () => {
        await getVehicleInfo(claim.vin); // Load thông tin xe
        await getHistoryByVin(claim.vin); // Load lịch sử
      };

      initData();
    }
  }, [location.state, getVehicleInfo, getHistoryByVin]);

  const handleSearch = async (
    vehicleInfo: VehicleInfo | null,
    error?: string
  ) => {
    if (error) {
      setCurrentVehicleInfo(null);
      setWarrantyHistory([]);
      setShowCreateForm(false);
      setSearchError(error);
      return;
    }

    if (vehicleInfo) {
      setSearchError(null);
      setCurrentVehicleInfo(vehicleInfo);
      setShowCreateForm(false);

      await getHistoryByVin(vehicleInfo.vin);
    }
  };

  const handleCreateWarranty = () => {
    setEditingClaim(null);
    setShowCreateForm(true);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setEditingClaim(null);
  };

  const handleCreateSuccess = async () => {
    setShowCreateForm(false);
    setEditingClaim(null);

    if (currentVehicleInfo) {
      await getHistoryByVin(currentVehicleInfo.vin);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Search Section */}
        <VehicleSearch onSearch={handleSearch} />

        {searchError && !currentVehicleInfo && !showCreateForm && (
          <Alert
            variant="destructive"
            className="border-red-200 text-red-700 bg-red-50 !grid-cols-1"
          >
            <div className="flex items-center justify-between gap-4 col-span-full">
              <div className="flex items-center gap-2 flex-1">
                <Car className="h-5 w-5 flex-shrink-0" />
                <span className="font-semibold flex-1">
                  Không tìm thấy xe với VIN này
                </span>
              </div>
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
            serviceCenterID={SERVICE_CENTER_ID ?? 0}
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
