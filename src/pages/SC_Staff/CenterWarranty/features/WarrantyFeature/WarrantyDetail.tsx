import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import type { WarrantyClaimResponse } from "@/pages/SC_Staff/CenterWarranty/types/CenterWarranty";
import { warrantyClaimAPI } from "@/utility/index";

// Custom Hooks
import { useWarrantyAction } from "@/pages/SC_Staff/CenterWarranty/Hooks/useWarrantyAction";
import { useRejectClaim } from "@/pages/SC_Staff/CenterWarranty/Hooks/useRejectClaim";

// Các import UI components
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
  PackageCheck,
  Send,
  XCircle,
} from "lucide-react";

import StatusBadge from "@/components/StatusBadge";
import RejectClaimDialog from "@/pages/SC_Staff/CenterWarranty/features/WarrantyFeature/components/RejectClaimDialog";
import ConfirmActionDialog from "@/pages/SC_Staff/CenterWarranty/features/WarrantyFeature/components/ConfirmActionDialog";
import SendToFactoryDialog from "@/pages/SC_Staff/CenterWarranty/features/WarrantyFeature/components/SendToFactoryDialog";
import useConfirmStockIn from "@/pages/SC_Staff/CenterWarranty/Hooks/useConfirmStockIn";
import useIssueParts from "@/pages/SC_Staff/CenterWarranty/Hooks/useIssueParts";

export default function WarrantyDetail() {
  const { claimId } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState<WarrantyClaimResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [showSendFactoryDialog, setShowSendFactoryDialog] = useState(false);

  // --- 1. FETCH DATA ---
  const fetchClaimDetail = useCallback(async () => {
    if (!claimId) return;
    try {
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

  useEffect(() => {
    fetchClaimDetail();
  }, [fetchClaimDetail]);

  // Hook 1: Xử lý Cấp phụ tùng & Gửi hãng
  const { isProcessing, issueParts, sendToFactory } = useWarrantyAction({
    onSuccess: () => {
      fetchClaimDetail();
      // Đóng dialog sau khi thành công
      setShowIssueDialog(false);
      setShowSendFactoryDialog(false);
    },
  });

  // Hook 2: Xử lý Từ chối
  const { isRejecting, rejectClaim } = useRejectClaim({
    onSuccess: () => {
      fetchClaimDetail();
      setShowRejectDialog(false);
      setRejectReason("");
    },
  });
  //Hook 3: Cho nút Nhận hàng và nhập kho
  const { handleConfirmStockIn, isProcessing: isProcessingStockIn } =
    useConfirmStockIn({
      onSuccess: () => {
        fetchClaimDetail();
      },
    });
  const handleReceiveAndStockIn = async () => {
    if (!claimId) return;
    try {
      await handleConfirmStockIn(Number(claimId));
    } catch (error: any) {
      console.log(error.message || "Có lỗi xảy ra");
    }
  };

  //Hook 4: Cho nút Cấp phụ tùng khi trạng thái là "Phụ tùng đã về trung tâm"
  const { handleIssueParts, isProcessing: isProcessingIssueParts } =
    useIssueParts({
      onSuccess: () => {
        fetchClaimDetail();
      },
    });
  const handleIssuePartsForCenter = async () => {
    if (!claimId) return;
    try {
      await handleIssueParts(Number(claimId));
    } catch (error: any) {
      console.log(error.message || "Có lỗi xảy ra");
    }
  };

  // --- 3. CÁC HÀM XỬ LÝ CHỨC NĂNG ---

  // A. Hàm click nút "Cấp phụ tùng" -> Mở Dialog
  const handleIssuePartsClick = () => {
    setShowIssueDialog(true);
  };

  // B. Hàm xác nhận CẤP PHỤ TÙNG
  const handleConfirmIssueParts = async () => {
    if (!claimId) return;
    try {
      await issueParts(
        Number(claimId),
        undefined,
        "Cấp phụ tùng từ kho trung tâm"
      );
    } catch (error: any) {
      console.log(error.message || "Có lỗi xảy ra");
    }
  };

  const handleSendToFactoryClick = () => {
    setShowSendFactoryDialog(true);
  };

  // D. Hàm xác nhận GỬI HÃNG (Được gọi từ Dialog sau khi chọn ngày)
  const handleConfirmSendFactory = async (appointmentDate: string) => {
    if (!claimId) return;
    try {
      // Gọi hook sendToFactory với ngày đã chọn
      await sendToFactory(Number(claimId), appointmentDate);
    } catch (error: any) {
      console.log(error.message || "Không thể gửi lên hãng");
    }
  };

  // D. Hàm click nút "Từ chối"
  const handleRejectClick = () => {
    setShowRejectDialog(true);
  };

  // E. Hàm xác nhận từ chối
  const handleConfirmReject = async () => {
    if (!claimId) return;
    try {
      await rejectClaim(Number(claimId), rejectReason);
    } catch (error: any) {
      console.log(error.message || "Không thể từ chối");
    }
  };

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

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* HEADER & ACTIONS */}
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

        {/* --- KHU VỰC CÁC NÚT CHỨC NĂNG --- */}
        {/* --- 3 nút chính --- */}
        <div className="flex items-center gap-2 ml-auto">
          {claim.status === "Chờ duyệt" && (
            <>
              {/* Nút 1: Cấp phụ tùng -> Mở Dialog */}
              <Button
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 gap-2"
                onClick={handleIssuePartsClick}
                disabled={isProcessing || isRejecting}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PackageCheck className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isProcessing ? "Đang xử lý..." : "Cấp phụ tùng"}
                </span>
              </Button>

              {/* Nút 2: Gửi hãng -> Dùng window.confirm */}
              <Button
                variant="outline"
                className="text-orange-600 border-orange-200 hover:bg-orange-50 gap-2"
                onClick={handleSendToFactoryClick}
                disabled={isProcessing || isRejecting}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isProcessing ? "Đang xử lý..." : "Gửi hãng"}
                </span>
              </Button>

              {/* Nút 3: Từ chối -> Mở Dialog từ chối */}
              <Button
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-2"
                onClick={handleRejectClick}
                disabled={isProcessing || isRejecting}
              >
                <XCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Từ chối</span>
              </Button>
            </>
          )}
        </div>
        {/* --- Nút nhận hàng và nhập kho --- */}
        <div className="flex items-center gap-2">
          {claim.status === "Đang giao phụ tùng" && (
            <>
              <Button
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 gap-2"
                onClick={handleReceiveAndStockIn}
                disabled={isProcessingStockIn}
              >
                {isProcessingStockIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PackageCheck className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isProcessingStockIn
                    ? "Đang xử lý..."
                    : "Nhận hàng và nhập kho"}
                </span>
              </Button>
            </>
          )}
        </div>
        {/* --- Nút Cấp phụ tùng đưa trạng thái về  "Đã cấp phụ tùng"--- */}
        <div className="flex items-center gap-2">
          {claim.status === "Phụ tùng đã về trung tâm" && (
            <>
              <Button
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 gap-2"
                onClick={handleIssuePartsForCenter}
                disabled={isProcessingIssueParts}
              >
                {isProcessingIssueParts ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PackageCheck className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isProcessingIssueParts ? "Đang xử lý..." : "Cấp phụ tùng"}
                </span>
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
                        <span className="mx-1">|</span> Số lượng :{" "}
                        {part.quantity}
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

          {/* 3. Kết quả xử lý */}
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

      {/* --- CÁC DIALOG XÁC NHẬN VÀ TỪ CHỐI --- */}

      {/* 1. Dialog Từ chối */}
      <RejectClaimDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        claimId={Number(claimId) || 0}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onConfirm={handleConfirmReject}
        isRejecting={isRejecting}
      />
      <SendToFactoryDialog
        open={showSendFactoryDialog}
        onOpenChange={setShowSendFactoryDialog}
        onConfirm={handleConfirmSendFactory}
        isLoading={isProcessing}
      />

      {/* 2. Dialog Xác nhận (CHỈ DÀNH CHO CẤP PHỤ TÙNG) */}
      <ConfirmActionDialog
        open={showIssueDialog}
        onOpenChange={setShowIssueDialog}
        onConfirm={handleConfirmIssueParts}
        isLoading={isProcessing}
        // Hardcode các props chỉ cho cấp phụ tùng
        title="Xác nhận cấp phụ tùng"
        description={
          <span>
            Bạn có chắc chắn muốn xác nhận <b>cấp phụ tùng</b> cho yêu cầu bảo
            hành này?
            <br />
            <span className="text-sm text-muted-foreground block mt-1">
              (Hệ thống sẽ trừ tồn kho linh kiện tương ứng)
            </span>
          </span>
        }
        confirmText="Đồng ý"
        variant="info" // Màu xanh
      />
    </div>
  );
}
