# 🔐 Authentication Flow Guide

## 📋 Tổng Quan

Hệ thống authentication của EVWarrantyHub sử dụng JWT (JSON Web Token) để xác thực và phân quyền người dùng.

### 🏗️ Kiến Trúc

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│ LoginForm   │─────▶│ AuthContext  │─────▶│ Backend API │
│ (UI Layer)  │      │ (State Mgmt) │      │ (Auth)      │
└─────────────┘      └──────────────┘      └─────────────┘
      │                     │                      │
      │                     │                      │
      ▼                     ▼                      ▼
  User Input          JWT Storage            Token Validation
                      Role Extraction         User Data
```

---

## 🚀 Luồng Đăng Nhập (Login Flow)

### 1️⃣ **User nhập credentials**

```tsx
// LoginFormt.tsx
const [formData, setFormData] = useState({
  username: "",
  password: "",
});
```

### 2️⃣ **Submit form → gọi login()**

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const result = await login(formData); // AuthContext.login()

  if (result.success) {
    // Extract role và navigate
    const roleKey = roleName.replace("ROLE_", "");
    navigate(ROLE_HOME_ROUTES[roleKey]);
  }
};
```

### 3️⃣ **AuthContext gọi Backend API**

```tsx
// AuthContext.tsx
const login = async (credentials: LoginCredentials) => {
  const response = await authAPI.login(credentials);
  const token = response.data.result.token;

  // Lưu token vào localStorage
  localStorage.setItem("accessToken", token);

  // Decode JWT để lấy user info
  const decodedToken = decodeJWT(token);
  const userData = {
    userId: decodedToken.userId,
    username: decodedToken.sub,
    role: { roleName: decodedToken.role },
  };

  setUser(userData);
  return { success: true, user: userData };
};
```

### 4️⃣ **Backend trả về JWT Token**

**Backend Response Structure:**

```json
{
  "code": 0,
  "message": "Login successful",
  "result": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "authenticated": true
  }
}
```

**Decoded JWT Payload:**

```json
{
  "sub": "admin",
  "userId": 1,
  "email": "admin@evhub.com",
  "fullName": "System Admin",
  "role": "ADMIN",
  "exp": 1735516800,
  "iat": 1735430400
}
```

### 5️⃣ **Điều hướng theo Role**

```typescript
// constants.ts
export const ROLE_HOME_ROUTES = {
  ADMIN: "/admin/dashboard",
  EVM_STAFF: "/evm/dashboard",
  SC_STAFF: "/",
  SC_TECHNICIAN: "/technician/dashboard",
};
```

---

## 🔑 JWT Token Management

### **Decode JWT Token**

```typescript
const decodeJWT = (token: string): any => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
};
```

### **Check Token Expiration**

```typescript
const checkAuth = async () => {
  const token = localStorage.getItem("accessToken");
  const decodedToken = decodeJWT(token);

  // Kiểm tra token có hết hạn không
  const currentTime = Date.now() / 1000;
  if (decodedToken.exp < currentTime) {
    localStorage.clear(); // Token hết hạn
    return;
  }

  setUser(userData); // Token còn hạn
};
```

---

## 🛡️ Authorization (Phân Quyền)

### **Role-Based Access Control**

```typescript
// constants.ts
export const ROLES = {
  ADMIN: 'ADMIN',
  EVM_STAFF: 'EVM_STAFF',
  SC_STAFF: 'SC_STAFF',
  SC_TECHNICIAN: 'SC_TECHNICIAN',
};

export const ROLE_PERMISSIONS = {
  ADMIN: ['manage_users', 'manage_system', 'view_all_data', ...],
  EVM_STAFF: ['manage_products', 'approve_warranty', ...],
  SC_STAFF: ['manage_customers', 'create_warranty_claim', ...],
  SC_TECHNICIAN: ['execute_warranty', 'view_assigned_claims', ...],
};
```

### **Check Permissions in Components**

```tsx
import { useAuth } from "@/pages/Login/feature/AuthContext";

function SomeComponent() {
  const { hasRole, hasPermission } = useAuth();

  // Check role
  if (hasRole("ADMIN")) {
    // Render admin features
  }

  // Check specific permission
  if (hasPermission("manage_users")) {
    // Show user management button
  }
}
```

### **Protected Routes**

```tsx
// Example: ProtectedRoute component
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, hasAnyRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!hasAnyRole(allowedRoles)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

// Usage
<Route
  path="/admin/*"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>;
```

---

## 📦 File Structure

```
src/
├── pages/
│   └── Login/
│       ├── LoginFormt.tsx          # UI Login form (Tailwind CSS)
│       └── feature/
│           └── AuthContext.tsx     # Authentication logic & state
├── utils/
│   └── constants.ts                # ROLES, PERMISSIONS, ROUTES
└── utility/
    ├── axios.ts                    # Axios instance config
    └── index.ts                    # authAPI definitions
```

---

## 🔧 API Endpoints

### **Login**

```typescript
authAPI.login(credentials: LoginCredentials)
// POST /api/auth/login
// Body: { username, password }
// Response: { code, message, result: { token, authenticated } }
```

### **Introspect Token** (Verify)

```typescript
authAPI.introspect(token: string)
// POST /api/auth/introspect
// Body: { token }
// Response: { code, message, result: { valid, ... } }
```

### **🚧 Coming Soon:**

- `authAPI.logout()` - Logout endpoint
- `authAPI.forgotPassword(email)` - Password reset
- `authAPI.resetPassword(token, newPassword)` - Change password

---

## 🎨 UI Components (Tailwind CSS)

### **LoginFormt.tsx**

**Features:**

- ✅ Responsive design (mobile + desktop)
- ✅ Gradient background with geometric shapes
- ✅ Form validation
- ✅ Loading states
- ✅ Error messages
- ✅ Icon inputs (FaUser, FaLock from react-icons)

**Tailwind Classes:**

```tsx
// Container
className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"

// Card
className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl"

// Button
className="w-full bg-gradient-to-r from-blue-600 to-indigo-600
           text-white font-semibold py-3 px-6 rounded-lg
           hover:from-blue-700 hover:to-indigo-700"
```

---

## 📊 State Management

### **AuthContext Provider**

```tsx
// App.tsx or main.tsx
import { AuthProvider } from "@/pages/Login/feature/AuthContext";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
```

### **useAuth Hook**

```tsx
const {
  user, // User object
  loading, // Loading state
  isAuthenticated, // Boolean
  role, // Current role (string)
  login, // Login function
  logout, // Logout function
  hasRole, // Check role
  hasPermission, // Check permission
  hasAnyRole, // Check multiple roles
} = useAuth();
```

---

## 🧪 Testing Login Flow

### **Test Accounts (Backend Default)**

| Username  | Password | Role          | Description            |
| --------- | -------- | ------------- | ---------------------- |
| admin     | admin123 | ADMIN         | Quản trị viên hệ thống |
| evm_staff | evm123   | EVM_STAFF     | Nhân viên hãng xe điện |
| sc_staff  | sc123    | SC_STAFF      | Nhân viên trung tâm    |
| sc_tech   | tech123  | SC_TECHNICIAN | Kỹ thuật viên          |

### **Test Scenarios**

1. ✅ Login với credentials hợp lệ → Navigate to role-based dashboard
2. ✅ Login với credentials sai → Show error message
3. ✅ Token expiration → Auto logout
4. ✅ Protected routes → Redirect to login if not authenticated
5. ✅ Role-based access → Show/hide features based on permissions

---

## 🐛 Troubleshooting

### **Problem: "Cannot find name 'styles'"**

**Solution:** ✅ Đã migrate sang Tailwind CSS, xóa imports CSS Module

### **Problem: "ROLE_HOME_ROUTES not found"**

**Solution:** ✅ Đã tạo `src/utils/constants.ts` với đầy đủ constants

### **Problem: Backend trả "ROLE_ADMIN" nhưng frontend expect "ADMIN"**

**Solution:** ✅ AuthContext đã xử lý `.replace("ROLE_", "")` để normalize role

### **Problem: Login thành công nhưng không navigate**

**Solution:** Check console logs trong `handleSubmit()` để debug role mapping

---

## 📝 TODO / Future Improvements

- [ ] Implement **Refresh Token** flow để tự động renew access token
- [ ] Add **Remember Me** checkbox để lưu credentials
- [ ] Implement **Forgot Password** flow khi backend API ready
- [ ] Add **2FA (Two-Factor Authentication)** cho ADMIN role
- [ ] Add **Session timeout** warning popup
- [ ] Implement **Auto logout** khi user idle quá lâu
- [ ] Add **Login history** tracking
- [ ] Add **Device management** (logout from other devices)

---

## 🔗 Related Files

1. **Authentication:**

   - `src/pages/Login/LoginFormt.tsx`
   - `src/pages/Login/feature/AuthContext.tsx`

2. **Configuration:**

   - `src/utils/constants.ts`
   - `src/utility/axios.ts`
   - `src/utility/index.ts`

3. **Backend:**
   - `FA25_SWP391_SE1818_G6/EVWarrantyHub/controller/AuthenticationController.java`
   - `FA25_SWP391_SE1818_G6/EVWarrantyHub/entity/User.java`
   - `FA25_SWP391_SE1818_G6/EVWarrantyHub/entity/Role.java`

---

## ✅ Summary

| Component       | Status  | Description                       |
| --------------- | ------- | --------------------------------- |
| LoginFormt.tsx  | ✅ Done | Tailwind CSS UI, TypeScript typed |
| AuthContext.tsx | ✅ Done | JWT handling, role management     |
| constants.ts    | ✅ Done | ROLES, PERMISSIONS, ROUTES        |
| API Integration | ✅ Done | authAPI.login() working           |
| Role Navigation | ✅ Done | ROLE_HOME_ROUTES mapping          |

**Last Updated:** October 29, 2025  
**Version:** 1.0.0
