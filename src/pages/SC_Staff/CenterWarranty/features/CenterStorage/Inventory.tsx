import { useState, useEffect } from "react";
import { useAuth } from "@/pages/Login/feature/AuthContext";
import useGetServiceCenterInventories from "../../Hooks/Store/useGetServiceCenterInventories";
import { inventoryAPI } from "@/utility";
import type { PartInventoryResponseCenter } from "../../types/PartDistribution";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Loader2, Search, Pencil, Trash2, Plus } from "lucide-react";

// Import Form Component (Đảm bảo 2 file này nằm CÙNG THƯ MỤC với Inventory.tsx)
import AddPartsForm from "./AddPartsForm";
import UpdatePartsForm from "./UpdatePartsForm";

export default function Inventory() {
  const { user } = useAuth();
  const serviceCenterID = user?.serviceCenterID || 1;
  const { inventory, loading, error, fetchInventory } =
    useGetServiceCenterInventories(serviceCenterID);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<PartInventoryResponseCenter | null>(null);

  useEffect(() => {
    fetchInventory();
  }, [serviceCenterID]);

  // Handle Edit
  const handleEdit = (item: PartInventoryResponseCenter) => {
    setSelectedItem(item);
    setShowUpdateModal(true);
  };

  // Handle Delete
  const handleDelete = async (item: PartInventoryResponseCenter) => {
    if (
      window.confirm(`Bạn chắc chắn muốn xóa serial: ${item.partSerialNumber}?`)
    ) {
      try {
        await inventoryAPI.deleteInventoryCenter(
          item.partSerialNumber,
          serviceCenterID
        );
        fetchInventory();
      } catch (error: any) {
        console.log(error.message);
      }
    }
  };

  // Filter Logic
  const inventoryArray = Array.isArray(inventory) ? inventory : [];
  const filteredInventory = inventoryArray.filter((item) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      item.partSerialNumber.toLowerCase().includes(s) ||
      item.partTypeName.toLowerCase().includes(s) ||
      item.location.toLowerCase().includes(s)
    );
  });

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Kho phụ tùng trung tâm</CardTitle>
          <CardDescription>Quản lý tồn kho và vị trí</CardDescription>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Nhập Kho
        </Button>
      </CardHeader>

      <CardContent>
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-500 mb-4 p-2 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin mx-auto h-8 w-8" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial</TableHead>
                  <TableHead>Tên Phụ Tùng</TableHead>
                  <TableHead className="text-center">Số Lượng</TableHead>
                  <TableHead>Vị Trí</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.inventoryID}>
                      <TableCell className="font-mono font-medium">
                        {item.partSerialNumber}
                      </TableCell>
                      <TableCell>{item.partTypeName}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            item.quantity > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Modals */}
        <AddPartsForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchInventory}
          serviceCenterID={serviceCenterID}
        />

        <UpdatePartsForm
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedItem(null);
          }}
          onSuccess={fetchInventory}
          item={selectedItem}
          serviceCenterID={serviceCenterID}
        />
      </CardContent>
    </Card>
  );
}
