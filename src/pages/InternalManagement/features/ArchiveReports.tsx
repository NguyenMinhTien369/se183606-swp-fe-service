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

import { mockWarrantyRequests } from "../lib/mock-data"; // ensure this exports a runtime value
import type { WarrantyRequest } from "../types/warranty"; // optional: keep type import if available

export function ArchiveReports() {
  // compute completed requests from the runtime mock
  const completedRequests = mockWarrantyRequests.filter(
    (r) => r.status === "completed"
  );

  // If you don't mutate requests, use a plain variable instead of state
  const requests: WarrantyRequest[] = completedRequests;

  const [searchVin, setSearchVin] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<WarrantyRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("");

  const handleViewDetails = (request: WarrantyRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  const handleExport = (format: string) => {
    setExportFormat(format);
    setIsExportDialogOpen(true);
  };

  const filteredRequests = requests.filter((req) => {
    if (searchVin && !req.vin.toLowerCase().includes(searchVin.toLowerCase()))
      return false;
    if (searchCode && !req.id.toLowerCase().includes(searchCode.toLowerCase()))
      return false;
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
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.id}</TableCell>
                    <TableCell>{request.vin}</TableCell>
                    <TableCell>{request.assignedTo || "-"}</TableCell>
                    <TableCell>
                      {request.completedDate
                        ? new Date(request.completedDate).toLocaleDateString(
                            "vi-VN"
                          )
                        : "-"}
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
                          {request.attachments.length} files
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
                ))}
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
                <DialogTitle>Hồ sơ bảo hành - {selectedRequest.id}</DialogTitle>
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
                      {selectedRequest.model}
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm">
                      Người xử lý
                    </label>
                    <div className="mt-1 font-medium">
                      {selectedRequest.assignedTo}
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm">
                      Ngày hoàn tất
                    </label>
                    <div className="mt-1 font-medium">
                      {selectedRequest.completedDate
                        ? new Date(
                            selectedRequest.completedDate
                          ).toLocaleDateString("vi-VN")
                        : "-"}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Technical Report */}
                <div>
                  <h4 className="mb-3 font-semibold">📄 Báo cáo kỹ thuật</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="text-muted-foreground">
                        Mô tả sự cố
                      </label>
                      <p className="mt-1">{selectedRequest.issueDescription}</p>
                    </div>
                    <div>
                      <label className="text-muted-foreground">
                        Phụ tùng thay thế
                      </label>
                      <ul className="mt-1 space-y-1">
                        {selectedRequest.parts.map((part, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            {part}
                          </li>
                        ))}
                      </ul>
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

                {/* Manufacturer Notes */}
                <div>
                  <h4 className="mb-3 font-semibold">📝 Ghi chú hãng</h4>
                  <Card className="p-4 bg-muted">
                    <p className="text-sm">
                      {selectedRequest.manufacturerResponse ||
                        "Không có ghi chú từ hãng"}
                    </p>
                  </Card>
                </div>

                <Separator />

                {/* Edit Log */}
                <div>
                  <h4 className="mb-3 font-semibold">📋 Log chỉnh sửa</h4>
                  <div className="space-y-2">
                    {selectedRequest.responseHistory.map((log, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        <div className="flex-1 text-sm">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">{log.from}</span>
                            <span className="text-muted-foreground">
                              {new Date(log.date).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-1">
                            {log.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Attachments */}
                <div>
                  <h4 className="mb-3 font-semibold">📎 File đính kèm</h4>
                  {selectedRequest.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRequest.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium">{file.name}</div>
                              <div className="text-xs text-muted-foreground uppercase">
                                {file.type}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
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
