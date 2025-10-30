"use client";

import { useState } from "react";
import { Search, QrCode } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";

interface VehicleSearchProps {
  onSearch: (vin: string) => void;
}

export function VehicleSearch({ onSearch }: VehicleSearchProps) {
  const [vin, setVin] = useState("");

  const handleSearch = () => {
    if (vin.trim()) {
      onSearch(vin.trim());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tra cứu hồ sơ xe</CardTitle>
        <CardDescription>
          Nhập VIN hoặc quét mã QR để tra cứu thông tin xe
        </CardDescription>
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
          <Button onClick={handleSearch}>Tìm kiếm</Button>

          {/* Nút quét QR */}
          <Button variant="outline" size="icon">
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
