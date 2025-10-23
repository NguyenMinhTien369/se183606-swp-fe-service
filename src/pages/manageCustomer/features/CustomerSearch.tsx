"use client";

import { useState } from "react";
import type { Customer } from "../types/index";
import { Search, X, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Screen1Props {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

export function Screen1CustomerSearch({
  customers,
  onSelectCustomer,
}: Screen1Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<string>("");

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        customer.vin.toLowerCase().includes(term) ||
        customer.name.toLowerCase().includes(term) ||
        customer.phone.includes(term)
    );
    setFilteredCustomers(filtered);
  };

  const handleClearFilter = () => {
    setSearchTerm("");
    setFilteredCustomers(customers);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSelect = (customer: Customer) => {
    onSelectCustomer(customer);
    setSelectedName(customer.name);
    setDialogOpen(true); // mở dialog thay toaster
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Tra cứu & chọn khách hàng
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 🔍 Thanh tìm kiếm */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <Input
              placeholder="Nhập Số VIN / Tên khách hàng / Số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="gap-2">
                <Search className="h-4 w-4" />
                Tìm kiếm
              </Button>
              <Button
                variant="outline"
                onClick={handleClearFilter}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Xóa lọc
              </Button>
            </div>
          </div>

          {/* 📋 Bảng kết quả */}
          <div className="border rounded-2xl overflow-hidden shadow-sm bg-card">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Họ tên KH</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Số VIN</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Năm SX</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-10 text-sm"
                    >
                      Không tìm thấy khách hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.address}</TableCell>
                      <TableCell>{customer.vin}</TableCell>
                      <TableCell>{customer.model}</TableCell>
                      <TableCell>{customer.year}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleSelect(customer)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Chọn
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 🪟 Dialog thay thế Toaster */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đã chọn khách hàng</DialogTitle>
            <DialogDescription>
              Bạn đã chọn khách hàng{" "}
              <span className="font-semibold text-foreground">
                {selectedName}
              </span>
              . Tiếp tục để xem thông tin chi tiết.
            </DialogDescription>
          </DialogHeader>
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
