// ============================================
// 🔐 AUTHENTICATION & AUTHORIZATION CONSTANTS
// ============================================

/**
 * Role constants matching backend Role entity
 * Backend: FA25_SWP391_SE1818_G6/EVWarrantyHub/entity/Role.java
 */
export const ROLES = {
  ADMIN: "ADMIN",
  EVM_STAFF: "EVM_STAFF",
  SC_STAFF: "SC_STAFF",
  SC_TECHNICIAN: "SC_TECHNICIAN",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

/**
 * Home route mapping for each role after login
 * Maps role -> default dashboard route
 */
export const ROLE_HOME_ROUTES: Record<string, string> = {
  [ROLES.ADMIN]: "/admin/dashboard",
  [ROLES.EVM_STAFF]: "/evm/dashboard",
  [ROLES.SC_STAFF]: "/", // Currently SC_STAFF uses home page
  [ROLES.SC_TECHNICIAN]: "/technician/dashboard",
};

/**
 * Permissions for each role
 * Used by AuthContext.hasPermission() to check authorization
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.ADMIN]: [
    "manage_users",
    "manage_system",
    "view_all_data",
    "manage_products",
    "manage_parts",
    "approve_warranty",
    "manage_campaigns",
    "view_reports",
    "create_staff_accounts",
    "delete_users",
    "edit_system_settings",
  ],
  [ROLES.EVM_STAFF]: [
    "manage_products",
    "manage_parts",
    "approve_warranty",
    "reject_warranty",
    "manage_campaigns",
    "view_reports",
    "manage_supply_chain",
    "view_warranty_claims",
    "export_reports",
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
  [ROLES.ADMIN]: "Quản trị viên",
  [ROLES.EVM_STAFF]: "Nhân viên hãng xe",
  [ROLES.SC_STAFF]: "Nhân viên trung tâm",
  [ROLES.SC_TECHNICIAN]: "Kỹ thuật viên",
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  [ROLES.ADMIN]: "Quản trị viên hệ thống",
  [ROLES.EVM_STAFF]: "Nhân viên hãng xe điện",
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
// 🎯 EXPORT ALL
// ============================================

export default {
  ROLES,
  ROLE_HOME_ROUTES,
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
};
