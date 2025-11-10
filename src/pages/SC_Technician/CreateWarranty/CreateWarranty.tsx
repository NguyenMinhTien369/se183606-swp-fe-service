"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Car, FileText, Bell } from "lucide-react";

import { VehicleSearch } from "./features/VehicleSearch";
import { VehicleDetails } from "./features/VehicleDetails";
import { CreateWarrantyForm } from "./features/CreateWarrantyForm";
import { WarrantyList } from "./features/WarrantyList";
import { WarrantyDetailsDialog } from "./features/WarrantyDetailsDialog";
import { ManufacturerResponsePanel } from "./features/ManufacturerResponsePanel";

import type { VehicleInfo, WarrantyClaimResponse } from "./types/warranty";
import { warrantyClaimAPI } from "@/utility/index";

export default function App() {
  const [activeTab, setActiveTab] = useState("search");
  const [currentVehicleInfo, setCurrentVehicleInfo] =
    useState<VehicleInfo | null>(null);
  const [warrantyHistory, setWarrantyHistory] = useState<
    WarrantyClaimResponse[]
  >([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaimResponse[]>(
    []
  );
  const [selectedClaim, setSelectedClaim] =
    useState<WarrantyClaimResponse | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [editingClaim, setEditingClaim] =
    useState<WarrantyClaimResponse | null>(null);

  // Hardcoded serviceCenterID - in production, get from auth context
  const SERVICE_CENTER_ID = 1;

  // Load all warranty claims on mount
  useEffect(() => {
    loadWarrantyClaims();
  }, []);

  const loadWarrantyClaims = async () => {
    try {
      const response = await warrantyClaimAPI.getClaimsByServiceCenter(
        SERVICE_CENTER_ID
      );
      setWarrantyClaims(response.data.result || []);
    } catch (error) {
      console.error("Error loading warranty claims:", error);
      alert("Không thể tải danh sách yêu cầu bảo hành");
    }
  };

  const handleSearch = async (
    vehicleInfo: VehicleInfo | null,
    error?: string
  ) => {
    if (error) {
      setCurrentVehicleInfo(null);
      setWarrantyHistory([]);
      setShowCreateForm(false);
      return;
    }

    if (vehicleInfo) {
      setCurrentVehicleInfo(vehicleInfo);
      setShowCreateForm(false);

      // Load warranty history for this VIN (filter from service center claims)
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

      alert(`Đã tìm thấy thông tin xe ${vehicleInfo.modelName}`);
    }
  };

  const handleCreateWarranty = () => {
    setEditingClaim(null); // Reset edit mode
    setShowCreateForm(true);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setEditingClaim(null); // Reset edit mode
  };

  const handleCreateSuccess = async (claimID: number, isDraft: boolean) => {
    setShowCreateForm(false);
    setEditingClaim(null); // Reset edit mode
    setActiveTab("tracking");

    // Reload warranty claims list
    await loadWarrantyClaims();

    const message = editingClaim
      ? `Đã cập nhật yêu cầu bảo hành thành công! Claim ID: ${claimID}`
      : isDraft
      ? `Đã lưu bản nháp thành công! Claim ID: ${claimID}`
      : `Yêu cầu bảo hành đã được gửi thành công! Claim ID: ${claimID}`;

    // Show success message (already shown in CreateWarrantyForm, this is backup)
    console.log(message);
  };

  const handleEdit = async (claim: WarrantyClaimResponse) => {
    // ✅ Đồng bộ với backend: status = "Chờ duyệt" hoặc "Nháp"
    if (claim.status !== "Chờ duyệt" && claim.status !== "Nháp") {
      alert("Không thể chỉnh sửa. Yêu cầu đã được xử lý.");
      return;
    }

    try {
      // Load vehicle info for the claim's VIN
      const vehicleResponse = await warrantyClaimAPI.getVehicleInfoByVin(
        claim.vin
      );
      const vehicleInfo = vehicleResponse.data.result;

      // Set current vehicle info và hiện form edit
      setCurrentVehicleInfo(vehicleInfo);
      setEditingClaim(claim);
      setShowCreateForm(true);

      // Switch to search tab to show the form
      setActiveTab("search");
    } catch (error) {
      console.error("Error loading claim for edit:", error);
      alert("Không thể tải thông tin yêu cầu để chỉnh sửa.");
    }
  };

  const handleDelete = async (claimId: number) => {
    const claim = warrantyClaims.find((c) => c.claimID === claimId);
    // ✅ Đồng bộ với backend: chỉ cho phép xóa "Chờ duyệt" hoặc "Nháp"
    if (claim && claim.status !== "Chờ duyệt" && claim.status !== "Nháp") {
      alert("Không thể xóa. Yêu cầu đã được xử lý.");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn xóa yêu cầu này?")) {
      return;
    }

    try {
      await warrantyClaimAPI.deleteClaim(claimId);
      alert("Đã xóa yêu cầu bảo hành thành công.");
      await loadWarrantyClaims();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Không thể xóa yêu cầu.";
      alert(errorMsg);
      console.error("Error deleting claim:", error);
    }
  };

  const handleViewDetails = (claim: WarrantyClaimResponse) => {
    setSelectedClaim(claim);
    setShowDetailsDialog(true);
  };

  const rejectedClaims = warrantyClaims.filter((c) => c.status === "Từ chối");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Car className="h-8 w-8" />
          <div>
            <h1 className="text-lg font-semibold">
              Hệ thống quản lý bảo hành xe
            </h1>
            <p className="text-muted-foreground text-sm">
              Ford Warranty Management System
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Tra cứu xe
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Theo dõi yêu cầu
            </TabsTrigger>
            <TabsTrigger value="responses" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Phản hồi hãng
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Vehicle Search */}
          <TabsContent value="search" className="space-y-6">
            <VehicleSearch onSearch={handleSearch} />

            {currentVehicleInfo && !showCreateForm && (
              <VehicleDetails
                vehicleInfo={currentVehicleInfo}
                warrantyHistory={warrantyHistory}
                onCreateWarranty={handleCreateWarranty}
              />
            )}

            {showCreateForm && currentVehicleInfo && (
              <CreateWarrantyForm
                vin={currentVehicleInfo.vin}
                installedParts={currentVehicleInfo.installedParts}
                serviceCenterID={SERVICE_CENTER_ID}
                onSuccess={handleCreateSuccess}
                onCancel={handleCancelCreate}
                // ✅ Edit Mode Props
                editMode={!!editingClaim}
                claimID={editingClaim?.claimID}
                initialDescription={editingClaim?.description}
                initialSelectedParts={editingClaim?.affectedParts?.map(
                  (part) => ({
                    partSerialNumber: part.partSerialNumber,
                    description: part.description || "",
                  })
                )}
              />
            )}

            {!currentVehicleInfo && !showCreateForm && (
              <div className="text-center py-12 text-muted-foreground">
                <Car className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Nhập VIN để bắt đầu tra cứu thông tin xe</p>
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Warranty Tracking */}
          <TabsContent value="tracking" className="space-y-6">
            {rejectedClaims.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>
                      Có {rejectedClaims.length} yêu cầu bị từ chối. Vui lòng
                      xem chi tiết để biết thêm thông tin.
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <WarrantyList
              claims={warrantyClaims}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>

          {/* Tab 3: Manufacturer Responses */}
          <TabsContent value="responses">
            <ManufacturerResponsePanel
              claims={warrantyClaims}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <WarrantyDetailsDialog
        claim={selectedClaim}
        open={showDetailsDialog}
        onClose={() => {
          setShowDetailsDialog(false);
          setSelectedClaim(null);
        }}
      />
    </div>
  );
}
