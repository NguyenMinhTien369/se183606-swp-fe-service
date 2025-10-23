"use client";

import type { Vehicle, Part, WarrantyHistory } from "../types/warranty";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VehicleDetailsProps {
  vehicle: Vehicle;
  parts: Part[];
  warrantyHistory: WarrantyHistory[];
  onCreateWarranty: () => void;
}

export function VehicleDetails({
  vehicle,
  parts,
  warrantyHistory,
  onCreateWarranty,
}: VehicleDetailsProps) {
  // --- Hiển thị trạng thái phụ tùng ---
  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      active: "default",
      replaced: "secondary",
      warranty: "outline",
    };

    const labelMap: Record<string, string> = {
      active: "Hoạt động",
      replaced: "Đã thay",
      warranty: "Bảo hành",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labelMap[status] || status}
      </Badge>
    );
  };

  // --- Hiển thị trạng thái bảo hành ---
  const getWarrantyStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      pending: { label: "🟡 Chờ duyệt", color: "text-yellow-600" },
      approved: { label: "🟢 Được chấp nhận", color: "text-green-600" },
      completed: { label: "🔵 Đã xử lý", color: "text-blue-600" },
      rejected: { label: "🔴 Từ chối", color: "text-red-600" },
    };

    const { label, color } = config[status] || config.pending;
    return <span className={color}>{label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* --- Thông tin xe --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{vehicle.model}</CardTitle>
              <CardDescription>VIN: {vehicle.vin}</CardDescription>
            </div>
            <Button onClick={onCreateWarranty}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo yêu cầu bảo hành
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Năm sản xuất</p>
              <p className="font-medium">{vehicle.year}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày bán</p>
              <p className="font-medium">
                {new Date(vehicle.saleDate).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Khách hàng</p>
              <p className="font-medium">{vehicle.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đại lý</p>
              <p className="font-medium">{vehicle.dealer}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- Danh sách phụ tùng --- */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phụ tùng trên xe</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="parts-list">
            <AccordionItem value="parts-list">
              <AccordionTrigger>
                Xem danh sách phụ tùng ({parts.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã phụ tùng</TableHead>
                        <TableHead>Tên</TableHead>
                        <TableHead>Ngày gắn</TableHead>
                        <TableHead>Tình trạng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parts.map((part) => (
                        <TableRow key={part.id}>
                          <TableCell>{part.partCode}</TableCell>
                          <TableCell>{part.partName}</TableCell>
                          <TableCell>
                            {new Date(part.installDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(part.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* --- Lịch sử bảo hành --- */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử bảo hành</CardTitle>
        </CardHeader>
        <CardContent>
          {warrantyHistory.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              Chưa có lịch sử bảo hành
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã yêu cầu</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Phụ tùng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Người xử lý</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warrantyHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>{history.requestCode}</TableCell>
                      <TableCell>
                        {new Date(history.createdDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </TableCell>
                      <TableCell>{history.parts.join(", ")}</TableCell>
                      <TableCell>
                        {getWarrantyStatusBadge(history.status)}
                      </TableCell>
                      <TableCell>{history.handler}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
