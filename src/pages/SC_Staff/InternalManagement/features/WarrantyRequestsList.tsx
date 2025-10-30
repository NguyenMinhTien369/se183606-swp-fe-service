"use client";

import { useState } from "react";
import { Eye, Filter } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../../components/ui/sheet";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";
import { ScrollArea } from "../../../../components/ui/scroll-area";

import { mockWarrantyRequests } from "../lib/mock-data";
import {
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
} from "../lib/utils-warranty";
import type { WarrantyRequest } from "../types/warranty";

export function WarrantyRequestsList() {
  const [requests, _setRequests] = useState(mockWarrantyRequests);
  const [selectedRequest, setSelectedRequest] =
    useState<WarrantyRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Bộ lọc
  const [vinFilter, setVinFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [technicianFilter, setTechnicianFilter] = useState("all");

  const handleViewDetail = (request: WarrantyRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  const filteredRequests = requests.filter((req) => {
    if (vinFilter && !req.vin.toLowerCase().includes(vinFilter.toLowerCase()))
      return false;
    if (codeFilter && !req.id.toLowerCase().includes(codeFilter.toLowerCase()))
      return false;
    if (statusFilter !== "all" && req.status !== statusFilter) return false;
    if (technicianFilter !== "all" && req.technicianName !== technicianFilter)
      return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          Danh sách yêu cầu bảo hành
        </h2>
        <p className="text-muted-foreground">
          Xem toàn bộ yêu cầu do kỹ thuật viên tạo
        </p>
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
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="assigned">Đã phân công</SelectItem>
              <SelectItem value="receiving_parts">Nhận phụ tùng</SelectItem>
              <SelectItem value="in_progress">Đang thay thế</SelectItem>
              <SelectItem value="completed">Hoàn tất</SelectItem>
            </SelectContent>
          </Select>
          <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Kỹ thuật viên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả kỹ thuật viên</SelectItem>
              <SelectItem value="Nguyễn Văn A">Nguyễn Văn A</SelectItem>
              <SelectItem value="Trần Thị B">Trần Thị B</SelectItem>
              <SelectItem value="Lê Văn C">Lê Văn C</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setVinFilter("");
              setCodeFilter("");
              setStatusFilter("all");
              setTechnicianFilter("all");
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
                <TableHead>Kỹ thuật viên</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Phản hồi hãng</TableHead>
                <TableHead>Ưu tiên</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow
                  key={request.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{request.vin}</TableCell>
                  <TableCell>{request.technicianName}</TableCell>
                  <TableCell>
                    {new Date(request.createdDate).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.manufacturerResponse || "-"}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(request.priority)}>
                      {getPriorityLabel(request.priority)}
                    </Badge>
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
              ))}
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
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
                  Chi tiết yêu cầu #{selectedRequest.id}
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
                      <span>{selectedRequest.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Năm SX:</span>
                      <span>{selectedRequest.yearOfManufacture}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày bán:</span>
                      <span>
                        {new Date(selectedRequest.saleDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Issue */}
                <section>
                  <h4 className="font-medium mb-3">Mô tả sự cố</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {selectedRequest.issueDescription}
                  </p>
                </section>

                <Separator />

                {/* Parts */}
                <section>
                  <h4 className="font-medium mb-3">Phụ tùng liên quan</h4>
                  <ul className="space-y-2 text-sm">
                    {selectedRequest.parts.map((part, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>{part}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <Separator />

                {/* Attachments */}
                <section>
                  <h4 className="font-medium mb-3">File đính kèm</h4>
                  {selectedRequest.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRequest.attachments.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <span className="truncate text-sm">{file.name}</span>
                          <Button variant="ghost" size="sm">
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

                {/* Response History */}
                <section>
                  <h4 className="font-medium mb-3">Lịch sử phản hồi hãng</h4>
                  <div className="space-y-3">
                    {selectedRequest.responseHistory.map((r, i) => (
                      <div
                        key={i}
                        className="border-l-2 border-primary pl-4 py-2 bg-muted/20 rounded-md"
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{r.from}</span>
                          <span className="text-muted-foreground text-xs">
                            {new Date(r.date).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-snug">
                          {r.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <Separator />

                {/* Priority */}
                <section>
                  <h4 className="font-medium mb-3">Mức độ ưu tiên</h4>
                  <Select value={selectedRequest.priority}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Cao</SelectItem>
                      <SelectItem value="medium">Bình thường</SelectItem>
                      <SelectItem value="low">Thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </section>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
