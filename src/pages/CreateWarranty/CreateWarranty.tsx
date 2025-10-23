"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Car, FileText, Bell } from "lucide-react";

import { VehicleSearch } from "./features/VehicleSearch";
import { VehicleDetails } from "./features/VehicleDetails";
import { CreateWarrantyForm } from "./features/CreateWarrantyForm";
import { SubmitConfirmationDialog } from "./features/SubmitConfirmationDialog";
import { WarrantyList } from "./features/WarrantyList";
import { WarrantyDetailsDialog } from "./features/WarrantyDetailsDialog";
import { ManufacturerResponsePanel } from "./features/ManufacturerResponsePanel";

import type {
  Vehicle,
  Part,
  WarrantyHistory,
  WarrantyClaim,
} from "./types/warranty";
import {
  mockVehicles,
  mockParts,
  mockWarrantyHistory,
  mockWarrantyClaims,
} from "./data/mockData";

export default function App() {
  const [activeTab, setActiveTab] = useState("search");
  const [searchedVin, setSearchedVin] = useState<string | null>(null);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [currentParts, setCurrentParts] = useState<Part[]>([]);
  const [currentHistory, setCurrentHistory] = useState<WarrantyHistory[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [pendingClaim, setPendingClaim] =
    useState<Partial<WarrantyClaim> | null>(null);
  const [warrantyClaims, setWarrantyClaims] =
    useState<WarrantyClaim[]>(mockWarrantyClaims);
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Kiểm tra phản hồi mới từ hãng
  useEffect(() => {
    const newApprovals = warrantyClaims.filter(
      (c) =>
        c.manufacturerResponse &&
        c.manufacturerResponse.result === "approved" &&
        c.status === "approved"
    );

    if (newApprovals.length > 0 && activeTab === "tracking") {
      newApprovals.forEach((claim) => {
        alert(
          `Hãng đã phê duyệt yêu cầu ${claim.requestCode}. Bạn có thể chuyển sang bước thực hiện bảo hành.`
        );
      });
    }
  }, [activeTab, warrantyClaims]);

  const handleSearch = (vin: string) => {
    const vehicle = mockVehicles[vin];
    if (vehicle) {
      setCurrentVehicle(vehicle);
      setCurrentParts(mockParts[vin] || []);
      setCurrentHistory(mockWarrantyHistory[vin] || []);
      setSearchedVin(vin);
      setShowCreateForm(false);
      alert(`Đã tìm thấy thông tin xe ${vehicle.model}`);
    } else {
      setCurrentVehicle(null);
      setCurrentParts([]);
      setCurrentHistory([]);
      setSearchedVin(null);
      alert("Không tìm thấy VIN trong hệ thống. Vui lòng thử lại.");
    }
  };

  const handleCreateWarranty = () => setShowCreateForm(true);
  const handleCancelCreate = () => setShowCreateForm(false);

  const handleSaveDraft = (claim: Partial<WarrantyClaim>) => {
    const newClaim: WarrantyClaim = {
      ...claim,
      id: String(Date.now()),
      status: "pending",
      logs: [
        {
          id: String(Date.now()),
          user: "Kỹ thuật viên",
          action: "Lưu bản nháp",
          timestamp: new Date().toISOString(),
        },
      ],
    } as WarrantyClaim;

    setWarrantyClaims((prev) => [...prev, newClaim]);
    alert("Đã lưu bản nháp yêu cầu bảo hành.");
  };

  const handleSubmitToManufacturer = (claim: Partial<WarrantyClaim>) => {
    setPendingClaim(claim);
    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
    if (pendingClaim) {
      const newClaim: WarrantyClaim = {
        ...pendingClaim,
        id: String(Date.now()),
        status: "pending",
        logs: [
          {
            id: String(Date.now()),
            user: "Kỹ thuật viên",
            action: "Gửi yêu cầu lên hãng",
            timestamp: new Date().toISOString(),
          },
        ],
      } as WarrantyClaim;

      setWarrantyClaims((prev) => [...prev, newClaim]);
      setShowSubmitDialog(false);
      setPendingClaim(null);
      setShowCreateForm(false);
      setActiveTab("tracking");

      alert("Yêu cầu bảo hành đã được gửi lên hãng thành công!");
    }
  };

  const handleEdit = (claim: WarrantyClaim) => {
    if (claim.status !== "pending") {
      alert("Không thể chỉnh sửa. Yêu cầu đã được hãng xử lý.");
      return;
    }
    alert("Chức năng chỉnh sửa đang được phát triển.");
  };

  const handleDelete = (claimId: string) => {
    const claim = warrantyClaims.find((c) => c.id === claimId);
    if (claim && claim.status !== "pending") {
      alert("Không thể xóa. Yêu cầu đã được hãng xử lý.");
      return;
    }

    setWarrantyClaims((prev) => prev.filter((c) => c.id !== claimId));
    alert("Đã xóa yêu cầu bảo hành.");
  };

  const handleViewDetails = (claim: WarrantyClaim) => {
    setSelectedClaim(claim);
    setShowDetailsDialog(true);
  };

  const rejectedClaims = warrantyClaims.filter(
    (c) =>
      c.manufacturerResponse && c.manufacturerResponse.result === "rejected"
  );

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

            {currentVehicle && !showCreateForm && (
              <VehicleDetails
                vehicle={currentVehicle}
                parts={currentParts}
                warrantyHistory={currentHistory}
                onCreateWarranty={handleCreateWarranty}
              />
            )}

            {showCreateForm && currentVehicle && (
              <CreateWarrantyForm
                vin={currentVehicle.vin}
                parts={currentParts}
                onSave={handleSaveDraft}
                onSubmit={handleSubmitToManufacturer}
                onCancel={handleCancelCreate}
              />
            )}

            {!currentVehicle && !showCreateForm && (
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
      <SubmitConfirmationDialog
        open={showSubmitDialog}
        onConfirm={confirmSubmit}
        onCancel={() => setShowSubmitDialog(false)}
        hasVin={!!pendingClaim?.vin}
        hasPartSelected={!!pendingClaim?.parts && pendingClaim.parts.length > 0}
        hasReportAndImages={
          !!pendingClaim?.technicalReport &&
          !!pendingClaim?.images &&
          pendingClaim.images.length > 0
        }
      />

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
