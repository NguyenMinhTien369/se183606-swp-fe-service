import { useState, useEffect } from "react";
import type { CustomerResponse, VehicleResponse } from "../types/index";
import { Car, User, Loader2, AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router";
import { customerAPI } from "@/utility/index";

export default function VehicleInformation() {
  const { customerId } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

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

        const response = await customerAPI.getCustomerById(Number(customerId));

        const customerData: CustomerResponse = response.data.result;

        setCustomer(customerData);

        // Lấy vehicle đầu tiên (nếu có nhiều xe thì có thể thêm logic chọn)
        if (customerData.vehicles && customerData.vehicles.length > 0) {
          setVehicle(customerData.vehicles[0]);
          console.log("🚗 Vehicle Data:", customerData.vehicles[0]);
        } else {
          console.log("⚠️ Customer has no vehicles");
        }
      } catch (err: any) {
        console.error("❌ Error response:", err.response);
        setError(
          err.response?.data?.message || "Không thể tải thông tin khách hàng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId]);

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
        <CardContent className="flex flex-col gap-3 py-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive font-semibold">{error}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Customer ID: {customerId}</p>
            <p>Endpoint: GET /customers/{customerId}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!customer) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          <p>Không tìm thấy thông tin khách hàng</p>
          <p className="text-xs mt-2">Customer ID: {customerId}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card className="border border-border/60 shadow-md rounded-2xl">
        <CardHeader className="pb-4 flex items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Car className="h-5 w-5 text-primary" />
            Thông tin khách hàng & xe chi tiết
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 p-6">
          {/* 👤 Thông tin khách hàng */}
          <div className="space-y-4">
            <h3 className="text-base font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" /> Thông tin khách
              hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Họ tên khách hàng</Label>
                <Input
                  value={customer.fullName}
                  disabled
                  className="bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input
                  value={customer.phone}
                  disabled
                  className="bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={customer.email}
                  disabled
                  className="bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <Label>CMND/CCCD</Label>
                <Input value={customer.cmnd} disabled className="bg-muted/40" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Địa chỉ</Label>
                <Input
                  value={customer.address}
                  disabled
                  className="bg-muted/40"
                />
              </div>
            </div>
          </div>

          {/* 🚗 Thông tin xe chi tiết */}
          {vehicle ? (
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-base font-medium flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" /> Thông tin xe
                chi tiết
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    VIN{" "}
                    <Badge variant="destructive" className="ml-2">
                      Bắt buộc
                    </Badge>
                  </Label>
                  <Input
                    value={vehicle.vin}
                    disabled
                    className="bg-muted/40 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input
                    value={vehicle.modelName}
                    disabled
                    className="bg-muted/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Năm sản xuất</Label>
                  <Input
                    value={
                      vehicle.productionYear?.toString() || "Chưa cập nhật"
                    }
                    disabled
                    className="bg-muted/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Màu xe</Label>
                  <Input
                    value={vehicle.color || "Chưa cập nhật"}
                    disabled
                    className="bg-muted/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Biển số xe</Label>
                  <Input
                    value={vehicle.licensePlate || "Chưa đăng ký"}
                    disabled
                    className="bg-muted/40 font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dung lượng pin (kWh)</Label>
                  <Input
                    value={
                      vehicle.batteryCapacity
                        ? `${vehicle.batteryCapacity} kWh`
                        : "Chưa cập nhật"
                    }
                    disabled
                    className="bg-muted/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ngày đăng ký</Label>
                  <Input
                    value={
                      vehicle.registrationDate
                        ? new Date(vehicle.registrationDate).toLocaleDateString(
                            "vi-VN"
                          )
                        : "Chưa đăng ký"
                    }
                    disabled
                    className="bg-muted/40"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-6 border-t text-center text-muted-foreground">
              Khách hàng chưa có thông tin xe
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
