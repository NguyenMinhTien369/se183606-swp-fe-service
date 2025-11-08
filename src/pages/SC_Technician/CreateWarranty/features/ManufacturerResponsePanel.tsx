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
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, FileCheck } from "lucide-react";

interface ManufacturerResponsePanelProps {
  claims: WarrantyClaimResponse[];
  onViewDetails: (claim: WarrantyClaimResponse) => void;
}

export function ManufacturerResponsePanel({
  claims,
  onViewDetails,
}: ManufacturerResponsePanelProps) {
  // Filter claims that have been processed (Được chấp nhận, Bị từ chối, or Hoàn thành)
  const claimsWithResponse = claims.filter((c) =>
    ["Được chấp nhận", "Bị từ chối", "Hoàn thành"].includes(c.status)
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Được chấp nhận":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Bị từ chối":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "Hoàn thành":
        return <FileCheck className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      APPROVED: {
        label: "Đã chấp nhận",
        className: "bg-green-100 text-green-800",
      },
      REJECTED: { label: "Đã từ chối", className: "bg-red-100 text-red-800" },
      COMPLETED: {
        label: "Đã hoàn thành",
        className: "bg-blue-100 text-blue-800",
      },
    };
    const { label, className } = config[status] || {
      label: status,
      className: "",
    };
    return (
      <Badge variant="secondary" className={`text-sm font-medium ${className}`}>
        {label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phản hồi từ hệ thống</CardTitle>
        <CardDescription>
          Các yêu cầu đã được xử lý ({claimsWithResponse.length} yêu cầu)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {claimsWithResponse.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mb-4 opacity-50" />
            <p>Chưa có yêu cầu nào được xử lý</p>
            <p className="text-sm mt-2">
              Các yêu cầu đã được chấp nhận/từ chối/hoàn thành sẽ hiển thị ở đây
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Claim ID</TableHead>
                  <TableHead className="w-[140px]">VIN</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="w-[140px]">Trạng thái</TableHead>
                  <TableHead className="w-[160px]">Kết quả</TableHead>
                  <TableHead className="w-[120px]">Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claimsWithResponse.map((claim) => (
                  <TableRow
                    key={claim.claimID}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onViewDetails(claim)}
                  >
                    <TableCell className="font-mono font-medium">
                      #{claim.claimID}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {claim.vin}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {claim.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(claim.status)}
                        {getStatusBadge(claim.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {claim.result ? (
                        <div className="max-w-md truncate text-sm">
                          {claim.result}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Chưa có kết quả
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(claim.creationDate).toLocaleDateString("vi-VN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
