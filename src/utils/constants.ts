// ============================================
// 🔐 AUTHENTICATION & AUTHORIZATION CONSTANTS
// ============================================

/**
 * Role constants matching backend Role entity
 * Backend: FA25_SWP391_SE1818_G6/EVWarrantyHub/entity/Role.java
 */
export const ROLES = {
  ADMIN: "ROLE_ADMIN",
  EVM_STAFF: "ROLE_EVM_STAFF",
  SC_STAFF: "ROLE_SC_STAFF",
  SC_TECHNICIAN: "ROLE_SC_TECHNICIAN",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

/**
 * Home route mapping for each role after login
 * Maps role -> default dashboard route (first route in array)
 */
export const ROLE_HOME_ROUTES: Record<string, string> = {
  [ROLES.ADMIN]: "/admin/dashboard", // Admin Dashboard
  [ROLES.EVM_STAFF]: "/evm/dashboard", // EVM Staff Dashboard
  [ROLES.SC_STAFF]: "/sc-staff/dashboard", // SC Staff Dashboard
  [ROLES.SC_TECHNICIAN]: "/technician/dashboard", // Technician Dashboard
};

/**
 * All accessible routes for each role
 * Maps role -> array of accessible routes
 */
export const ROLE_ACCESSIBLE_ROUTES: Record<string, string[]> = {
  [ROLES.ADMIN]: [
    "/admin/dashboard", // Admin Dashboard
    "/admin/users", // Quản lý users
    "/admin/role-permissions", // Quản lý phân quyền
    "/admin/products", // Quản lý products
    "/admin/warranty-approval", // Duyệt bảo hành
  ],
  [ROLES.EVM_STAFF]: [
    "/evm/dashboard", // EVM Dashboard
    "/evm/products", // Quản lý products
    "/evm/campaigns", // Quản lý chiến dịch
    "/evm/warranty-approval", // Duyệt bảo hành
  ],
  [ROLES.SC_STAFF]: [
    "/sc-staff/dashboard", // SC Staff Dashboard
    "/sc-staff/manage-customer", // Quản lý khách hàng
    "/sc-staff/internal-management", // Quản lý nội bộ
    "/technician/create-warranty", // Tạo bảo hành
    "/technician/conduct-warranty", // Thực hiện bảo hành
  ],
  [ROLES.SC_TECHNICIAN]: [
    "/technician/dashboard", // Technician Dashboard
    "/technician/create-warranty", // Tạo bảo hành
    "/technician/conduct-warranty", // Thực hiện bảo hành
  ],
};

/**
 * Permissions for each role
 * Used by AuthContext.hasPermission() to check authorization
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.ADMIN]: [
    "manage_all_users",
    "manage_roles",
    "manage_products",
    "manage_vehicles",
    "manage_service_centers",
    "approve_warranty_claims",
    "manage_system_settings",
  ],
  [ROLES.EVM_STAFF]: [
    "manage_campaigns",
    "manage_products",
    "view_warranty_claims",
    "manage_parts",
    "view_reports",
  ],
  [ROLES.SC_STAFF]: [
    "manage_customers",
    "manage_vehicles",
    "create_warranty_claim",
    "view_warranty_claims",
    "assign_technician",
    "view_warranty_history",
    "view_service_history",
    "manage_installed_parts",
  ],
  [ROLES.SC_TECHNICIAN]: [
    "view_assigned_claims",
    "execute_warranty",
    "update_claim_status",
    "complete_warranty",
    "view_parts_inventory",
    "request_parts",
  ],
};

/**
 * Role display names in Vietnamese
 */
export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  [ROLES.SC_STAFF]: "Nhân viên trung tâm",
  [ROLES.SC_TECHNICIAN]: "Kỹ thuật viên",
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  [ROLES.SC_STAFF]: "Nhân viên trung tâm dịch vụ",
  [ROLES.SC_TECHNICIAN]: "Kỹ thuật viên trung tâm dịch vụ",
};

// ============================================
// 🎨 UI CONSTANTS
// ============================================

/**
 * Toast notification durations (milliseconds)
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
} as const;

/**
 * Debounce delays (milliseconds)
 */
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 150,
} as const;

// ============================================
// 📝 VALIDATION CONSTANTS
// ============================================

/**
 * Input validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10,11}$/,
  VIN: /^[A-HJ-NPR-Z0-9]{17}$/i, // Standard VIN format
  LICENSE_PLATE: /^[0-9]{2}[A-Z]{1,2}[0-9]{4,5}$/i, // Vietnamese format
} as const;

/**
 * Input length constraints
 */
export const INPUT_LIMITS = {
  USERNAME: { min: 3, max: 50 },
  PASSWORD: { min: 6, max: 100 },
  PHONE: { min: 10, max: 11 },
  EMAIL: { max: 100 },
  ADDRESS: { max: 255 },
  DESCRIPTION: { max: 1000 },
} as const;

// ============================================
// 🔢 PAGINATION CONSTANTS
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 10,
  SIZE_OPTIONS: [5, 10, 20, 50, 100],
} as const;

// ============================================
// 📊 STATUS CONSTANTS
// ============================================

/**
 * Warranty claim status
 * Should match backend WarrantyClaimStatus enum
 */
export const WARRANTY_CLAIM_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const WARRANTY_CLAIM_STATUS_DISPLAY: Record<string, string> = {
  PENDING: "Chờ xử lý",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  IN_PROGRESS: "Đang xử lý",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

// ============================================
// 🛠️ HELPER FUNCTIONS
// ============================================

/**
 * Check if a role can access a specific route
 * @param role - User's role (e.g., "SC_STAFF")
 * @param route - Route path to check
 * @returns boolean - true if role can access the route
 *
 * @example
 * canAccessRoute("SC_STAFF", "/ManageCustomer") // true
 * canAccessRoute("SC_TECHNICIAN", "/ManageCustomer") // false
 */
export const canAccessRoute = (role: string, route: string): boolean => {
  const accessibleRoutes = ROLE_ACCESSIBLE_ROUTES[role] || [];
  return accessibleRoutes.includes(route);
};

/**
 * Get all accessible routes for a role
 * @param role - User's role
 * @returns string[] - Array of accessible route paths
 */
export const getAccessibleRoutes = (role: string): string[] => {
  return ROLE_ACCESSIBLE_ROUTES[role] || [];
};

/**
 * Get default home route for a role
 * @param role - User's role
 * @returns string - Default route path (first route in accessible routes)
 */
export const getHomeRoute = (role: string): string => {
  return ROLE_HOME_ROUTES[role] || "/";
};

// ============================================
// 🎯 EXPORT ALL
// ============================================

export default {
  ROLES,
  ROLE_HOME_ROUTES,
  ROLE_ACCESSIBLE_ROUTES,
  ROLE_PERMISSIONS,
  ROLE_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
  TOAST_DURATION,
  DEBOUNCE_DELAY,
  VALIDATION_PATTERNS,
  INPUT_LIMITS,
  PAGINATION,
  WARRANTY_CLAIM_STATUS,
  WARRANTY_CLAIM_STATUS_DISPLAY,
  canAccessRoute,
  getAccessibleRoutes,
  getHomeRoute,
};
