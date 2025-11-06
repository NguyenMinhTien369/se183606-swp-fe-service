"use client";

import { useState } from "react";
import { Eye, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { WarrantyClaimResponse } from "../types";
import {
  getClaimStatusLabel,
  getClaimStatusColor,
} from "../lib/utils-warranty";

interface WarrantyRequestsListProps {
  claims: WarrantyClaimResponse[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function WarrantyRequestsList({
  claims,
  isLoading,
  onRefresh,
}: WarrantyRequestsListProps) {
  const [selectedRequest, setSelectedRequest] =
    useState<WarrantyClaimResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Bộ lọc
  const [vinFilter, setVinFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleViewDetail = (request: WarrantyClaimResponse) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  const filteredRequests = claims.filter((req) => {
    if (vinFilter && !req.vin.toLowerCase().includes(vinFilter.toLowerCase()))
      return false;
    if (codeFilter && !String(req.claimID).includes(codeFilter)) return false;
    if (statusFilter !== "all" && req.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Danh sách yêu cầu bảo hành
          </h2>
          <p className="text-muted-foreground">
            Xem toàn bộ yêu cầu bảo hành từ trung tâm dịch vụ
          </p>
        </div>
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>
      </div>

      {/* Filter Section */}
      <Card className="p-5 border border-border shadow-sm">
        <CardHeader className="p-0 mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-base font-medium">Bộ lọc</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-0">
          <Input
            placeholder="VIN"
            value={vinFilter}
            onChange={(e) => setVinFilter(e.target.value)}
          />
          <Input
            placeholder="Mã yêu cầu"
            value={codeFilter}
            onChange={(e) => setCodeFilter(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Nháp">📝 Nháp</SelectItem>
              <SelectItem value="Chờ duyệt">🟡 Chờ duyệt</SelectItem>
              <SelectItem value="Được chấp thuận">
                🟢 Được chấp thuận
              </SelectItem>
              <SelectItem value="Đang xử lý">🔵 Đang xử lý</SelectItem>
              <SelectItem value="Hoàn thành">✅ Hoàn thành</SelectItem>
              <SelectItem value="Bị từ chối">🔴 Bị từ chối</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setVinFilter("");
              setCodeFilter("");
              setStatusFilter("all");
            }}
          >
            Xóa bộ lọc
          </Button>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="shadow-sm border border-border">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã yêu cầu</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead>Trung tâm</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Kết quả</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow
                    key={request.claimID}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>#{request.claimID}</TableCell>
                    <TableCell>{request.vin}</TableCell>
                    <TableCell>{request.serviceCenterName || "-"}</TableCell>
                    <TableCell>
                      {new Date(request.creationDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getClaimStatusColor(request.status)}>
                        {getClaimStatusLabel(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {request.result || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(request)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!isLoading && filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">
                      Không tìm thấy yêu cầu nào phù hợp.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-[95vw] sm:w-[600px] p-6">
          {selectedRequest && (
            <ScrollArea className="h-full pr-2">
              <SheetHeader>
                <SheetTitle className="text-lg font-semibold">
                  Chi tiết yêu cầu #{selectedRequest.claimID}
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Vehicle Info */}
                <section>
                  <h4 className="font-medium mb-3">Thông tin xe</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VIN:</span>
                      <span>{selectedRequest.vin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model:</span>
                      <span>{selectedRequest.modelName || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Khách hàng:</span>
                      <span>{selectedRequest.customerName || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Điện thoại:</span>
                      <span>{selectedRequest.customerPhone || "-"}</span>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Service Center */}
                <section>
                  <h4 className="font-medium mb-3">Trung tâm dịch vụ</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tên:</span>
                      <span>{selectedRequest.serviceCenterName || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Điện thoại:</span>
                      <span>{selectedRequest.serviceCenterPhone || "-"}</span>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Affected Parts */}
                <section>
                  <h4 className="font-medium mb-3">Phụ tùng bị ảnh hưởng</h4>
                  {selectedRequest.affectedParts &&
                  selectedRequest.affectedParts.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {selectedRequest.affectedParts.map((part, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 p-2 bg-muted/30 rounded"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                          <div className="flex-1">
                            <div className="font-medium">
                              {part.partTypeName}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              SN: {part.partSerialNumber}
                            </div>
                            {part.description && (
                              <div className="text-muted-foreground mt-1">
                                {part.description}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Chưa có thông tin
                    </p>
                  )}
                </section>

                <Separator />

                {/* Attachments */}
                <section>
                  <h4 className="font-medium mb-3">File đính kèm</h4>
                  {selectedRequest.attachments &&
                  selectedRequest.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRequest.attachments.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1 truncate">
                            <div className="text-sm font-medium truncate">
                              {file.fileName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {file.fileType}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(file.fileUrl, "_blank")}
                          >
                            Xem
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Không có file đính kèm
                    </p>
                  )}
                </section>

                <Separator />

                {/* Status & Result */}
                <section>
                  <h4 className="font-medium mb-3">Trạng thái & Kết quả</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Trạng thái hiện tại
                      </label>
                      <div className="mt-1">
                        <Badge
                          className={getClaimStatusColor(
                            selectedRequest.status
                          )}
                        >
                          {getClaimStatusLabel(selectedRequest.status)}
                        </Badge>
                      </div>
                    </div>
                    {selectedRequest.result && (
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Kết quả xử lý
                        </label>
                        <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                          {selectedRequest.result}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-muted-foreground">
                          Ngày tạo
                        </label>
                        <div className="mt-1 font-medium">
                          {new Date(
                            selectedRequest.creationDate
                          ).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
