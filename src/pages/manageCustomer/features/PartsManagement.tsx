"use client";

import { useState } from "react";
import type { Customer, Part } from "../types/index";
import { Settings, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Screen21Props {
  customer: Customer;
  parts: Part[];
}

export function Screen21PartsManagement({ customer, parts }: Screen21Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  const handleSelectPart = (part: Part) => {
    setSelectedPart(part);
    setDialogOpen(true); // Mở dialog thay vì dùng toaster
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md border border-border/60">
        <CardHeader className="border-b pb-4 flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Quản lý phụ tùng trên xe
          </CardTitle>
          <Badge variant="outline" className="text-xs font-medium">
            {parts.length} phụ tùng
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 🚗 Thông tin tổng quan xe */}
          <div className="bg-muted/40 p-5 rounded-xl border space-y-3 shadow-sm">
            <h4 className="text-base font-medium">Thông tin tổng quan xe</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Số VIN</p>
                <p className="font-medium">{customer.vin}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Model</p>
                <p className="font-medium">{customer.model}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Khách hàng</p>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Biển số</p>
                <p className="font-medium">
                  {customer.licensePlate || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </div>

          {/* ⚙️ Danh sách phụ tùng */}
          <div className="space-y-3">
            <h4 className="font-medium text-base flex items-center gap-2">
              ⚙️ Danh sách phụ tùng
            </h4>
            <div className="border rounded-2xl overflow-hidden shadow-sm bg-card">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Tên phụ tùng</TableHead>
                    <TableHead>Số seri</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Ngày gắn</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {parts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-sm text-muted-foreground"
                      >
                        Không có phụ tùng nào được ghi nhận
                      </TableCell>
                    </TableRow>
                  ) : (
                    parts.map((part) => (
                      <TableRow
                        key={part.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>{part.name}</TableCell>
                        <TableCell>{part.serialNumber}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              part.type === "Chính" ? "default" : "secondary"
                            }
                          >
                            {part.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{part.installedDate}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleSelectPart(part)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Xem
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🪟 Dialog thay thế toaster */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết phụ tùng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về phụ tùng được chọn.
            </DialogDescription>
          </DialogHeader>

          {selectedPart && (
            <div className="space-y-3 mt-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-muted-foreground">Tên:</p>
                <p className="font-medium">{selectedPart.name}</p>
                <p className="text-muted-foreground">Số seri:</p>
                <p className="font-medium">{selectedPart.serialNumber}</p>
                <p className="text-muted-foreground">Loại:</p>
                <p>
                  <Badge
                    variant={
                      selectedPart.type === "Chính" ? "default" : "secondary"
                    }
                  >
                    {selectedPart.type}
                  </Badge>
                </p>
                <p className="text-muted-foreground">Ngày gắn:</p>
                <p className="font-medium">{selectedPart.installedDate}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
