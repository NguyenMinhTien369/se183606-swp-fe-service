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
  //Claim Statuses
  //01
  "Chờ duyệt": {
    label: "Chờ duyệt",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  "Bị hủy": {
    label: "Bị hủy",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: Ban,
  },
  //02
  "Đã cấp phụ tùng": {
    label: "Đã cấp phụ tùng",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200", // Màu chàm: Đã xử lý kho
    icon: BoxSelect, // Icon chọn hộp hàng
  },

  "Chờ hãng duyệt": {
    label: "Chờ hãng duyệt",
    className: "bg-purple-50 text-purple-700 border-purple-200", // Màu tím: Liên quan đến Hãng (bên thứ 3)
    icon: Clock,
  },
  "Từ chối": {
    label: "Từ chối",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
  //03
  "Chờ bổ sung phụ tùng": {
    label: "Chờ bổ sung phụ tùng",
    className: "bg-orange-50 text-orange-700 border-orange-200", // Màu cam: Cảnh báo/Chờ đợi gây chậm trễ
    icon: AlertCircle, // Icon cảnh báo
  },
  "Đang giao phụ tùng": {
    label: "Đang giao phụ tùng",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Truck,
  },
  //04
  "Hãng đã duyệt": {
    label: "Hãng đã duyệt",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: ShieldCheck, // Icon khiên: Thể hiện sự phê duyệt có thẩm quyền từ Hãng
  },

  //05
  "Phụ tùng đã về trung tâm": {
    label: "Phụ tùng đã về trung tâm",
    className: "bg-violet-50 text-violet-700 border-violet-200", // Màu tím nhạt: Hàng đã về kho
    icon: PackageCheck,
  },

  "Đã nhận phụ tùng": {
    label: "Đã nhận phụ tùng",
    className: "bg-teal-50 text-teal-700 border-teal-200",
    icon: CheckCircle2,
  },

  "Thiếu hàng": {
    label: "Thiếu hàng",
    className: "bg-rose-50 text-rose-700 border-rose-200", // Màu hồng đỏ: Cảnh báo quan trọng
    icon: PackageX,
  },
  //---------------------------------------------------------------

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
    label: "Đang thay thế",
    className: "bg-cyan-50 text-cyan-700 border-cyan-200",
    icon: Wrench,
  },
  "Hoàn thành": {
    label: "Hoàn thành",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCheck, // 2 dấu tích: Hoàn tất toàn bộ quy trình
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
