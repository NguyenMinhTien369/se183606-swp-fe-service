import { useState } from "react";
import type { WarrantyClaimResponse } from "../types/warranty";
import { useNavigate } from "react-router";
import ROUTERS_PATH from "@/constants/routers";

// Hooks
import { useGetClaimsByServiceCenter } from "@/hooks/ManageWarranty/useGetClaimsByServiceCenter";

// Components
import StatusBadge from "@/components/StatusBadge";
import { WarrantyFilters } from "@/components/WarrantyFilters"; // Nhớ import component mới tạo
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

// Icons
import { Loader2, ChevronRight } from "lucide-react";
import { useAuth } from "@/pages/Login/feature/AuthContext";

export default function WarrantyList() {
  const { user } = useAuth();
  const serviceCenterID = user?.serviceCenterID || 1;
  const navigate = useNavigate();
  const handleRowClick = (claim: WarrantyClaimResponse) => {
    navigate(`${ROUTERS_PATH.MANAGE_WARRANTY}/${claim.claimID}`);
  };

  const [searchVin, setSearchVin] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { claims, isLoading: loading } =
    useGetClaimsByServiceCenter(serviceCenterID);

  // Logic lọc dữ liệu client-side
  const filteredClaims = claims.filter((claim) => {
    const matchesVin = searchVin
      ? claim.vin.toLowerCase().includes(searchVin.toLowerCase())
      : true;
    const matchesStatus =
      statusFilter === "all" ? true : claim.status === statusFilter;
    return matchesVin && matchesStatus;
  });

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Danh sách yêu cầu bảo hành</CardTitle>
        <CardDescription>
          Quản lý và theo dõi tất cả yêu cầu bảo hành
        </CardDescription>
      </CardHeader>

      <CardContent>
        <WarrantyFilters
          searchValue={searchVin}
          onSearchChange={setSearchVin}
          statusValue={statusFilter}
          onStatusChange={setStatusFilter}
        />

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
                    return (
                      <TableRow
                        key={claim.claimID}
                        onClick={() => handleRowClick(claim)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors group"
                      >
                        <TableCell className="font-mono font-medium text-primary">
                          #{claim.claimID}
                        </TableCell>
                        <TableCell className="font-mono">{claim.vin}</TableCell>
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
  );
}
