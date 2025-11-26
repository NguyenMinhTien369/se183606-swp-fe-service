import { useMemo } from "react";
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
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, Loader2 } from "lucide-react";

import { useAuth } from "@/pages/Login/feature/AuthContext";
import { useGetClaimsByServiceCenter } from "@/hooks/ManageWarranty/useGetClaimsByServiceCenter";

export default function ManufacturerResponsePanel() {
  const { user, loading: authLoading } = useAuth();

  const {
    claims,
    isLoading: isClaimsLoading,
    refresh,
  } = useGetClaimsByServiceCenter(user?.serviceCenterID);

  const processedClaims = useMemo(() => {
    return claims.filter((c) =>
      ["Được chấp nhận", "Từ chối", "Hoàn thành"].includes(c.status)
    );
  }, [claims]);

  const isLoading = authLoading || isClaimsLoading;

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Phản hồi từ hệ thống</CardTitle>
            <CardDescription>
              Các yêu cầu đã được xử lý ({processedClaims.length} yêu cầu)
            </CardDescription>
          </div>
          <Button
            onClick={refresh}
            disabled={isLoading || !user?.serviceCenterID}
            variant="outline"
            size="sm"
            className="transition-all"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && claims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-12 w-12 mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : processedClaims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mb-4 opacity-50" />
            <p>Chưa có yêu cầu nào được xử lý</p>
            <p className="text-sm mt-2">
              Các yêu cầu đã được chấp nhận, từ chối hoặc hoàn thành sẽ hiển thị
              tại đây.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Claim ID</TableHead>
                  <TableHead className="w-[140px]">VIN</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="w-[180px]">Trạng thái</TableHead>
                  <TableHead className="w-[200px]">Kết quả</TableHead>
                  <TableHead className="w-[120px] text-right">
                    Ngày tạo
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedClaims.map((claim) => (
                  <TableRow
                    key={claim.claimID}
                    className="group hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-mono font-medium">
                      #{claim.claimID}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {claim.vin}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate" title={claim.description}>
                        {claim.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={claim.status} />
                    </TableCell>
                    <TableCell>
                      {claim.result ? (
                        <div className="text-sm" title={claim.result}>
                          {claim.result}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">
                          Chưa có thông tin
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
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
