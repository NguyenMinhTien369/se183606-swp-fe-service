import { useEffect } from "react";
import type { Customer } from "./types/index";
import { Search, X, Loader2, Car, User } from "lucide-react";

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
import { useNavigate } from "react-router";
import ROUTERS_PATH from "@/constants/routers";
import { useGetCustomers } from "@/hooks/ManageCustomersHooks/useGetCustomers";
import { useGetCustomers as useSearchCustomers } from "@/hooks/ManageCustomersHooks/useSearCustomers";
import NotRegisteredAlert from "./components/NotRegisteredAlert";

export default function ManageCustomer() {
  const {
    customers,
    loading: loadingCustomers,
    error: loadError,
    reload: loadAllCustomers,
  } = useGetCustomers();

  const {
    searchTerm,
    filteredCustomers,
    searchLoading,
    searchError,
    handleSearch,
    setSearchTerm,
    setInitialCustomers,
    clearSearchTerm,
    showNotFoundDialog,
    setShowNotFoundDialog,
  } = useSearchCustomers();

  const navigate = useNavigate();

  const handleRowClick = (customer: Customer) => {
    navigate(`${ROUTERS_PATH.MANAGE_CUSTOMER}/${customer.customerID}`);
  };

  useEffect(() => {
    loadAllCustomers();
  }, []);

  useEffect(() => {
    if (customers.length > 0) {
      setInitialCustomers(customers);
    }
  }, [customers]);

  // Xóa filter và hiển thị lại tất cả customers
  const handleClearFilter = () => {
    clearSearchTerm(); // Clear search term và error
    setInitialCustomers(customers); // Reset về tất cả data
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
            <User className="h-8 w-8" />
            <div>
              <h1 className="text-lg font-semibold">Quản Lý Khách Hàng</h1>
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
              disabled={searchLoading || loadingCustomers}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                className="gap-2"
                disabled={searchLoading || loadingCustomers}
              >
                {searchLoading ? (
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
                disabled={searchLoading || loadingCustomers}
              >
                <X className="h-4 w-4" />
                Xóa lọc
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {(loadError || searchError) && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {loadError || searchError}
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
                {loadingCustomers || searchLoading ? (
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

      <NotRegisteredAlert
        open={showNotFoundDialog}
        onOpenChange={setShowNotFoundDialog}
        searchKeyword={searchTerm}
      />
    </div>
  );
}
