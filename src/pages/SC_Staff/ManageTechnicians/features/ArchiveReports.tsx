import { useState } from "react";
import { Search, Eye, CheckCircle2, AlertCircle } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useGetServiceHistoryByServiceCenter } from "@/hooks/ManageTechnicians/ArchiveReports/useGetServiceHistoryByServiceCenter";
import type { ServiceHistoryResponse } from "@/hooks/ManageTechnicians/ArchiveReports/useGetServiceHistoryByServiceCenter";

export default function ArchiveReports() {
  // Hardcoded serviceCenterID - in production, get from auth context
  const SERVICE_CENTER_ID = 1;

  const { histories, loading, error, reload } =
    useGetServiceHistoryByServiceCenter(SERVICE_CENTER_ID);

  const [searchVin, setSearchVin] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<ServiceHistoryResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewDetails = (request: ServiceHistoryResponse) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  const filteredRequests = histories.filter((req) => {
    if (searchVin && !req.vin.toLowerCase().includes(searchVin.toLowerCase()))
      return false;
    if (searchCode && !String(req.serviceID).includes(searchCode)) return false;
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
            disabled={loading}
          />
          <Button
            variant="outline"
            onClick={() => {
              setSearchVin("");
              setSearchCode("");
            }}
          >
            Tìm kiếm
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSearchVin("");
              setSearchCode("");
            }}
          >
            Xóa lọc
          </Button>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

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
                  <TableHead>Mã lịch sử</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Người xử lý</TableHead>
                  <TableHead>Ngày bảo hành</TableHead>
                  <TableHead>Loại dịch vụ</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        Đang tải dữ liệu...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        {histories.length === 0
                          ? "Chưa có lịch sử bảo hành nào"
                          : "Không tìm thấy hồ sơ nào phù hợp"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.serviceID}>
                      <TableCell>#{request.serviceID}</TableCell>
                      <TableCell>{request.vin}</TableCell>
                      <TableCell>
                        {request.technicianName ||
                          request.serviceCenterName ||
                          "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(request.serviceDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </TableCell>
                      <TableCell>{request.serviceType || "-"}</TableCell>
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

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl">
          {selectedRequest && (
            <ScrollArea className="max-h-[80vh] pr-2">
              <DialogHeader>
                <DialogTitle>
                  Hồ sơ bảo hành - #{selectedRequest.serviceID}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-muted-foreground text-sm">
                      Mã dịch vụ
                    </label>
                    <div className="mt-1 font-medium">
                      #{selectedRequest.serviceID}
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm">VIN</label>
                    <div className="mt-1 font-medium">
                      {selectedRequest.vin}
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm">
                      Trung tâm dịch vụ
                    </label>
                    <div className="mt-1 font-medium">
                      {selectedRequest.serviceCenterName || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm">
                      Ngày bảo hành
                    </label>
                    <div className="mt-1 font-medium">
                      {new Date(selectedRequest.serviceDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm">
                      Loại dịch vụ
                    </label>
                    <div className="mt-1 font-medium">
                      {selectedRequest.serviceType || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm">
                      Kỹ thuật viên
                    </label>
                    <div className="mt-1 font-medium">
                      {selectedRequest.technicianName || "-"}
                    </div>
                  </div>
                  {selectedRequest.claimID && (
                    <div>
                      <label className="text-muted-foreground text-sm">
                        Mã yêu cầu bảo hành
                      </label>
                      <div className="mt-1 font-medium">
                        #{selectedRequest.claimID}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Work Details */}
                <div>
                  <h4 className="mb-3 font-semibold">🔧 Chi tiết công việc</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="text-muted-foreground">
                        Hạng mục công việc
                      </label>
                      <p className="mt-1">{selectedRequest.workItem || "-"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Replacement Parts */}
                {(selectedRequest.replacementPartName ||
                  selectedRequest.replacementPartSerial) && (
                  <>
                    <div>
                      <h4 className="mb-3 font-semibold">
                        🔩 Phụ tùng thay thế
                      </h4>
                      <div className="space-y-3 text-sm">
                        {selectedRequest.replacementPartName && (
                          <div>
                            <label className="text-muted-foreground">
                              Tên phụ tùng
                            </label>
                            <p className="mt-1">
                              {selectedRequest.replacementPartName}
                            </p>
                          </div>
                        )}
                        {selectedRequest.replacementPartSerial && (
                          <div>
                            <label className="text-muted-foreground">
                              Số serial
                            </label>
                            <p className="mt-1">
                              {selectedRequest.replacementPartSerial}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
