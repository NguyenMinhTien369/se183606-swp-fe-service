import {
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  FileText,
  RefreshCw,
  AlertCircle,
  UserCog,
  Wrench,
  ShieldCheck,
  ShieldAlert,
  Ban,
  PackageX,
  PackageCheck,
  BoxSelect,
  CheckCheck,
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

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
  "Từ chối": {
    label: "Bị từ chối",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
  "Bị hủy": {
    label: "Đã hủy",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: Ban,
  },

  "Đang giao phụ tùng": {
    label: "Đang giao hàng",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Truck,
  },
  "Đã nhận": {
    label: "Đã nhận hàng",
    className: "bg-teal-50 text-teal-700 border-teal-200",
    icon: PackageCheck,
  },
  "Thiếu hàng": {
    label: "Thiếu hàng",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    icon: PackageX,
  },
  "Nhận phụ tùng": {
    label: "Đã lấy phụ tùng",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: BoxSelect,
  },

  "Đã phân công": {
    label: "Đã phân công",
    className: "bg-sky-50 text-sky-700 border-sky-200",
    icon: UserCog,
  },
  "Đang xử lý": {
    label: "Đang xử lý",
    className: "bg-blue-50 text-blue-600 border-blue-200",
    icon: RefreshCw,
  },
  "Đang thay thế": {
    label: "Đang sửa chữa",
    className: "bg-cyan-50 text-cyan-700 border-cyan-200",
    icon: Wrench,
  },
  "Hoàn thành": {
    label: "Hoàn thành",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCheck,
  },

  "Bảo hành": {
    label: "Còn bảo hành",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: ShieldCheck,
  },
  "Hết bảo hành": {
    label: "Hết bảo hành",
    className: "bg-gray-100 text-gray-500 border-gray-200",
    icon: ShieldAlert,
  },
};
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
