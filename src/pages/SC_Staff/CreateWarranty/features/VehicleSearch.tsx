"use client";

import { useState } from "react";
import { Search, QrCode, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { warrantyClaimAPI } from "@/utility/index";
import type { VehicleInfo } from "../types/warranty";

interface VehicleSearchProps {
  onSearch: (vehicleInfo: VehicleInfo | null, error?: string) => void;
}

export function VehicleSearch({ onSearch }: VehicleSearchProps) {
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!vin.trim()) {
      onSearch(null, "Vui lòng nhập VIN");
      return;
    }

    try {
      setLoading(true);
      const response = await warrantyClaimAPI.getVehicleInfoByVin(vin.trim());
      const vehicleData: VehicleInfo = response.data.result;

      if (vehicleData) {
        onSearch(vehicleData);
      } else {
        onSearch(null, "Không tìm thấy thông tin xe với VIN này");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Không thể tra cứu thông tin xe. Vui lòng thử lại.";
      onSearch(null, errorMessage);
      console.error("Error searching vehicle:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tra cứu hồ sơ xe</CardTitle>
        <CardDescription>Nhập VIN</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {/* Ô nhập VIN */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nhập VIN (ví dụ: XYZ123ABC456)"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>

          {/* Nút tìm kiếm */}
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tìm...
              </>
            ) : (
              "Tìm kiếm"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
