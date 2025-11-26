import { useState, useEffect, useCallback } from "react"; // Thêm useCallback để tối ưu
import { useParams, useNavigate } from "react-router";
import type { WarrantyClaimResponse } from "../types/warranty";
import { warrantyClaimAPI } from "@/utility/index";
import { useDeleteWarranty } from "@/hooks/ManageWarranty/CRUDWaDe/useDeleteWarranty";

import CreateWarrantyForm from "@/pages/SC_Technician/ManageWarranty/AlertComponents/CreateWarrantyForm";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  FileText,
  User,
  AlertCircle,
  CheckCircle,
  Car,
  MapPin,
  Phone,
  ArrowLeft,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";

import StatusBadge from "@/components/StatusBadge";
import SuccessDelete from "../AlertComponents/SuccessDelete";

export default function WarrantyDetailPage() {
  const { claimId } = useParams();
  const navigate = useNavigate();

  // --- 2. STATE CHO EDIT FORM ---
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Hook Xóa (Giữ nguyên)
  const {
    isDeleting,
    deleteDialogOpen,
    setDeleteDialogOpen,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useDeleteWarranty({
    onSuccess: () => {
      navigate(-1);
    },
    onError: (err?: any) => {
      alert("Không thể xóa yêu cầu này. Vui lòng thử lại sau.");
      console.error(err);
    },
  });

  const [claim, setClaim] = useState<WarrantyClaimResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- 3. TÁCH HÀM FETCH DATA RA NGOÀI ---
  // Để có thể gọi lại (reload) sau khi chỉnh sửa thành công
  const fetchClaimDetail = useCallback(async () => {
    if (!claimId) return;
    try {
      // Nếu đang không phải lần đầu load (đã có data), có thể set loading false hoặc xử lý UI khác
      // Ở đây mình giữ nguyên logic set loading để đảm bảo data đồng bộ
      setLoading(true);
      const response = await warrantyClaimAPI.getClaimById(Number(claimId));
      setClaim(response.data.result);
    } catch (err) {
      console.error("Error fetching claim details:", err);
      setError("Không thể tải thông tin yêu cầu bảo hành.");
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  // Gọi fetch khi component mount
  useEffect(() => {
    fetchClaimDetail();
  }, [fetchClaimDetail]);

  // --- 4. CÁC HÀM XỬ LÝ EDIT ---
  const handleEditClick = () => {
    setIsEditOpen(true); // Mở form
  };

  const handleEditSuccess = (id: number, isDraft: boolean) => {
    setIsEditOpen(false); // Đóng form
    fetchClaimDetail(); // Tải lại dữ liệu mới nhất từ server
  };

  // 5. Loading & Error UI
  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <p className="text-destructive font-medium">
          {error || "Không tìm thấy dữ liệu"}
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>
    );
  }

  // 6. Render Giao diện chính
  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* --- HEADER & ACTIONS --- */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              Chi tiết yêu cầu #{claim.claimID}
              <StatusBadge status={claim.status} />
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="h-3 w-3" />
              Ngày tạo:{" "}
              {new Date(claim.creationDate).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2">
          {(claim.status === "Nháp" || claim.status === "Chờ duyệt") && (
            <>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive border-destructive/50 hover:bg-destructive/10 gap-2"
                onClick={() => requestDelete(claim.claimID)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Xóa</span>
              </Button>

              <Button
                variant="default"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleEditClick()}
                disabled={isDeleting}
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Chỉnh sửa</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* --- CỘT TRÁI: Thông tin chi tiết (Chiếm 2 phần) --- */}
        <div className="md:col-span-2 space-y-6">
          {/* 1. Mô tả sự cố */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Mô tả sự cố</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {claim.description}
              </p>
            </CardContent>
          </Card>

          {/* 2. Danh sách phụ tùng */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Phụ tùng cần bảo hành</span>
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  SL: {claim.affectedParts.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {claim.affectedParts.map((part, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 bg-card hover:bg-muted/20 transition-colors text-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">{part.partTypeName}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        SN: {part.partSerialNumber}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(part.createdDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div>
                    <span className="font-medium text-xs uppercase text-muted-foreground">
                      Lỗi:{" "}
                    </span>
                    <span>{part.partTypeDescription}</span>
                  </div>
                  {part.description && (
                    <div className="mt-2 p-2 bg-muted/50 rounded text-xs italic text-muted-foreground">
                      "{part.description}"
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 3. Kết quả xử lý (Nếu có) */}
          {claim.result && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Kết quả xử lý từ hãng
                </CardTitle>
              </CardHeader>
              <CardContent>
                {claim.status === "Được chấp nhận" ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <p className="font-semibold mb-1">
                        Yêu cầu được chấp nhận
                      </p>
                      <p className="whitespace-pre-wrap text-sm">
                        {claim.result}
                      </p>
                    </AlertDescription>
                  </Alert>
                ) : claim.status === "Từ chối" ? (
                  <Alert
                    variant="destructive"
                    className="bg-red-50 border-red-200"
                  >
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <p className="font-semibold mb-1">Yêu cầu bị từ chối</p>
                      <p className="whitespace-pre-wrap text-sm">
                        {claim.result}
                      </p>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="bg-muted rounded-lg p-4 text-sm">
                    <p className="whitespace-pre-wrap">{claim.result}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* --- CỘT PHẢI: Thông tin Meta (Chiếm 1 phần) --- */}
        <div className="space-y-6">
          {/* 1. Thông tin Xe */}
          <Card>
            <CardHeader className="pb-3 bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Car className="h-4 w-4" /> Thông tin xe
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-sm space-y-3">
              <div className="flex justify-between border-b border-dashed pb-2">
                <span className="text-muted-foreground">VIN</span>
                <span className="font-mono font-medium">{claim.vin}</span>
              </div>
              <div className="flex justify-between border-b border-dashed pb-2">
                <span className="text-muted-foreground">Biển số</span>
                <span className="font-medium">{claim.licensePlate}</span>
              </div>
              <div className="flex justify-between border-b border-dashed pb-2">
                <span className="text-muted-foreground">Model</span>
                <span>{claim.modelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pin</span>
                <span>{claim.batteryCapacity} kWh</span>
              </div>
            </CardContent>
          </Card>

          {/* 2. Khách hàng */}
          <Card>
            <CardHeader className="pb-3 bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" /> Khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-sm space-y-3">
              <div>
                <div className="font-medium text-base">
                  {claim.customerName}
                </div>
                <div className="text-muted-foreground text-xs mt-0.5">
                  Chủ sở hữu
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{claim.customerPhone}</span>
              </div>
              <div className="flex items-center gap-2 break-all">
                <span className="text-muted-foreground font-bold">@</span>
                <span>{claim.customerEmail}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                <span className="leading-tight">{claim.customerAddress}</span>
              </div>
            </CardContent>
          </Card>

          {/* 3. Service Center */}
          <Card>
            <CardHeader className="pb-3 bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Service Center
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-sm space-y-3">
              <div className="font-medium">{claim.serviceCenterName}</div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{claim.serviceCenterPhone}</span>
              </div>
              <div className="text-muted-foreground text-xs leading-relaxed">
                {claim.serviceCenterAddress}
              </div>
            </CardContent>
          </Card>

          {/* 4. Tài liệu đính kèm */}
          {claim.attachments && claim.attachments.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Tài liệu (
                  {claim.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {claim.attachments.map((attachment) => (
                  <a
                    key={attachment.attachmentID}
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-md border hover:bg-muted transition-colors group"
                  >
                    <div className="bg-blue-50 p-1.5 rounded text-blue-600 group-hover:bg-white">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate text-blue-700 group-hover:underline">
                        {attachment.fileName}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(attachment.uploadDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* --- 5. RENDER FORM EDIT --- */}
      {/* Chỉ render khi có data claim và đang mở edit */}
      {isEditOpen && claim && (
        <CreateWarrantyForm
          open={isEditOpen}
          editMode={true} // Kích hoạt chế độ sửa
          claimID={claim.claimID} // Truyền ID để form tự fetch data
          onCancel={() => setIsEditOpen(false)}
          onSuccess={handleEditSuccess}
          // Props fallback (không dùng trong edit mode nhưng cần truyền để thỏa mãn type)
          serviceCenterID={0}
          vin={claim.vin}
        />
      )}

      {/* Dialog Xóa */}
      <SuccessDelete
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
