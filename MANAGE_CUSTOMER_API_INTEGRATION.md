# API Integration - Manage Customer Module

## 📋 Tổng Quan

Đã tích hợp API thực tế thay thế mockData cho toàn bộ module **Manage Customer** (Quản lý khách hàng).

### ✅ Files Đã Cập Nhật

| File                    | Thay Đổi                               | API Sử Dụng         |
| ----------------------- | -------------------------------------- | ------------------- |
| `ManageCustomer.tsx`    | Xóa import mockData                    | -                   |
| `CustomerSearch.tsx`    | Tích hợp API tìm kiếm & load customers | `customerAPI`       |
| `PartsManagement.tsx`   | Tích hợp API load installed parts      | `installedPartAPI`  |
| `ServiceHistory.tsx`    | Tích hợp API load service history      | `serviceHistoryAPI` |
| `VehicleInfomation.tsx` | Không thay đổi (chỉ hiển thị)          | -                   |

---

## 🔄 Chi Tiết Tích Hợp

### 1. **CustomerSearch.tsx**

#### APIs sử dụng:

```typescript
import { customerAPI } from "@/utility/index";

// GET all customers
customerAPI.getCustomers();

// Search by name
customerAPI.searchCustomersByName(searchTerm);

// Search by VIN or serial number
customerAPI.searchVehicle({ vin, serialNumber });
```

#### Thay đổi chính:

- ✅ Xóa props `customers: Customer[]`
- ✅ Thêm state `loading`, `error`
- ✅ Auto-load customers khi component mount
- ✅ Search theo tên trước, nếu không có kết quả thì search theo VIN
- ✅ Hiển thị loading spinner và error messages

#### Luồng hoạt động:

```
1. Component mount → loadAllCustomers()
2. User nhập search term → handleSearch()
   ├─ Tìm theo name (searchCustomersByName)
   └─ Nếu không có → tìm theo VIN (searchVehicle)
3. Click "Chọn" → onSelectCustomer(customer)
```

---

### 2. **PartsManagement.tsx**

#### APIs sử dụng:

```typescript
import { installedPartAPI } from "@/utility/index";

// GET latest installed parts by VIN
installedPartAPI.getLatestInstalledParts(customer.vin);
```

#### Thay đổi chính:

- ✅ Xóa props `parts: Part[]`
- ✅ Thêm internal state `parts`, `loading`, `error`
- ✅ useEffect tự động load khi customer thay đổi
- ✅ Mapping backend response → frontend Part interface

#### Backend Response Mapping:

```typescript
Backend Response → Frontend Interface
{
  installedPartID      → id: string
  partTypeName         → name: string
  partSerialNumber     → serialNumber: string
  partTypeID           → type: "Chính" | "Phụ" (logic cần review)
  installationDate     → installedDate: string
}
```

#### Luồng hoạt động:

```
1. Customer selected → useEffect trigger
2. Call installedPartAPI.getLatestInstalledParts(vin)
3. Map backend data → Part[]
4. Display trong table
```

---

### 3. **ServiceHistory.tsx**

#### APIs sử dụng:

```typescript
import { serviceHistoryAPI } from "@/utility/index";

// GET service history by VIN
serviceHistoryAPI.getByVehicleVin(customer.vin);
```

#### Thay đổi chính:

- ✅ Xóa props `serviceHistory: ServiceHistory[]`
- ✅ Thêm internal state `serviceHistory`, `loading`, `error`
- ✅ useEffect tự động load khi customer thay đổi
- ✅ Mapping backend response → frontend ServiceHistory interface

#### Backend Response Mapping:

```typescript
Backend Response → Frontend Interface
{
  serviceHistoryID     → id: string
  serviceDate          → date: string
  serviceType          → serviceType: string
  description          → category: string
  partReplaced         → partReplaced: string
  partSerialNumber     → serialNumber: string
  technicianName       → technician: string
}
```

#### Luồng hoạt động:

```
1. Customer selected → useEffect trigger
2. Call serviceHistoryAPI.getByVehicleVin(vin)
3. Map backend data → ServiceHistory[]
4. Display trong table
5. Notes feature (TODO: cần thêm API save notes)
```

---

## 🎯 Điểm Cần Lưu Ý

### 1. **Customer Search Logic**

Hiện tại search theo 2 bước:

1. Tìm theo `name` (customerAPI.searchCustomersByName)
2. Nếu không có kết quả → tìm theo `VIN` (customerAPI.searchVehicle)

**Lý do**: Backend có 2 endpoint riêng biệt, cần kết hợp để search đa dạng.

### 2. **Part Type Classification**

```typescript
type: item.partTypeID ? "Chính" : "Phụ";
```

⚠️ **Logic này CẦN REVIEW**: Hiện đang giả định có `partTypeID` = "Chính", không có = "Phụ". Cần xác nhận với backend về cách phân loại đúng.

### 3. **Error Handling**

Tất cả components đều có:

- `try-catch` cho API calls
- Display error message trong UI
- Console.error để debug

```typescript
try {
  // API call
} catch (err: any) {
  setError(err.response?.data?.message || "Default error message");
  console.error("Error context:", err);
}
```

### 4. **Loading States**

Mọi API call đều có loading indicator:

- Spinner icon (Loader2 từ lucide-react)
- Disabled buttons khi loading
- Thông báo "Đang tải..." trong tables

---

## 🔧 Backend Dependencies

### Required Backend Responses

#### 1. CustomerAPI.getCustomers()

```json
{
  "result": [
    {
      "id": "string",
      "name": "string",
      "phone": "string",
      "email": "string",
      "address": "string",
      "vin": "string",
      "model": "string",
      "year": number,
      "color": "string",
      "licensePlate": "string"
    }
  ]
}
```

#### 2. InstalledPartAPI.getLatestInstalledParts(vin)

```json
{
  "result": [
    {
      "installedPartID": number,
      "partSerialNumber": "string",
      "partTypeName": "string",
      "partTypeID": number,
      "installationDate": "string" // ISO date
    }
  ]
}
```

#### 3. ServiceHistoryAPI.getByVehicleVin(vin)

```json
{
  "result": [
    {
      "serviceHistoryID": number,
      "serviceDate": "string", // ISO date
      "serviceType": "string",
      "description": "string",
      "partReplaced": "string",
      "partSerialNumber": "string",
      "technicianName": "string"
    }
  ]
}
```

---

## 🚀 Cách Sử Dụng

### Bước 1: Đảm bảo backend đang chạy

```bash
# Backend phải chạy ở
http://localhost:8080/api
```

### Bước 2: Set environment variable (nếu cần)

```bash
# File: .env
VITE_API_URL=http://localhost:8080/api
```

### Bước 3: Run frontend

```bash
npm run dev
```

### Bước 4: Test workflow

1. Vào trang Manage Customer
2. Tự động load danh sách customers
3. Search theo tên/VIN/serial number
4. Chọn customer
5. Xem các tabs:
   - Thông tin xe (static data từ customer selected)
   - Quản lý phụ tùng (fetch từ API)
   - Lịch sử dịch vụ (fetch từ API)

---

## 🐛 Troubleshooting

### Lỗi: "Không thể tải danh sách khách hàng"

**Nguyên nhân**: Backend không response hoặc CORS issue
**Giải pháp**:

1. Check backend logs
2. Kiểm tra network tab trong DevTools
3. Verify CORS headers trong backend

### Lỗi: "Không có phụ tùng nào được ghi nhận"

**Nguyên nhân**: VIN không có installed parts trong DB
**Giải pháp**:

1. Seed data vào backend
2. Hoặc chấp nhận empty state (không phải lỗi)

### Lỗi: "Không có lịch sử dịch vụ nào"

**Nguyên nhân**: VIN chưa có service history
**Giải pháp**: Tương tự phụ tùng

### Lỗi TypeScript: Field không khớp

**Nguyên nhân**: Backend response structure thay đổi
**Giải pháp**:

1. Kiểm tra backend DTO
2. Update mapping logic trong components
3. Update types trong `types/index.ts`

---

## ✨ Features Đã Implement

- ✅ Load all customers on mount
- ✅ Search by name
- ✅ Search by VIN/serial number
- ✅ Display customer details
- ✅ Load installed parts by VIN
- ✅ Load service history by VIN
- ✅ Loading states
- ✅ Error handling & display
- ✅ Empty states

## 📝 TODO / Future Improvements

- [ ] Implement save notes API endpoint
- [ ] Add pagination for customer list
- [ ] Add filters for service history (date range, type)
- [ ] Add ability to add new installed parts
- [ ] Improve part type classification logic
- [ ] Add customer update functionality
- [ ] Add export service history to PDF/Excel
- [ ] Cache API responses to reduce calls
- [ ] Add refresh button for manual reload

---

## 📚 Related Files

- Backend DTOs: `FA25_SWP391_SE1818_G6/EVWarrantyHub/src/main/java/swp391/evwarrantyhub/dto/`
- API utilities: `src/utility/index.ts`
- Type definitions: `src/pages/manageCustomer/types/index.ts`
- Components:
  - `src/pages/manageCustomer/ManageCustomer.tsx`
  - `src/pages/manageCustomer/features/CustomerSearch.tsx`
  - `src/pages/manageCustomer/features/VehicleInfomation.tsx`
  - `src/pages/manageCustomer/features/PartsManagement.tsx`
  - `src/pages/manageCustomer/features/ServiceHistory.tsx`

---

**Cập nhật cuối**: 29/10/2025
**Status**: ✅ Hoàn tất tích hợp API cho Manage Customer module
