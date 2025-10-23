"use client";

import type { WarrantyClaim } from "../types/warranty";
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
  Image as ImageIcon,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WarrantyDetailsDialogProps {
  claim: WarrantyClaim | null;
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
      pending: { label: "🟡 Chờ duyệt", variant: "outline" },
      approved: { label: "🟢 Được chấp nhận", variant: "default" },
      completed: { label: "🔵 Đã xử lý", variant: "secondary" },
      rejected: { label: "🔴 Từ chối", variant: "destructive" },
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(claim.status);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{claim.requestCode}</DialogTitle>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>
          <DialogDescription>Chi tiết yêu cầu bảo hành</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* --- Thông tin cơ bản --- */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ngày phát hiện lỗi
              </p>
              <p>{new Date(claim.issueDate).toLocaleDateString("vi-VN")}</p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Người xử lý
              </p>
              <p>{claim.handler}</p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground">VIN</p>
              <p>{claim.vin}</p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Ngày tạo
              </p>
              <p>{new Date(claim.createdDate).toLocaleDateString("vi-VN")}</p>
            </div>
          </div>

          <Separator />

          {/* --- Mô tả sự cố --- */}
          <div className="space-y-2">
            <h4 className="font-medium">Mô tả sự cố</h4>
            <p className="text-muted-foreground">{claim.description}</p>
          </div>

          {/* --- Phụ tùng cần bảo hành --- */}
          <div className="space-y-2">
            <h4 className="font-medium">Phụ tùng cần bảo hành</h4>
            <div className="flex flex-wrap gap-2">
              {claim.parts.map((part, index) => (
                <Badge key={index} variant="secondary">
                  {part}
                </Badge>
              ))}
            </div>
          </div>

          {/* --- Thông tin chẩn đoán (nếu có) --- */}
          {claim.diagnosticInfo && (
            <div className="space-y-2">
              <h4 className="font-medium">Thông tin chẩn đoán</h4>
              <p className="text-muted-foreground">{claim.diagnosticInfo}</p>
            </div>
          )}

          <Separator />

          {/* --- Tệp đính kèm --- */}
          <div className="space-y-3">
            <h4 className="font-medium">Tệp đính kèm</h4>

            {claim.technicalReport && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span>
                  {claim.technicalReport instanceof File
                    ? claim.technicalReport.name
                    : claim.technicalReport}
                </span>
              </div>
            )}

            {claim.images && claim.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Hình ảnh ({claim.images.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {claim.images.map((img, index) => (
                    <div
                      key={index}
                      className="p-2 bg-muted rounded-md text-sm truncate"
                    >
                      {img instanceof File ? img.name : img}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* --- Phản hồi từ hãng (nếu có) --- */}
          {claim.manufacturerResponse && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Phản hồi từ hãng</h4>

                {claim.manufacturerResponse.result === "approved" ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>
                          <strong>Kết quả:</strong> Đã phê duyệt
                        </p>
                        <p>
                          <strong>Ghi chú:</strong>{" "}
                          {claim.manufacturerResponse.notes}
                        </p>
                        {claim.manufacturerResponse.replacementParts && (
                          <p>
                            <strong>Phụ tùng thay thế:</strong>{" "}
                            {claim.manufacturerResponse.replacementParts.join(
                              ", "
                            )}
                          </p>
                        )}
                        <p className="text-muted-foreground text-sm">
                          Cập nhật:{" "}
                          {new Date(
                            claim.manufacturerResponse.updateDate
                          ).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>
                          <strong>Kết quả:</strong> Từ chối
                        </p>
                        <p>
                          <strong>Lý do:</strong>{" "}
                          {claim.manufacturerResponse.notes}
                        </p>
                        <p className="text-sm">
                          Cập nhật:{" "}
                          {new Date(
                            claim.manufacturerResponse.updateDate
                          ).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}

          {/* --- Lịch sử thay đổi --- */}
          {claim.logs && claim.logs.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Lịch sử thay đổi</h4>
                <div className="space-y-2">
                  {claim.logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 text-sm p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <p>
                          <strong>{log.user}</strong> - {log.action}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(log.timestamp).toLocaleString("vi-VN")}
                        </p>
                        {log.changes && (
                          <p className="text-muted-foreground text-xs mt-1">
                            {log.changes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
