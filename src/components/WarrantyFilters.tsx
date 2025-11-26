import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Import Button
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WarrantyFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusValue: string;
  onStatusChange: (value: string) => void;
}

export function WarrantyFilters({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
}: WarrantyFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo VIN..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button
          className="shrink-0"
          onClick={() => onSearchChange(searchValue)}
        >
          Tìm kiếm
        </Button>
      </div>

      <Select value={statusValue} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Lọc theo trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả trạng thái</SelectItem>
          <SelectItem value="Nháp">Nháp</SelectItem>
          <SelectItem value="Chờ duyệt">Chờ duyệt</SelectItem>
          <SelectItem value="Được chấp nhận">Được chấp nhận</SelectItem>
          <SelectItem value="Đang giao phụ tùng">Đang giao phụ tùng</SelectItem>
          <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
          <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
          <SelectItem value="Từ chối">Từ chối</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
