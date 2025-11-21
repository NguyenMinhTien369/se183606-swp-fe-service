import { useState, useEffect } from "react";
import type { WarrantyClaimResponse } from "../types/warranty";
import { warrantyClaimAPI } from "@/utility/index";
import WarrantyDetailsDialog from "./WarrantyDetailsDialog";
// Thêm các icon này vào dòng import ở đầu file
import {
  Clock, // Icon cho Chờ duyệt
  CheckCircle2, // Icon cho Đã duyệt (dùng CheckCircle2 đẹp hơn)
  XCircle, // Icon cho Từ chối
  Truck, // Icon cho Đang giao hàng
  FileText, // Icon cho Nháp
  RefreshCw, // Icon cho Đang xử lý
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Edit, Search, Trash2, Loader2 } from "lucide-react";
import SuccessDelete from "../AlertComponents/SuccessDelete";

interface WarrantyListProps {
  serviceCenterID: number;
  onEdit?: (claim: WarrantyClaimResponse) => void;
}

export default function WarrantyList({
  serviceCenterID,
  onEdit,
}: WarrantyListProps) {
  const [claims, setClaims] = useState<WarrantyClaimResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchVin, setSearchVin] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedClaim, setSelectedClaim] =
    useState<WarrantyClaimResponse | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState<number | null>(null);

  // Load claims on mount and when serviceCenterID changes
  useEffect(() => {
    loadClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceCenterID]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const response = await warrantyClaimAPI.getClaimsByServiceCenter(
        serviceCenterID
      );
      const claimsData = response.data.result || [];

      const sortedClaims = claimsData.sort(
        (a: WarrantyClaimResponse, b: WarrantyClaimResponse) => {
          return b.claimID - a.claimID; // ID giảm dần
        }
      );

      setClaims(sortedClaims);
      console.log("Loaded warranty claims (sorted by newest):", sortedClaims);
    } catch (error) {
      console.error("Error loading claims:", error);
      console.log("Không thể tải danh sách yêu cầu bảo hành");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (claim: WarrantyClaimResponse) => {
    setSelectedClaim(claim);
    setShowDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsDialog(false);
    setSelectedClaim(null);
  };

  const handleEdit = (claim: WarrantyClaimResponse) => {
    if (onEdit) {
      onEdit(claim);
    }
  };

  const handleDeleteClick = (claimID: number) => {
    setClaimToDelete(claimID);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!claimToDelete) return;

    try {
      await warrantyClaimAPI.deleteClaim(claimToDelete);
      loadClaims(); // Reload list
    } catch (error) {
      console.error("Error deleting claim:", error);
      console.log("Không thể xóa yêu cầu bảo hành");
    } finally {
      setDeleteDialogOpen(false);
      setClaimToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setClaimToDelete(null);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      {
        label: string; // Tên hiển thị
        className: string; // Class màu sắc (bg + text)
        icon: any; // Component Icon
      }
    > = {
      Nháp: {
        label: "Bản nháp",
        className: "bg-gray-100 text-gray-600 hover:bg-gray-200",
        icon: FileText,
      },
      "Chờ duyệt": {
        label: "Chờ duyệt",
        className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200", // Vàng cam
        icon: Clock,
      },
      "Được chấp nhận": {
        label: "Đã duyệt", // Đổi text hiển thị cho giống hình
        className: "bg-green-100 text-green-700 hover:bg-green-200", // Xanh lá
        icon: CheckCircle2,
      },
      "Đang giao phụ tùng": {
        label: "Đang giao hàng", // Đổi text cho giống hình
        className: "bg-purple-100 text-purple-700 hover:bg-purple-200", // Tím
        icon: Truck,
      },
      "Đang xử lý": {
        label: "Đang xử lý",
        className: "bg-blue-100 text-blue-700 hover:bg-blue-200", // Xanh dương
        icon: RefreshCw,
      },
      "Hoàn thành": {
        label: "Hoàn thành",
        className: "bg-green-100 text-green-700 hover:bg-green-200",
        icon: CheckCircle2,
      },
      "Từ chối": {
        label: "Từ chối",
        className: "bg-red-100 text-red-700 hover:bg-red-200", // Đỏ
        icon: XCircle,
      },
    };

    // Mặc định nếu không tìm thấy status
    return configs[status] || configs["Chờ duyệt"];
  };

  const filteredClaims = claims.filter((claim) => {
    const matchesVin = searchVin
      ? claim.vin.toLowerCase().includes(searchVin.toLowerCase())
      : true;
    const matchesStatus =
      statusFilter === "all" ? true : claim.status === statusFilter;
    return matchesVin && matchesStatus;
  });

  // chỉ cho phép edit "Chờ duyệt" hoặc "Nháp"
  const canEdit = (status: string) =>
    status === "Chờ duyệt" || status === "Nháp";

  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Danh sách yêu cầu bảo hành</CardTitle>
          <CardDescription>
            Quản lý và theo dõi tất cả yêu cầu bảo hành
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo VIN..."
                value={searchVin}
                onChange={(e) => setSearchVin(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Nháp">Nháp</SelectItem>
                <SelectItem value="Chờ duyệt">Chờ duyệt</SelectItem>
                <SelectItem value="Được chấp nhận">Được chấp nhận</SelectItem>
                <SelectItem value="Đang giao phụ tùng">
                  Đang giao phụ tùng
                </SelectItem>
                <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                <SelectItem value="Từ chối">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Service Center</TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredClaims.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Không tìm thấy yêu cầu bảo hành nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClaims.map((claim) => {
                      const statusConfig = getStatusConfig(claim.status);
                      const editable = canEdit(claim.status);

                      return (
                        <TableRow
                          key={claim.claimID}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleViewDetails(claim)}
                        >
                          <TableCell className="font-mono">
                            #{claim.claimID}
                          </TableCell>
                          <TableCell className="font-mono">
                            {claim.vin}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {claim.description}
                          </TableCell>
                          <TableCell>
                            {new Date(claim.creationDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span
                                className={`
            flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border border-transparent transition-colors
            ${statusConfig.className}
          `}
                              >
                                {/* Render Icon với kích thước nhỏ */}
                                <statusConfig.icon className="w-3.5 h-3.5" />

                                {/* Text trạng thái */}
                                {statusConfig.label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{claim.serviceCenterName}</TableCell>

                          {/* Action buttons */}
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={!editable}
                                      onClick={() => handleEdit(claim)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  {!editable && (
                                    <TooltipContent>
                                      <p>
                                        Không thể chỉnh sửa – yêu cầu đã được xử
                                        lý
                                      </p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={!editable}
                                      onClick={() =>
                                        handleDeleteClick(claim.claimID)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  {!editable && (
                                    <TooltipContent>
                                      <p>
                                        Không thể xóa – yêu cầu đã được xử lý
                                      </p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warranty Details Dialog */}
      <WarrantyDetailsDialog
        claim={selectedClaim}
        open={showDetailsDialog}
        onClose={handleCloseDetails}
      />

      <SuccessDelete
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
