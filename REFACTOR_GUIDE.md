# 🔄 Hướng Dẫn Refactor InternalManagement

## 📋 Tổng quan

Chuyển đổi từ **Tabs-based navigation** sang **Router-based navigation** để:

- ✅ Nhất quán với các module khác (Admin, EVM, Technician)
- ✅ Hỗ trợ browser history (Back/Forward button)
- ✅ Cho phép bookmark/share link từng trang cụ thể
- ✅ Better UX và SEO

---

## 🛠️ Bước 1: Update Router (routes/index.tsx)

**❌ XÓA:**

```tsx
{ path: "internal-management", element: <InternalManagement /> },
```

**✅ THAY BẰNG:**

```tsx
{
  path: "internal",
  element: <InternalManagementLayout />,
  children: [
    { index: true, element: <Navigate to="/sc-staff/internal/requests" replace /> },
    { path: "requests", element: <WarrantyRequestsList /> },
    { path: "assign", element: <AssignTechnician /> },
    { path: "progress", element: <TrackProgress /> },
    { path: "performance", element: <PerformanceDashboard /> },
    { path: "archive", element: <ArchiveReports /> },
  ],
},
```

**Imports cần thêm:**

```tsx
import InternalManagementLayout from "@/pages/SC_Staff/InternalManagement/InternalManagementLayout";
import {
  WarrantyRequestsList,
  AssignTechnician,
  TrackProgress,
  PerformanceDashboard,
  ArchiveReports,
} from "@/pages/SC_Staff/InternalManagement/features";
```

---

## 🛠️ Bước 2: Update Sidebar (components/app-sidebar.tsx)

**❌ XÓA:**

```tsx
{
  title: "Quản lý nội bộ",
  url: "/sc-staff/internal-management",
  icon: Settings,
}
```

**✅ THAY BẰNG (Sub-menu):**

```tsx
{
  title: "Quản lý nội bộ",
  url: "/sc-staff/internal",
  icon: Settings,
  items: [
    {
      title: "Yêu cầu bảo hành",
      url: "/sc-staff/internal/requests",
      icon: ClipboardList,
    },
    {
      title: "Phân công KTV",
      url: "/sc-staff/internal/assign",
      icon: UserCog,
    },
    {
      title: "Theo dõi tiến độ",
      url: "/sc-staff/internal/progress",
      icon: TrendingUp,
    },
    {
      title: "Hiệu suất",
      url: "/sc-staff/internal/performance",
      icon: BarChart3,
    },
    {
      title: "Lưu trữ",
      url: "/sc-staff/internal/archive",
      icon: Archive,
    },
  ],
}
```

---

## 🛠️ Bước 3: Update Feature Components

Mỗi feature component cần:

### 3.1. Import useWarrantyClaims hook

```tsx
import { useWarrantyClaims } from "../context/WarrantyClaimsContext";
```

### 3.2. Remove props, use context

```tsx
// ❌ TRƯỚC:
interface WarrantyRequestsListProps {
  claims: WarrantyClaimResponse[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function WarrantyRequestsList({
  claims,
  isLoading,
  onRefresh,
}: WarrantyRequestsListProps) {
  // ...
}

// ✅ SAU:
export function WarrantyRequestsList() {
  const { warrantyClaims, isLoading, loadWarrantyClaims } = useWarrantyClaims();

  // Use warrantyClaims instead of claims
  // Use loadWarrantyClaims instead of onRefresh
}
```

### 3.3. Các file cần update:

**WarrantyRequestsList.tsx:**

```tsx
export function WarrantyRequestsList() {
  const { warrantyClaims, isLoading, loadWarrantyClaims } = useWarrantyClaims();

  // Replace all "claims" with "warrantyClaims"
  // Replace all "onRefresh" with "loadWarrantyClaims"
}
```

**AssignTechnician.tsx:**

```tsx
export function AssignTechnician() {
  const { warrantyClaims, loadWarrantyClaims } = useWarrantyClaims();

  // Replace "claims" prop with warrantyClaims from context
  // Replace "onAssignSuccess" with loadWarrantyClaims
}
```

**TrackProgress.tsx:**

```tsx
export function TrackProgress() {
  const { serviceCenterID } = useWarrantyClaims();

  // Use serviceCenterID from context instead of prop
}
```

**PerformanceDashboard.tsx:**

```tsx
export function PerformanceDashboard() {
  const { serviceCenterID } = useWarrantyClaims();

  // Use serviceCenterID from context
}
```

**ArchiveReports.tsx:**

```tsx
export function ArchiveReports() {
  const { warrantyClaims } = useWarrantyClaims();

  // Use warrantyClaims from context
}
```

---

## 🛠️ Bước 4: Create index.ts for exports

**File:** `pages/SC_Staff/InternalManagement/features/index.ts`

```tsx
export { WarrantyRequestsList } from "./WarrantyRequestsList";
export { AssignTechnician } from "./AssignTechnician";
export { TrackProgress } from "./TrackProgress";
export { PerformanceDashboard } from "./PerformanceDashboard";
export { ArchiveReports } from "./ArchiveReports";
```

---

## 🛠️ Bước 5: DELETE old InternalManagement.tsx

Sau khi hoàn thành tất cả bước trên, xóa file:

```
pages/SC_Staff/InternalManagement/InternalManagement.tsx
```

---

## ✅ Kết quả cuối cùng

### URL Structure:

```
/sc-staff/internal/requests      → Yêu cầu bảo hành
/sc-staff/internal/assign        → Phân công kỹ thuật viên
/sc-staff/internal/progress      → Theo dõi tiến độ
/sc-staff/internal/performance   → Hiệu suất
/sc-staff/internal/archive       → Lưu trữ
```

### Navigation:

- Sidebar: Click trực tiếp vào từng menu item
- Browser Back/Forward: Hoạt động bình thường
- Bookmark: Có thể bookmark từng trang
- Share: Share link cụ thể cho đồng nghiệp

### State Management:

- Tất cả components share state qua `WarrantyClaimsContext`
- Data chỉ load 1 lần khi vào module
- Có thể refresh bằng `loadWarrantyClaims()`

---

## 🧪 Testing Checklist

- [ ] Tất cả 5 routes hoạt động đúng
- [ ] Sidebar highlight đúng active route
- [ ] Browser Back/Forward button hoạt động
- [ ] Data sharing giữa các pages qua context
- [ ] No console errors
- [ ] Performance tốt (không re-fetch data khi đổi route)

---

## 📌 Lưu ý

1. **serviceCenterID**: Hiện tại hardcode = 1. Sau này lấy từ `user.serviceCenterID`
2. **Authentication**: Đã có ProtectedRoute bao ngoài
3. **Lazy Loading**: Có thể thêm React.lazy() cho các feature components sau

---

## 🆘 Troubleshooting

**Lỗi: "useWarrantyClaims must be used within WarrantyClaimsProvider"**
→ Đảm bảo InternalManagementLayout wrap Outlet với Provider

**Data không load:**
→ Check useEffect trong WarrantyClaimsContext có chạy không

**404 khi refresh page:**
→ Config server routing (rewrites tất cả về index.html)

---

**Tác giả:** AI Assistant  
**Ngày tạo:** 2025-11-10  
**Version:** 1.0
