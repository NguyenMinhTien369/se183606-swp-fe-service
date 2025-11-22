import {
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  FileText,
  RefreshCw,
  AlertCircle,
  User,
  Package,
  Wrench,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

// Định nghĩa cấu hình cho từng trạng thái
const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
    icon: any;
  }
> = {
  Nháp: {
    label: "Bản nháp",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: FileText,
  },
  "Chờ duyệt": {
    label: "Chờ duyệt",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  "Được chấp nhận": {
    label: "Đã duyệt",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  "Đã phân công": {
    label: "Đã phân công",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200", // Màu Chàm (Indigo)
    icon: User,
  },
  "Đang giao phụ tùng": {
    label: "Đang giao hàng",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Truck,
  },
  "Nhận phụ tùng": {
    label: "Đã nhận phụ tùng",
    className: "bg-orange-50 text-orange-700 border-orange-200", // Màu Cam
    icon: Package,
  },
  "Đang thay thế": {
    label: "Đang thay thế",
    className: "bg-sky-50 text-sky-700 border-sky-200", // Màu Xanh da trời
    icon: Wrench,
  },
  "Đang xử lý": {
    label: "Đang xử lý",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: RefreshCw,
  },
  "Hoàn thành": {
    label: "Hoàn thành",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  "Từ chối": {
    label: "Từ chối",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
  "Bảo hành": {
    label: "Bảo hành",
    className:
      "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    icon: ShieldCheck,
  },
  "Hết bảo hành": {
    label: "Hết bảo hành",
    className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    icon: ShieldAlert,
  },
};

// Cấu hình mặc định nếu status không khớp
const defaultConfig = {
  label: "Không xác định",
  className: "bg-gray-100 text-gray-500 border-gray-200",
  icon: AlertCircle,
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || defaultConfig;
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors
        ${config.className}
      `}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
