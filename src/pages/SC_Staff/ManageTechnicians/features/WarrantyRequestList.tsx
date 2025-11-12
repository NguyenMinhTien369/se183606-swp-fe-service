import { useState, useEffect } from "react";
import { Filter, RefreshCw, Search } from "lucide-react";
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
import { warrantyClaimAPI } from "@/utility/index";

import type { WarrantyClaimResponse } from "../types";
import {
  getClaimStatusLabel,
  getClaimStatusColor,
} from "../lib/utils-warranty";

export default function WarrantyRequestList() {
  const [claims, setClaims] = useState<WarrantyClaimResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<WarrantyClaimResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Bộ lọc
  const [vinFilter, setVinFilter] = useState("");
  const [searchClaimId, setSearchClaimId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Hardcoded serviceCenterID - in production, get from auth context
  const SERVICE_CENTER_ID = 1;

  // Load all warranty claims on mount
  useEffect(() => {
    loadWarrantyClaims();
  }, []);

  const loadWarrantyClaims = async () => {
    try {
      setIsLoading(true);
      const response = await warrantyClaimAPI.getClaimsByServiceCenter(
        SERVICE_CENTER_ID
      );
      const claimsData = response.data.result || [];

      // ✅ Sắp xếp theo ngày tạo mới nhất lên đầu
      const sortedClaims = claimsData.sort(
        (a: WarrantyClaimResponse, b: WarrantyClaimResponse) => {
          const dateA = new Date(a.creationDate).getTime();
          const dateB = new Date(b.creationDate).getTime();
          return dateB - dateA; // Mới nhất trước (descending)
        }
      );

      setClaims(sortedClaims);
      console.log(
        "✅ Loaded warranty claims (sorted by newest):",
        sortedClaims
      );
    } catch (error: any) {
      console.error("❌ Error loading warranty claims:", error);
      console.log(
        error.response?.data?.message ||
          "Không thể tải danh sách yêu cầu bảo hành"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchById = async () => {
    if (!searchClaimId.trim()) {
      console.log("Vui lòng nhập mã yêu cầu bảo hành");
      return;
    }

    try {
      setIsLoading(true);
      const response = await warrantyClaimAPI.getClaimById(
        Number(searchClaimId)
      );
      const claimData = response.data.result;
      console.log("✅ Found claim by ID:", claimData);

      // Show in list (replace current claims with search result)
      setClaims([claimData]);
    } catch (error: any) {
      console.error("❌ Error searching claim:", error);
      console.log(
        error.response?.data?.message ||
          `Không tìm thấy yêu cầu bảo hành với ID: ${searchClaimId}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = (request: WarrantyClaimResponse) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  const handleRefresh = () => {
    setSearchClaimId("");
    setVinFilter("");
    setStatusFilter("all");
    loadWarrantyClaims();
  };

  const filteredRequests = claims
    .filter((req) => {
      if (vinFilter && !req.vin.toLowerCase().includes(vinFilter.toLowerCase()))
        return false;
      if (statusFilter !== "all" && req.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      // ✅ Sắp xếp theo ngày tạo mới nhất lên đầu
      const dateA = new Date(a.creationDate).getTime();
      const dateB = new Date(b.creationDate).getTime();
      return dateB - dateA; // Mới nhất trước
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
          onClick={handleRefresh}
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

      {/* Search by ID Section */}
      <Card className="p-5 border border-border shadow-sm">
        <CardHeader className="p-0 mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-base font-medium">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Nhập mã yêu cầu bảo hành (Claim ID)..."
                value={searchClaimId}
                onChange={(e) => setSearchClaimId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchById();
                  }
                }}
                disabled={isLoading}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Nháp">📝 Nháp</SelectItem>
                <SelectItem value="Chờ duyệt">🟡 Chờ duyệt</SelectItem>
                <SelectItem value="Được chấp nhận">
                  🟢 Được chấp nhận
                </SelectItem>
                <SelectItem value="Đang xử lý">🔵 Đang xử lý</SelectItem>
                <SelectItem value="Hoàn thành">✅ Hoàn thành</SelectItem>
                <SelectItem value="Từ chối">🔴 Từ chối</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setVinFilter("");
                setStatusFilter("all");
              }}
            >
              Xóa bộ lọc
            </Button>
            <Button onClick={handleSearchById} disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow
                    key={request.claimID}
                    onClick={() => handleViewDetail(request)}
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
                  </TableRow>
                ))
              )}
              {!isLoading && filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
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
