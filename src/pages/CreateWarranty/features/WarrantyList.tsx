"use client";

import { useState } from "react";
import type { WarrantyClaimResponse } from "../types/warranty";

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

import { Edit, Search, Trash2 } from "lucide-react";

interface WarrantyListProps {
  claims: WarrantyClaimResponse[];
  onEdit: (claim: WarrantyClaimResponse) => void;
  onDelete: (claimId: number) => void;
  onViewDetails: (claim: WarrantyClaimResponse) => void;
}

export function WarrantyList({
  claims,
  onEdit,
  onDelete,
  onViewDetails,
}: WarrantyListProps) {
  const [searchVin, setSearchVin] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      {
        label: string;
        color: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      PENDING: {
        label: "🟡 Chờ duyệt",
        color: "bg-yellow-100 text-yellow-800",
        variant: "outline",
      },
      APPROVED: {
        label: "🟢 Được chấp nhận",
        color: "bg-green-100 text-green-800",
        variant: "default",
      },
      IN_PROGRESS: {
        label: "🔵 Đang xử lý",
        color: "bg-blue-100 text-blue-800",
        variant: "secondary",
      },
      COMPLETED: {
        label: "✅ Đã hoàn thành",
        color: "bg-green-100 text-green-800",
        variant: "default",
      },
      REJECTED: {
        label: "🔴 Từ chối",
        color: "bg-red-100 text-red-800",
        variant: "destructive",
      },
    };
    return configs[status] || configs.PENDING;
  };

  const filteredClaims = claims.filter((claim) => {
    const matchesVin = searchVin
      ? claim.vin.toLowerCase().includes(searchVin.toLowerCase())
      : true;
    const matchesStatus =
      statusFilter === "all" ? true : claim.status === statusFilter;
    return matchesVin && matchesStatus;
  });

  const canEdit = (status: string) => status === "PENDING";

  return (
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
              <SelectItem value="PENDING">Chờ duyệt</SelectItem>
              <SelectItem value="APPROVED">Được chấp nhận</SelectItem>
              <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
              <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
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
                      onClick={() => onViewDetails(claim)}
                    >
                      <TableCell className="font-mono">
                        #{claim.claimID}
                      </TableCell>
                      <TableCell className="font-mono">{claim.vin}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {claim.description}
                      </TableCell>
                      <TableCell>
                        {new Date(claim.creationDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`${statusConfig.color} px-2 py-1 rounded-md text-sm`}
                        >
                          {statusConfig.label}
                        </span>
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
                                  onClick={() => onEdit(claim)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              {!editable && (
                                <TooltipContent>
                                  <p>
                                    Không thể chỉnh sửa – yêu cầu đã được xử lý
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
                                  onClick={() => onDelete(claim.claimID)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              {!editable && (
                                <TooltipContent>
                                  <p>Không thể xóa – yêu cầu đã được xử lý</p>
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
        </div>
      </CardContent>
    </Card>
  );
}
