import { ClipboardList, Loader2, AlertCircle } from "lucide-react";
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
import { useGetCustomerById } from "@/hooks/ManageCustomersHooks/useGetCustomerById";
import { useHisGetByVehicleVin } from "@/hooks/ManageCustomersHooks/useHisGetByVehicleVin";

export default function ServiceHistory() {
  const {
    customer,
    vehicle,
    loading: loadingCustomer,
    error: customerError,
  } = useGetCustomerById();

  const {
    serviceHistory,
    loading: loadingHistory,
    error: historyError,
  } = useHisGetByVehicleVin(vehicle?.vin);

  const loading = loadingCustomer || loadingHistory;
  const error = customerError || historyError;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex items-center gap-3 py-6">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!customer || !vehicle) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          Không tìm thấy thông tin khách hàng hoặc xe
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md border border-border/60">
        <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Lịch sử dịch vụ & bảo hành
          </CardTitle>
          <Badge variant="outline" className="text-xs font-medium">
            {serviceHistory.length} dịch vụ
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* 🚗 Thông tin tổng quan xe */}
          <div className="bg-muted/40 p-5 rounded-xl border space-y-3 shadow-sm">
            <h4 className="text-base font-medium">Thông tin tổng quan xe</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Số VIN</p>
                <p className="font-medium font-mono">{vehicle.vin}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Model</p>
                <p className="font-medium">{vehicle.modelName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Khách hàng</p>
                <p className="font-medium">{customer.fullName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Biển số</p>
                <p className="font-medium">
                  {vehicle.licensePlate || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </div>

          {/* 📋 Bảng lịch sử dịch vụ */}
          <div>
            <h4 className="mb-4 text-base font-medium">Bảng lịch sử dịch vụ</h4>
            {serviceHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-xl bg-muted/20">
                Chưa có lịch sử dịch vụ
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Ngày dịch vụ</TableHead>
                        <TableHead>Loại dịch vụ</TableHead>
                        <TableHead>Trung tâm dịch vụ</TableHead>
                        <TableHead>Mã yêu cầu</TableHead>
                        <TableHead>Hạng mục</TableHead>
                        <TableHead>Phụ tùng thay thế</TableHead>
                        <TableHead>Serial phụ tùng</TableHead>
                        <TableHead>Kỹ thuật viên</TableHead>
                        <TableHead>VIN</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviceHistory.map((item) => (
                        <TableRow
                          key={item.serviceID}
                          className="hover:bg-muted/30"
                        >
                          <TableCell className="whitespace-nowrap">
                            {new Date(item.serviceDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.serviceType}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {item.serviceCenterName}
                          </TableCell>
                          <TableCell>{item.claimID || "N/A"}</TableCell>
                          <TableCell>{item.workItem}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {item.replacementPartName || "N/A"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {item.replacementPartSerial || "N/A"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {item.technicianName}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {item.vin}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
