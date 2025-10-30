# Hướng Dẫn Kiểm Tra Kiểu Dữ Liệu Backend

## 📂 Cấu Trúc Thư Mục Backend DTOs

Tất cả các kiểu dữ liệu (DTOs) của backend nằm trong:

```
FA25_SWP391_SE1818_G6/EVWarrantyHub/src/main/java/swp391/evwarrantyhub/dto/
├── request/        # Dữ liệu gửi TỪ frontend ĐẾN backend
└── response/       # Dữ liệu trả về TỪ backend VỀ frontend
```

## 🔍 Cách Kiểm Tra Từng Interface

### 1. **Auth & User APIs**

| Frontend Interface     | Backend DTO File            | Đường Dẫn                               |
| ---------------------- | --------------------------- | --------------------------------------- |
| `LoginCredentials`     | `LoginRequest.java`         | `dto/request/LoginRequest.java`         |
| `UserRegisterRequest`  | `UserRegisterRequest.java`  | `dto/request/UserRegisterRequest.java`  |
| `UserUpdateRequest`    | `UserUpdateRequest.java`    | `dto/request/UserUpdateRequest.java`    |
| `VerifyOtpRequest`     | `VerifyOtpRequest.java`     | `dto/request/VerifyOtpRequest.java`     |
| `ResetPasswordRequest` | `ResetPasswordRequest.java` | `dto/request/ResetPasswordRequest.java` |

**Ví dụ kiểm tra:**

```bash
# Mở file backend để xem cấu trúc
code "d:\New folder (2)\be\FA25_SWP391_SE1818_G6\EVWarrantyHub\src\main\java\swp391\evwarrantyhub\dto\request\LoginRequest.java"
```

### 2. **Warranty Claim APIs**

| Frontend Interface      | Backend DTO File                  | Ghi Chú             |
| ----------------------- | --------------------------------- | ------------------- |
| `createClaim(FormData)` | `CreateWarrantyClaimRequest.java` | Multipart form data |
| `updateClaim(FormData)` | `UpdateWarrantyClaimRequest.java` | Multipart form data |
| Response data           | `WarrantyClaimResponse.java`      | `dto/response/`     |
| Vehicle info            | `VehicleInfoResponse.java`        | `dto/response/`     |

### 3. **Claim Assignment APIs**

| Frontend Interface        | Backend DTO File                  | Đường Dẫn                                      |
| ------------------------- | --------------------------------- | ---------------------------------------------- |
| `AssignTechnicianRequest` | `AssignTechnicianRequest.java`    | `dto/request/AssignTechnicianRequest.java`     |
| `UpdateAssignmentRequest` | `UpdateAssignmentRequest.java`    | `dto/request/UpdateAssignmentRequest.java`     |
| Response                  | `ClaimAssignmentResponse.java`    | `dto/response/ClaimAssignmentResponse.java`    |
| Progress                  | `AssignmentProgressResponse.java` | `dto/response/AssignmentProgressResponse.java` |

### 4. **Service Center APIs**

| Frontend Interface     | Backend DTO File                  | Đường Dẫn                                     |
| ---------------------- | --------------------------------- | --------------------------------------------- |
| `ServiceCenterRequest` | `CreateServiceCenterRequest.java` | `dto/request/CreateServiceCenterRequest.java` |
| Response               | `ServiceCenterResponse.java`      | `dto/response/ServiceCenterResponse.java`     |

### 5. **Part APIs**

| Frontend Interface  | Backend DTO File         | Đường Dẫn                            |
| ------------------- | ------------------------ | ------------------------------------ |
| `PartRequest`       | `CreatePartRequest.java` | `dto/request/CreatePartRequest.java` |
| `PartUpdateRequest` | `PartUpdateRequest.java` | `dto/request/PartUpdateRequest.java` |
| Response            | `PartResponse.java`      | `dto/response/PartResponse.java`     |

### 6. **Part Type APIs**

| Frontend Interface | Backend DTO File        | Đường Dẫn                            |
| ------------------ | ----------------------- | ------------------------------------ |
| `PartTypeRequest`  | `PartTypeRequest.java`  | `dto/request/PartTypeRequest.java`   |
| Response           | `PartTypeResponse.java` | `dto/response/PartTypeResponse.java` |

### 7. **Installed Part APIs**

| Frontend Interface     | Backend DTO File             | Đường Dẫn                                 |
| ---------------------- | ---------------------------- | ----------------------------------------- |
| `InstalledPartRequest` | `InstalledPartRequest.java`  | `dto/request/InstalledPartRequest.java`   |
| Response               | `InstalledPartResponse.java` | `dto/response/InstalledPartResponse.java` |

### 8. **Customer & Vehicle Search**

| Frontend Interface     | Backend DTO File            | Đường Dẫn                               |
| ---------------------- | --------------------------- | --------------------------------------- |
| `VehicleSearchRequest` | `VehicleSearchRequest.java` | `dto/request/VehicleSearchRequest.java` |
| Customer Response      | `CustomerResponse.java`     | `dto/response/CustomerResponse.java`    |
| Vehicle Response       | `VehicleResponse.java`      | `dto/response/VehicleResponse.java`     |

## ⚠️ Những Khác Biệt Quan Trọng Đã Sửa

### 1. **UserRegisterRequest**

- ❌ Frontend cũ: `phoneNumber` (sai)
- ✅ Backend: `phone` (đúng)
- ❌ Frontend cũ: `role: string` (sai)
- ✅ Backend: `roleId: number` (đúng) - Required!
- ➕ Backend thêm: `serviceCenterId?: number`

### 2. **VerifyOtpRequest & ResetPasswordRequest**

- ❌ Frontend cũ: `otp` (sai)
- ✅ Backend: `otpCode` (đúng)
- ➕ ResetPassword backend yêu cầu: `confirmPassword` (required)

### 3. **AssignTechnicianRequest**

- ❌ Frontend cũ: `technicianID` (sai)
- ✅ Backend: `primaryTechnicianID` (đúng)
- ❌ Frontend cũ: `estimatedCompletionDate` (sai)
- ✅ Backend: `expectedCompletionDate` (đúng)
- ❌ Frontend cũ: `notes` (sai)
- ✅ Backend: `internalNotes` (đúng)

### 4. **UpdateAssignmentRequest**

- ➕ Backend có thêm: `completionPercentage`, `totalHours`, `manufacturerRejected`
- ❌ Frontend cũ: `completedDate` (sai)
- ✅ Backend: `actualCompletionDate` (đúng)

### 5. **ServiceCenterRequest**

- ❌ Frontend cũ: `phoneNumber` (sai)
- ✅ Backend: `phone` (đúng)
- ❌ Frontend cũ: `email?: string` (sai - optional)
- ✅ Backend: `email: string` (đúng - required)

### 6. **PartRequest**

- ❌ Frontend cũ: `serialNumber` (sai)
- ✅ Backend: `partSerialNumber` (đúng)
- ❌ Frontend cũ: `manufacturerDate` (sai)
- ✅ Backend: `productionDate` (đúng)
- ❌ Frontend cũ: `warranty_months` (sai)
- ✅ Backend: `warrantyPeriod` (đúng) - là LocalDate, không phải số tháng!

### 7. **PartTypeRequest**

- ❌ Frontend cũ: `typeName` (sai)
- ✅ Backend: `name` (đúng)
- ❌ Frontend cũ: `warranty_months: number` (sai)
- ✅ Backend: KHÔNG CÓ field này trong PartTypeRequest

### 8. **InstalledPartRequest**

- ❌ Frontend cũ: `serialNumber` (sai)
- ✅ Backend: `partSerialNumber` (đúng)
- ❌ Frontend cũ: `installDate` (sai)
- ✅ Backend: `installationDate` (đúng)
- ❌ Frontend cũ: `installedBy?: number` (sai)
- ✅ Backend: KHÔNG CÓ field này

### 9. **VehicleSearchRequest**

- ❌ Frontend cũ: `licensePlate` (sai)
- ✅ Backend: `serialNumber` (đúng)
- ❌ Frontend cũ: `phoneNumber` (sai)
- ✅ Backend: KHÔNG CÓ field này

### 10. **UserUpdateRequest**

- ❌ Frontend cũ: Hầu hết fields optional (sai)
- ✅ Backend: `email` và `phone` là REQUIRED (@NotBlank)
- ➕ Backend thêm: `username`, `password`, `image`, `roleId`, `serviceCenterId`

## 🔧 Cách Kiểm Tra Chi Tiết

### Bước 1: Mở File Backend

```bash
# Windows PowerShell
cd "d:\New folder (2)\be\FA25_SWP391_SE1818_G6\EVWarrantyHub\src\main\java\swp391\evwarrantyhub\dto\request"

# Xem danh sách tất cả request DTOs
dir
```

### Bước 2: So Sánh Từng Field

**Backend (Java):**

```java
@Data
public class LoginRequest {
    @NotBlank(message = "USERNAME_REQUIRED")
    String username;  // ← Field này

    @NotBlank(message = "PASSWORD_REQUIRED")
    String password;  // ← Field này
}
```

**Frontend (TypeScript):**

```typescript
interface LoginCredentials {
  username: string; // ← Phải khớp tên
  password: string; // ← Phải khớp tên
}
```

### Bước 3: Kiểm Tra Validation

**Các annotation quan trọng:**

- `@NotBlank` / `@NotNull` → Field REQUIRED (không có `?` trong TypeScript)
- `@Pattern(regexp = "...")` → Phải match regex
- `@Size(min = X, max = Y)` → Giới hạn độ dài
- `@Positive` → Phải > 0
- `@PastOrPresent` / `@Future` → Kiểm tra ngày tháng

**Ví dụ:**

```java
@NotBlank(message = "EMAIL_REQUIRED")  // ← Required field
@Pattern(regexp = "^[A-Za-z0-9._%+-]+@...", message = "INVALID_EMAIL_FORMAT")
String email;
```

→ Frontend phải là: `email: string` (không có `?`)

### Bước 4: Kiểm Tra Kiểu Dữ Liệu

**Mapping Java → TypeScript:**

- `String` → `string`
- `Integer` / `int` → `number`
- `Boolean` / `boolean` → `boolean`
- `LocalDate` / `LocalDateTime` → `string` (ISO format: "2024-10-29")
- `List<T>` / `T[]` → `T[]`

## 📝 Checklist Khi Thêm API Mới

- [ ] Kiểm tra tên file DTO trong backend (`dto/request/`)
- [ ] Kiểm tra tên từng field (case-sensitive!)
- [ ] Kiểm tra kiểu dữ liệu (String → string, Integer → number)
- [ ] Kiểm tra required/optional (`@NotBlank` → không có `?`)
- [ ] Kiểm tra LocalDate → dùng `string` trong TypeScript
- [ ] Kiểm tra validation rules (min, max, pattern)
- [ ] Test với Postman hoặc curl để đảm bảo payload đúng

## 🚀 Quick Commands

```powershell
# Tìm tất cả Request DTOs
Get-ChildItem -Path "d:\New folder (2)\be\FA25_SWP391_SE1818_G6\EVWarrantyHub\src\main\java\swp391\evwarrantyhub\dto\request" -Filter "*.java"

# Tìm tất cả Response DTOs
Get-ChildItem -Path "d:\New folder (2)\be\FA25_SWP391_SE1818_G6\EVWarrantyHub\src\main\java\swp391\evwarrantyhub\dto\response" -Filter "*.java"

# Search field name trong tất cả DTOs
Select-String -Path "d:\New folder (2)\be\FA25_SWP391_SE1818_G6\EVWarrantyHub\src\main\java\swp391\evwarrantyhub\dto\request\*.java" -Pattern "phoneNumber"
```

## ✅ Trạng Thái Hiện Tại

Tất cả interfaces trong `src/utility/index.ts` đã được cập nhật đồng bộ với backend DTOs (ngày 29/10/2025).

**File đã sửa:**

- ✅ `src/utility/index.ts` - Tất cả interfaces đã khớp với backend

**Các thay đổi chính:**

- ✅ 10 interfaces đã được sửa field names
- ✅ Thêm/xóa fields theo backend requirements
- ✅ Sửa required/optional theo validation annotations
- ✅ Thêm comments đường dẫn đến file backend tương ứng
