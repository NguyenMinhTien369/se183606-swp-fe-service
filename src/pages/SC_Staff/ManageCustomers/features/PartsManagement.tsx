import { useState, useEffect } from "react";
import type {
  CustomerResponse,
  VehicleResponse,
  InstalledPart,
} from "../types/index";
import { Settings, Loader2, AlertCircle } from "lucide-react";

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

import { installedPartAPI, customerAPI } from "@/utility/index";
import { useParams } from "react-router";

export default function PartsManagement() {
  const { customerId } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null);
  const [parts, setParts] = useState<InstalledPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch customer data
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) {
        setError("Không tìm thấy ID khách hàng");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        console.log(
          "🔍 [PartsManagement] Fetching customer with ID:",
          customerId
        );
        const response = await customerAPI.getCustomerById(Number(customerId));
        const customerData: CustomerResponse = response.data.result;

        setCustomer(customerData);

        // Lấy vehicle đầu tiên
        if (customerData.vehicles && customerData.vehicles.length > 0) {
          setVehicle(customerData.vehicles[0]);
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Không thể tải thông tin khách hàng"
        );
        console.error("❌ Error fetching customer:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId]);

  // Fetch installed parts khi có vehicle
  useEffect(() => {
    const loadInstalledParts = async () => {
      if (!vehicle?.vin) return;

      try {
        setLoading(true);
        setError("");

        console.log(
          "🔍 [PartsManagement] Fetching parts for VIN:",
          vehicle.vin
        );
        const response = await installedPartAPI.getLatestInstalledParts(
          vehicle.vin
        );
        const partsData = response.data.result || [];

        console.log("✅ Parts data:", partsData);
        setParts(partsData);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Không thể tải danh sách phụ tùng"
        );
        console.error("❌ Error loading parts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInstalledParts();
  }, [vehicle]);

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

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

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
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-sm text-muted-foreground"
                      >
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                        Đang tải phụ tùng...
                      </TableCell>
                    </TableRow>
                  ) : parts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-sm text-muted-foreground"
                      >
                        Không có phụ tùng nào được ghi nhận
                      </TableCell>
                    </TableRow>
                  ) : (
                    parts.map((part) => (
                      <TableRow
                        key={part.installedPartID}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {part.partTypeName}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {part.partSerialNumber}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              part.partTypeID === 1 ? "default" : "secondary"
                            }
                          >
                            {part.partTypeID === 1 ? "Chính" : "Phụ"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {part.installationDate
                            ? new Date(
                                part.installationDate
                              ).toLocaleDateString("vi-VN")
                            : "Chưa cập nhật"}
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
    </div>
  );
}
