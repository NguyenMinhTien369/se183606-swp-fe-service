// ==================== Warranty Claim Status ====================
// ✅ Backend sử dụng tiếng Việt cho status
export const getClaimStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    Nháp: "📝 Nháp",
    "Chờ duyệt": "🟡 Chờ duyệt",
    "Được chấp thuận": "🟢 Được chấp thuận",
    "Đang xử lý": "🔵 Đang xử lý",
    "Hoàn thành": "✅ Hoàn thành",
    "Bị từ chối": "🔴 Bị từ chối",
  };
  return labels[status] || status;
};

export const getClaimStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Nháp: "bg-gray-100 text-gray-800",
    "Chờ duyệt": "bg-yellow-100 text-yellow-800",
    "Được chấp thuận": "bg-blue-100 text-blue-800",
    "Đang xử lý": "bg-purple-100 text-purple-800",
    "Hoàn thành": "bg-green-100 text-green-800",
    "Bị từ chối": "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// ==================== Assignment Status ====================
export const getAssignmentStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    ASSIGNED: "Đã phân công",
    IN_PROGRESS: "Đang xử lý",
    AWAITING_PARTS: "Chờ phụ tùng",
    COMPLETED: "Hoàn tất",
  };
  return labels[status] || status;
};

export const getAssignmentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    ASSIGNED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    AWAITING_PARTS: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// ==================== Performance Metrics ====================
export const getPerformanceColor = (rate: number): string => {
  if (rate >= 80) return "bg-green-100 text-green-800";
  if (rate >= 60) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

export const getPerformanceBadgeClass = (rate: number): string => {
  if (rate >= 80) return "bg-green-500";
  if (rate >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

// ==================== Time Formatting ====================
export const formatCompletionTime = (hours: number): string => {
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = Math.ceil(hours / 24);
  return `${days} ngày`;
};

// ==================== Deprecated Functions ====================
// Keep for backward compatibility

/** @deprecated Use getClaimStatusLabel instead */
export const getStatusLabel = getClaimStatusLabel;

/** @deprecated Use getClaimStatusColor instead */
export const getStatusColor = getClaimStatusColor;
