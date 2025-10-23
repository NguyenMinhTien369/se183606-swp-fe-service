import type { WarrantyStatus, Priority } from "../types/warranty";

export const getStatusLabel = (status: WarrantyStatus): string => {
  const labels: Record<WarrantyStatus, string> = {
    pending: "Chờ duyệt",
    assigned: "Đã phân công",
    receiving_parts: "Nhận phụ tùng",
    in_progress: "Đang thay thế",
    completed: "Hoàn tất",
    rejected: "Từ chối",
  };
  return labels[status];
};

export const getStatusColor = (status: WarrantyStatus): string => {
  const colors: Record<WarrantyStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    assigned: "bg-blue-100 text-blue-800",
    receiving_parts: "bg-purple-100 text-purple-800",
    in_progress: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return colors[status];
};

export const getPriorityLabel = (priority: Priority): string => {
  const labels: Record<Priority, string> = {
    high: "Cao",
    medium: "Bình thường",
    low: "Thấp",
  };
  return labels[priority];
};

export const getPriorityColor = (priority: Priority): string => {
  const colors: Record<Priority, string> = {
    high: "bg-red-100 text-red-800",
    medium: "bg-blue-100 text-blue-800",
    low: "bg-gray-100 text-gray-800",
  };
  return colors[priority];
};
