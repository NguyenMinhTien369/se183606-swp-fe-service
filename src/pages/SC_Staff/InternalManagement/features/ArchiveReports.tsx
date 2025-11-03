"use client";

import { useState } from "react";
import {
  Search,
  Download,
  FileText,
  Image as ImageIcon,
  Eye,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { WarrantyClaimResponse } from "../types";

interface ArchiveReportsProps {
  claims: WarrantyClaimResponse[];
}

export function ArchiveReports({ claims }: ArchiveReportsProps) {
  // Filter completed requests only
  const completedRequests = claims.filter((r) => r.status === "COMPLETED");

  const [searchVin, setSearchVin] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<WarrantyClaimResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("");

  const handleViewDetails = (request: WarrantyClaimResponse) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  const handleExport = (format: string) => {
    setExportFormat(format);
    setIsExportDialogOpen(true);
  };

  const filteredRequests = completedRequests.filter((req) => {
    if (searchVin && !req.vin.toLowerCase().includes(searchVin.toLowerCase()))
      return false;
    if (searchCode && !String(req.claimID).includes(searchCode)) return false;
    return true;
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Lưu trữ & Báo cáo bảo hành
          </h2>
          <p className="text-muted-foreground text-sm">
            Quản lý hồ sơ sau khi hoàn tất bảo hành
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Xuất báo cáo
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("pdf")}>
              <FileText className="w-4 h-4 mr-2" />
              Xuất PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("excel")}>
              <FileText className="w-4 h-4 mr-2" />
              Xuất Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              <FileText className="w-4 h-4 mr-2" />
              Xuất CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search Panel */}
      <Card className="p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground">
          <Search className="w-4 h-4" />
          <span>Tìm kiếm hồ sơ</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Tìm theo VIN..."
            value={searchVin}
            onChange={(e) => setSearchVin(e.target.value)}
          />
          <Input
            placeholder="Tìm theo Mã yêu cầu..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => {
              setSearchVin("");
              setSearchCode("");
            }}
          >
            Xóa tìm kiếm
          </Button>
        </div>
      </Card>

      {/* Archive Table */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Danh sách hồ sơ hoàn tất
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã yêu cầu</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Người xử lý</TableHead>
                  <TableHead>Ngày hoàn tất</TableHead>
                  <TableHead>Kết quả hãng</TableHead>
                  <TableHead>🗃️ Hồ sơ</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">
                        Không tìm thấy hồ sơ nào phù hợp.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.claimID}>
                      <TableCell>#{request.claimID}</TableCell>
                      <TableCell>{request.vin}</TableCell>
                      <TableCell>{request.serviceCenterName || "-"}</TableCell>
                      <TableCell>
                        {new Date(request.creationDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 border-green-200"
                        >
                          ✅ {request.result || "OK"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-muted-foreground">
                            {request.attachments?.length || 0} files
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Info Note */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <p className="text-amber-800 text-sm">
          <strong>Lưu ý:</strong> Hồ sơ không thể xóa, chỉ có thể đóng. Chỉ SC
          Staff và Manager có quyền truy cập khu vực lưu trữ.
        </p>
      </Card>

      {/* Export Confirmation Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xuất báo cáo</DialogTitle>
            <DialogDescription>
              Bạn đang xuất file ở định dạng{" "}
              <strong>{exportFormat.toUpperCase()}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <CheckCircle2 className="text-green-600 w-12 h-12" />
          </div>
          <p className="text-center text-muted-foreground text-sm">
            Quá trình xuất báo cáo sẽ hoàn tất trong vài giây.
          </p>
          <DialogFooter className="flex justify-center pt-4">
            <Button onClick={() => setIsExportDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl">
          {selectedRequest && (
            <ScrollArea className="max-h-[80vh] pr-2">
              <DialogHeader>
                <DialogTitle>
                  Hồ sơ bảo hành - #{selectedRequest.claimID}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-muted-foreground text-sm">VIN</label>
                    <div className="mt-1 font-medium">
                      {selectedRequest.vin}
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm">
                      Model
                    </label>
                    <div className="mt-1 font-medium">
                      {selectedRequest.modelName}
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm">
                      Khách hàng
                    </label>
                    <div className="mt-1 font-medium">
                      {selectedRequest.customerName}
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm">
                      Ngày tạo
                    </label>
                    <div className="mt-1 font-medium">
                      {new Date(
                        selectedRequest.creationDate
                      ).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Technical Report */}
                <div>
                  <h4 className="mb-3 font-semibold">📄 Thông tin bảo hành</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="text-muted-foreground">Mô tả</label>
                      <p className="mt-1">
                        {selectedRequest.description || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-muted-foreground">
                        Phụ tùng bị ảnh hưởng
                      </label>
                      {selectedRequest.affectedParts &&
                        selectedRequest.affectedParts.length > 0 ? (
                        <ul className="mt-1 space-y-2">
                          {selectedRequest.affectedParts.map((part, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 p-2 bg-muted/30 rounded"
                            >
                              <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                              <div className="flex-1">
                                <div className="font-medium">
                                  {part.partTypeName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  SN: {part.partSerialNumber}
                                </div>
                                {part.description && (
                                  <div className="mt-1 text-muted-foreground">
                                    {part.description}
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-muted-foreground">
                          Chưa có thông tin
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Images */}
                <div>
                  <h4 className="mb-3 font-semibold">🖼️ Ảnh trước/sau</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 text-center hover:bg-accent transition">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Ảnh trước sửa chữa
                      </p>
                      <Button variant="link" size="sm" className="mt-2">
                        Xem ảnh
                      </Button>
                    </Card>
                    <Card className="p-4 text-center hover:bg-accent transition">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Ảnh sau sửa chữa
                      </p>
                      <Button variant="link" size="sm" className="mt-2">
                        Xem ảnh
                      </Button>
                    </Card>
                  </div>
                </div>

                <Separator />

                {/* Result */}
                <div>
                  <h4 className="mb-3 font-semibold">📝 Kết quả xử lý</h4>
                  <Card className="p-4 bg-muted">
                    <p className="text-sm">
                      {selectedRequest.result || "Chưa có kết quả"}
                    </p>
                  </Card>
                </div>

                <Separator />

                {/* Service Center Info */}
                <div>
                  <h4 className="mb-3 font-semibold">🏢 Trung tâm dịch vụ</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tên:</span>
                      <span className="font-medium">
                        {selectedRequest.serviceCenterName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Địa chỉ:</span>
                      <span className="font-medium">
                        {selectedRequest.serviceCenterAddress}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Điện thoại:</span>
                      <span className="font-medium">
                        {selectedRequest.serviceCenterPhone}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Attachments */}
                <div>
                  <h4 className="mb-3 font-semibold">📎 File đính kèm</h4>
                  {selectedRequest.attachments &&
                    selectedRequest.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRequest.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium">{file.fileName}</div>
                              <div className="text-xs text-muted-foreground uppercase">
                                {file.fileType}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(file.fileUrl, "_blank")}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Tải về
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Không có file đính kèm
                    </p>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
