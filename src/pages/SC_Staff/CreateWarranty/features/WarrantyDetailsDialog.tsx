"use client";

import type { WarrantyClaimResponse } from "../types/warranty";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  FileText,
  User,
  AlertCircle,
  CheckCircle,
  Car,
  MapPin,
  Phone,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WarrantyDetailsDialogProps {
  claim: WarrantyClaimResponse | null;
  open: boolean;
  onClose: () => void;
}

export function WarrantyDetailsDialog({
  claim,
  open,
  onClose,
}: WarrantyDetailsDialogProps) {
  if (!claim) return null;

  // --- Cấu hình trạng thái ---
  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      PENDING: { label: "🟡 Chờ duyệt", variant: "outline" },
      APPROVED: { label: "🟢 Được chấp nhận", variant: "default" },
      IN_PROGRESS: { label: "🔵 Đang xử lý", variant: "secondary" },
      COMPLETED: { label: "✅ Đã hoàn thành", variant: "default" },
      REJECTED: { label: "🔴 Từ chối", variant: "destructive" },
    };
    return configs[status] || configs.PENDING;
  };

  const statusConfig = getStatusConfig(claim.status);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Claim #{claim.claimID}</DialogTitle>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>
          <DialogDescription>Chi tiết yêu cầu bảo hành</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* --- Thông tin xe --- */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Car className="h-4 w-4" />
              Thông tin xe
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">VIN</p>
                <p className="font-mono">{claim.vin}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Biển số</p>
                <p className="font-medium">{claim.licensePlate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Model</p>
                <p>{claim.modelName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Màu sắc</p>
                <p>{claim.color}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Năm sản xuất</p>
                <p>{claim.productionYear}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Dung lượng pin</p>
                <p>{claim.batteryCapacity} kWh</p>
              </div>
            </div>
          </div>

          {/* --- Thông tin khách hàng --- */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Thông tin khách hàng
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Họ tên</p>
                <p className="font-medium">{claim.customerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Điện thoại
                </p>
                <p>{claim.customerPhone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p>{claim.customerEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CMND/CCCD</p>
                <p>{claim.customerCmnd}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Địa chỉ
                </p>
                <p>{claim.customerAddress}</p>
              </div>
            </div>
          </div>

          {/* --- Thông tin Service Center --- */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium">Service Center</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Tên</p>
                <p className="font-medium">{claim.serviceCenterName}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Điện thoại
                </p>
                <p>{claim.serviceCenterPhone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Địa chỉ
                </p>
                <p>{claim.serviceCenterAddress}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* --- Thông tin yêu cầu bảo hành --- */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Ngày tạo:</span>
              <span className="font-medium text-foreground">
                {new Date(claim.creationDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>

          <Separator />

          {/* --- Mô tả sự cố --- */}
          <div className="space-y-2">
            <h4 className="font-medium">Mô tả sự cố</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {claim.description}
            </p>
          </div>

          {/* --- Phụ tùng cần bảo hành --- */}
          <div className="space-y-3">
            <h4 className="font-medium">
              Phụ tùng cần bảo hành ({claim.affectedParts.length})
            </h4>
            <div className="space-y-2">
              {claim.affectedParts.map((part, index) => (
                <div key={index} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{part.partTypeName}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        SN: {part.partSerialNumber}
                      </p>
                      <p className="text-sm">{part.partTypeDescription}</p>
                      {part.description && (
                        <p className="text-sm text-muted-foreground italic">
                          "{part.description}"
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(part.createdDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- Tài liệu đính kèm --- */}
          {claim.attachments && claim.attachments.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Tài liệu đính kèm ({claim.attachments.length})
              </h4>
              <div className="space-y-2">
                {claim.attachments.map((attachment) => (
                  <div
                    key={attachment.attachmentID}
                    className="flex items-center gap-3 p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attachment.fileType} •{" "}
                        {new Date(attachment.uploadDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    <a
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      Xem
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- Kết quả xử lý --- */}
          {claim.result && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Kết quả xử lý</h4>
                {claim.status === "APPROVED" ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>
                          <strong>Trạng thái:</strong> Đã được chấp nhận
                        </p>
                        <p className="whitespace-pre-wrap">{claim.result}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : claim.status === "REJECTED" ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>
                          <strong>Trạng thái:</strong> Đã bị từ chối
                        </p>
                        <p className="whitespace-pre-wrap">{claim.result}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap">{claim.result}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
