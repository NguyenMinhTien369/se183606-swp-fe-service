"use client";

import { useState, useEffect } from "react";
import type { Customer, ServiceHistory } from "../types/index";
import { Save, ClipboardList, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Textarea } from "../../../../components/ui/textarea";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { serviceHistoryAPI } from "../../../../utility/index";

export function Screen22ServiceHistory({ customer }: { customer: Customer }) {
  const [notes, setNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState<"success" | "error">("success");
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const maxChars = 500;

  // Load service history khi component mount hoặc customer thay đổi
  useEffect(() => {
    if (customer?.vin) {
      loadServiceHistory();
    }
  }, [customer]);

  const loadServiceHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await serviceHistoryAPI.getByVehicleVin(customer.vin);
      const historyData = response.data.result || [];

      // Map backend data to frontend ServiceHistory interface
      const mappedHistory: ServiceHistory[] = historyData.map((item: any) => ({
        id: item.serviceHistoryID?.toString() || "",
        date: item.serviceDate || "",
        serviceType: item.serviceType || "",
        category: item.description || "",
        partReplaced: item.partReplaced || "N/A",
        serialNumber: item.partSerialNumber || "N/A",
        technician: item.technicianName || "Unknown",
      }));

      setServiceHistory(mappedHistory);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải lịch sử dịch vụ");
      console.error("Error loading service history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = () => {
    if (notes.length > maxChars) {
      setDialogMessage("❌ Ghi chú vượt quá 500 ký tự!");
      setDialogType("error");
      setDialogOpen(true);
      return;
    }
    // TODO: Implement API call to save notes
    setDialogMessage("✅ Đã lưu ghi chú thành công!");
    setDialogType("success");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <Card className="border border-border/60 shadow-md rounded-2xl">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <ClipboardList className="h-5 w-5 text-primary" />
            Lịch sử dịch vụ & bảo hành
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* 🚗 Thông tin xe */}
          <div className="bg-muted p-4 rounded-xl border border-border/40 shadow-sm space-y-2">
            <h4 className="font-medium text-base">Thông tin đầu xe</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">VIN</p>
                <p className="font-medium">{customer.vin}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Model</p>
                <p className="font-medium">{customer.model}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tên khách hàng</p>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Biển số</p>
                <p className="font-medium">
                  {customer.licensePlate || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 📋 Bảng lịch sử dịch vụ */}
          <div className="pt-2">
            <h4 className="mb-3 text-base font-medium">Bảng lịch sử</h4>
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Ngày thực hiện</TableHead>
                    <TableHead>Loại dịch vụ</TableHead>
                    <TableHead>Hạng mục</TableHead>
                    <TableHead>Phụ tùng thay thế</TableHead>
                    <TableHead>Số Serial</TableHead>
                    <TableHead>Kỹ thuật viên</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                        Đang tải lịch sử...
                      </TableCell>
                    </TableRow>
                  ) : serviceHistory.length > 0 ? (
                    serviceHistory.map((service) => (
                      <TableRow key={service.id} className="hover:bg-muted/30">
                        <TableCell>{service.date}</TableCell>
                        <TableCell>{service.serviceType}</TableCell>
                        <TableCell>{service.category}</TableCell>
                        <TableCell>{service.partReplaced}</TableCell>
                        <TableCell>{service.serialNumber}</TableCell>
                        <TableCell>{service.technician}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        Không có lịch sử dịch vụ nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 📝 Ghi chú nội bộ */}
          <div className="space-y-3 pt-6 border-t">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-medium">Ghi chú nội bộ</h4>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveNotes}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Lưu ghi chú
              </Button>
            </div>

            <Textarea
              placeholder="Nhập ghi chú nội bộ cho hồ sơ xe..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="resize-none border-border/60 shadow-sm focus-visible:ring-primary"
            />
            <p
              className={`text-xs ${notes.length > maxChars
                  ? "text-destructive font-medium"
                  : "text-muted-foreground"
                }`}
            >
              {notes.length}/{maxChars} ký tự
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 🪟 Dialog thay thế toaster */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "success" ? "✅ Thành công" : "⚠️ Lỗi ghi chú"}
            </DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-5">
            <Button variant="default" onClick={() => setDialogOpen(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
