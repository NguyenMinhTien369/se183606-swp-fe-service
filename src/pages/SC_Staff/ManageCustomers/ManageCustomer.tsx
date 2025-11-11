"use client";

import { useState, useEffect } from "react";
import type { Customer, CustomerResponse } from "./types/index";
import { flattenCustomerData } from "./types/index";
import { Search, X, Loader2, Car } from "lucide-react";

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
import { customerAPI } from "@/utility/index";
import { useNavigate } from "react-router";
import ROUTERS_PATH from "@/constants/routers";

export default function ManageCustomer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  // ✅ Navigate đến trang chi tiết khách hàng với customerID
  const handleRowClick = (customer: Customer) => {
    navigate(`${ROUTERS_PATH.MANAGE_CUSTOMER}/${customer.customerID}`);
  };

  const loadAllCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await customerAPI.getCustomers();

      // Backend trả về CustomerResponse[] với nested vehicles
      const backendCustomers: CustomerResponse[] = response.data.result || [];

      // Flatten: 1 customer có nhiều vehicle → tạo nhiều rows
      const flattenedCustomers: Customer[] = backendCustomers.flatMap(
        (backendCustomer) => flattenCustomerData(backendCustomer)
      );

      console.log("Flattened Customers:", flattenedCustomers);

      setCustomers(flattenedCustomers);
      setFilteredCustomers(flattenedCustomers);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Không thể tải danh sách khách hàng"
      );
      console.error("Error loading customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCustomers();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // API mới hỗ trợ search theo name, phone, hoặc vin
      // Kiểm tra xem searchTerm có phải là số điện thoại không (bắt đầu bằng 0 và có 10 số)
      const isPhone = /^0\d{9}$/.test(searchTerm);

      // Tạo params dựa trên loại search term
      const searchParams = isPhone
        ? { phone: searchTerm }
        : searchTerm.length >= 10 &&
          /^[A-Z0-9]+$/.test(searchTerm.toUpperCase())
        ? { vin: searchTerm } // VIN thường là chữ in hoa + số, dài
        : { name: searchTerm }; // Mặc định search theo tên

      const response = await customerAPI.searchCustomers(searchParams);
      const backendResults: CustomerResponse[] = response.data.result || [];

      // Nếu không tìm thấy kết quả, thử search vehicle
      if (backendResults.length === 0) {
        try {
          const vehicleResponse = await customerAPI.searchVehicle({
            vin: searchTerm,
            serialNumber: searchTerm,
          });

          // Backend có thể trả về Vehicle hoặc Customer
          const vehicleResult = vehicleResponse.data.result;
          if (vehicleResult) {
            // TODO: Cần xử lý response từ searchVehicle API
            console.log("🔍 Vehicle search result:", vehicleResult);
          }
          setFilteredCustomers([]);
        } catch {
          setFilteredCustomers([]);
        }
      } else {
        // Flatten backend results
        const flattenedResults = backendResults.flatMap((customer) =>
          flattenCustomerData(customer)
        );
        setFilteredCustomers(flattenedResults);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi tìm kiếm");
      console.error("Error searching:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilter = () => {
    setSearchTerm("");
    setFilteredCustomers(customers);
    setError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Car className="h-8 w-8" />
            <div>
              <h1 className="text-lg font-semibold">
                Hệ thống quản lý bảo hành xe
              </h1>
              <p className="text-muted-foreground text-sm">
                Ford Warranty Management System
              </p>
            </div>
          </div>
        </div>
      </header>

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
              placeholder="Nhập Số VIN / Tên khách hàng / Số điện thoại"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                className="gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tìm...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Tìm kiếm
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleClearFilter}
                className="gap-2"
                disabled={loading}
              >
                <X className="h-4 w-4" />
                Xóa lọc
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 📋 Bảng kết quả */}
          <div className="border rounded-2xl overflow-hidden shadow-sm bg-card">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Họ tên KH</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CMND/CCCD</TableHead>
                  <TableHead>Số VIN</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Biển số</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-10 text-sm"
                    >
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-10 text-sm"
                    >
                      {searchTerm
                        ? "Không tìm thấy khách hàng nào"
                        : "Nhập từ khóa để tìm kiếm"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      onClick={() => handleRowClick(customer)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell className="text-sm">
                        {customer.email}
                      </TableCell>
                      <TableCell>{customer.cmnd}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {customer.vin}
                      </TableCell>
                      <TableCell>{customer.model}</TableCell>
                      <TableCell>{customer.licensePlate}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
