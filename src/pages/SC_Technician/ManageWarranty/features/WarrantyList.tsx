import { useState, useEffect } from "react";
import type { WarrantyClaimResponse } from "../types/warranty";
import { warrantyClaimAPI } from "@/utility/index";
// Xóa import WarrantyDetailsDialog vì không dùng nữa

import StatusBadge from "@/components/StatusBadge";
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

import { Search, Loader2, ChevronRight } from "lucide-react";

import { useNavigate } from "react-router";
import ROUTERS_PATH from "@/constants/routers";

interface WarrantyListProps {
  serviceCenterID: number;
  onEdit?: (claim: WarrantyClaimResponse) => void;
}

export default function WarrantyList({
  serviceCenterID,
  onEdit,
}: WarrantyListProps) {
  const navigate = useNavigate();
  const handleRowClick = (claim: WarrantyClaimResponse) => {
    navigate(`${ROUTERS_PATH.MANAGE_WARRANTY}/${claim.claimID}`);
  };

  const [claims, setClaims] = useState<WarrantyClaimResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchVin, setSearchVin] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
      console.log("Loaded warranty claims:", sortedClaims);
    } catch (error) {
      console.error("Error loading claims:", error);
    } finally {
      setLoading(false);
    }
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
                      const editable = canEdit(claim.status);

                      return (
                        <TableRow
                          key={claim.claimID}
                          // --- 4. CẬP NHẬT SỰ KIỆN CLICK ---
                          onClick={() => handleRowClick(claim)}
                          className="cursor-pointer hover:bg-muted/50 transition-colors group"
                        >
                          <TableCell className="font-mono font-medium text-primary">
                            #{claim.claimID}
                          </TableCell>
                          <TableCell className="font-mono">
                            {claim.vin}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground">
                            {claim.description}
                          </TableCell>
                          <TableCell>
                            {new Date(claim.creationDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={claim.status} />
                          </TableCell>
                          <TableCell>{claim.serviceCenterName}</TableCell>

                          {/* Action buttons */}
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hidden group-hover:flex text-muted-foreground"
                                onClick={() => handleRowClick(claim)}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
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
    </>
  );
}
