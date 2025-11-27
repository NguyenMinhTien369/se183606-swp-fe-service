import { useState } from "react";

// Hooks
import { useAuth } from "@/pages/Login/feature/AuthContext";
import useGetDistributionsByServiceCenter from "../../Hooks/Store/useGetDistributionsByServiceCenter";

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

// Icons
import { Loader2, Search } from "lucide-react";

export default function CenterWarrantyList() {
  const { user } = useAuth();
  const serviceCenterID = user?.serviceCenterID || 1;
  const { distributions: claims, loading } =
    useGetDistributionsByServiceCenter(serviceCenterID);
  const [searchVin, setSearchVin] = useState("");

  const filteredClaims = claims.filter((claim) => {
    const matchesVin = searchVin
      ? claim.partSerialNumber.toLowerCase().includes(searchVin.toLowerCase())
      : true;

    return matchesVin;
  });

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Danh sách phụ tùng đã nhận</CardTitle>
        <CardDescription>
          Quản lý và theo dõi tất cả phụ tùng được phân phối
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Search Filter */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã số serial..."
              value={searchVin}
              onChange={(e) => setSearchVin(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã Phân Phối</TableHead>
                  <TableHead>Mã Số Serial</TableHead>
                  <TableHead>Tên Phụ Tùng</TableHead>
                  <TableHead>Trung Tâm Bảo Hành</TableHead>
                  <TableHead>Số Lượng</TableHead>
                  <TableHead>Ngày Phân Phối</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredClaims.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Không tìm thấy phụ tùng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClaims.map((claim) => {
                    return (
                      <TableRow
                        key={claim.distributionID}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-mono font-medium text-primary">
                          #{claim.distributionID}
                        </TableCell>
                        <TableCell className="font-mono">
                          {claim.partSerialNumber}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {claim.partTypeName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {claim.serviceCenterName}
                        </TableCell>
                        <TableCell className="font-medium">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              claim.quantity > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {claim.quantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(claim.distributionDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
