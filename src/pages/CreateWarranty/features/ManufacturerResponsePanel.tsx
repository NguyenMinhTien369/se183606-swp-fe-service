import type { WarrantyClaim } from "../types/warranty";
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
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface ManufacturerResponsePanelProps {
  claims: WarrantyClaim[];
  onViewDetails: (claim: WarrantyClaim) => void;
}

export function ManufacturerResponsePanel({
  claims,
  onViewDetails,
}: ManufacturerResponsePanelProps) {
  const claimsWithResponse = claims.filter((c) => c.manufacturerResponse);

  const getResultIcon = (result: "approved" | "rejected") => {
    return result === "approved" ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getResultBadge = (result: "approved" | "rejected") => {
    return (
      <Badge
        variant="secondary"
        className={`text-sm font-medium ${
          result === "approved" ? "bg-green-100 text-green-800" : ""
        }`}
      >
        {result === "approved" ? "Phê duyệt" : "Từ chối"}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phản hồi từ hãng</CardTitle>
        <CardDescription>
          Kết quả xử lý từ hệ thống hãng ({claimsWithResponse.length} phản hồi)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {claimsWithResponse.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mb-4" />
            <p>Chưa có phản hồi nào từ hãng</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Mã yêu cầu</TableHead>
                  <TableHead>Kết quả</TableHead>
                  <TableHead>Ghi chú từ hãng</TableHead>
                  <TableHead>Phụ tùng thay thế</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claimsWithResponse.map((claim) => (
                  <TableRow
                    key={claim.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onViewDetails(claim)}
                  >
                    <TableCell className="font-medium">
                      {claim.requestCode}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getResultIcon(claim.manufacturerResponse!.result)}
                        {getResultBadge(claim.manufacturerResponse!.result)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {claim.manufacturerResponse!.notes}
                    </TableCell>
                    <TableCell>
                      {claim.manufacturerResponse!.replacementParts &&
                      claim.manufacturerResponse!.replacementParts.length >
                        0 ? (
                        <div className="flex flex-wrap gap-1">
                          {claim.manufacturerResponse!.replacementParts.map(
                            (part, idx) => (
                              <Badge key={idx} variant="secondary">
                                {part}
                              </Badge>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(
                        claim.manufacturerResponse!.updateDate
                      ).toLocaleDateString("vi-VN")}
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
