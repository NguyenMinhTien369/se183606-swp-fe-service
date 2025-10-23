"use client";

import { useState } from "react";
import type { Customer } from "../types/index";
import { Car, User, Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Screen2Props {
  customer: Customer;
}

export function Screen2VehicleInfo({ customer }: Screen2Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card className="border border-border/60 shadow-md rounded-2xl">
        <CardHeader className="pb-4 flex items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Car className="h-5 w-5 text-primary" />
            Thông tin khách hàng & xe chi tiết
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            <Info className="h-4 w-4 mr-1" /> Xem nhanh
          </Button>
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
                <Input value={customer.name} disabled className="bg-muted/40" />
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
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-base font-medium flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" /> Thông tin xe chi
              tiết
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  VIN{" "}
                  <Badge variant="destructive" className="ml-2">
                    Bắt buộc
                  </Badge>
                </Label>
                <Input value={customer.vin} disabled className="bg-muted/40" />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  value={customer.model}
                  disabled
                  className="bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <Label>Năm sản xuất</Label>
                <Input
                  value={customer.year.toString()}
                  disabled
                  className="bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <Label>Màu xe</Label>
                <Input
                  value={customer.color || "Chưa cập nhật"}
                  disabled
                  className="bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <Label>Biển số</Label>
                <Input
                  value={customer.licensePlate || "Chưa cập nhật"}
                  disabled
                  className="bg-muted/40"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🪟 Dialog thay thế toaster */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thông tin nhanh</DialogTitle>
            <DialogDescription>
              Tóm tắt thông tin khách hàng và xe đang xem.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="font-medium">Khách hàng:</span> {customer.name}
            </p>
            <p>
              <span className="font-medium">Số điện thoại:</span>{" "}
              {customer.phone}
            </p>
            <p>
              <span className="font-medium">Email:</span> {customer.email}
            </p>
            <p>
              <span className="font-medium">Model xe:</span> {customer.model}
            </p>
            <p>
              <span className="font-medium">VIN:</span> {customer.vin}
            </p>
            <p>
              <span className="font-medium">Biển số:</span>{" "}
              {customer.licensePlate || "Chưa cập nhật"}
            </p>
          </div>

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
