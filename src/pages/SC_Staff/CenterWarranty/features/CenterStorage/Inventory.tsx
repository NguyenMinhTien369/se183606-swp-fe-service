import { useState, useEffect } from "react";

// Hooks
import { useAuth } from "@/pages/Login/feature/AuthContext";

// Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Icons
import { Loader2, Search, Pencil, Trash2 } from "lucide-react";
import useGetServiceCenterInventories from "../../Hooks/store/useGetServiceCenterInventories";

export default function CenterWarrantyList() {
  const { user } = useAuth();
  const serviceCenterID = user?.serviceCenterID || 1;
  const { inventory, loading, error, fetchInventory } =
    useGetServiceCenterInventories(serviceCenterID);
  const [searchTerm, setSearchTerm] = useState("");

  // Gọi fetchInventory khi component mount
  useEffect(() => {
    fetchInventory();
  }, [serviceCenterID]);

  const handleEdit = (item: any) => {
    console.log("Sửa phụ tùng:", item);
    // TODO: Implement edit logic
  };

  const handleDelete = (item: any) => {
    console.log("Xóa phụ tùng:", item);
    // TODO: Implement delete logic
  };

  const filteredInventory = inventory.filter((item) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      item.partSerialNumber.toLowerCase().includes(searchLower) ||
      item.partTypeName.toLowerCase().includes(searchLower) ||
      item.location.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Kho phụ tùng trung tâm</CardTitle>
        <CardDescription>
          Quản lý tồn kho và theo dõi phụ tùng tại trung tâm bảo hành
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Search Filter */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã serial, tên phụ tùng hoặc vị trí..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
            <p className="font-medium">Lỗi khi tải dữ liệu</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Mã Kho</TableHead>
                  <TableHead>Mã Số Serial</TableHead>
                  <TableHead>Tên Phụ Tùng</TableHead>
                  <TableHead className="text-center">Số Lượng</TableHead>
                  <TableHead>Vị Trí</TableHead>
                  <TableHead>Cập Nhật Lần Cuối</TableHead>
                  <TableHead className="text-center w-[120px]">
                    Thao Tác
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-muted-foreground"
                    >
                      {searchTerm
                        ? "Không tìm thấy phụ tùng phù hợp"
                        : "Chưa có phụ tùng nào trong kho"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => {
                    return (
                      <TableRow
                        key={item.inventoryID}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-mono font-medium text-primary">
                          #{item.inventoryID}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.partSerialNumber}
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <div className="truncate font-medium">
                            {item.partTypeName}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm">
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.location}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(item.lastUpdated).toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleEdit(item)}
                              title="Sửa"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(item)}
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Summary */}
        {!loading && filteredInventory.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Hiển thị {filteredInventory.length} phụ tùng
            {searchTerm && ` (đã lọc từ ${inventory.length} phụ tùng)`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
