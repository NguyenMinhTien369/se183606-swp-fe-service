const ROUTERS_PATH = {
  HOME: "/",

  // Admin Routes
  ADMIN_BASE: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_ROLE_PERMISSIONS: "/admin/role-permissions",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_WARRANTY_APPROVAL: "/admin/warranty-approval",

  // EVM Staff Routes
  EVM_BASE: "/evm",
  EVM_DASHBOARD: "/evm/dashboard",
  EVM_CAMPAIGNS: "/evm/campaigns",
  EVM_WARRANTY_CLAIMS: "/evm/warranty-claims",

  // Auth Routes
  LOGIN: "/login",
  RESET_PASSWORD: "/reset-password",
  UNAUTHORIZED: "/unauthorized",

  // SC Staff Routes
  SC_STAFF_BASE: "/sc-staff",
  SC_STAFF_DASHBOARD: "/sc-staff/dashboard",

  //F1 - Manage Customer
  MANAGE_CUSTOMER: "/sc-staff/manage-customer",
  MANAGE_CUSTOMER_DETAIL: "/sc-staff/manage-customer/:customerId", // Dynamic route
  VEHICLE_INFORMATION: "/sc-staff/manage-customer/vehicle-information",
  SERVICE_HISTORY: "/sc-staff/manage-customer/service-history",
  PARTS_MANAGEMENT: "/sc-staff/manage-customer/parts-management",
  CUSTOMER_SEARCH: "/sc-staff/manage-customer/search",

  //F2 - Internal Management
  INTERNAL_MANAGEMENT: "/sc-staff/internal-management",

  // SC Technician Routes
  TECHNICIAN_BASE: "/technician",
  SC_TECHNICIAN_DASHBOARD: "/technician/dashboard",
  CREATE_WARRANTY: "/technician/create-warranty",
  CONDUCT_WARRANTY: "/technician/conduct-warranty",
} as const;

// Helper để tạo relative paths (không có base path)
export const RELATIVE_PATHS = {
  // SC Staff
  DASHBOARD: "dashboard",
  MANAGE_CUSTOMER: "manage-customer",
  MANAGE_CUSTOMER_PARAM: "manage-customer/:customerId",
  INTERNAL_MANAGEMENT: "internal-management",

  // Customer Management Tabs
  VEHICLE_INFORMATION: "vehicle-information",
  SERVICE_HISTORY: "service-history",
  PARTS_MANAGEMENT: "parts-management",

  // Technician
  CREATE_WARRANTY: "create-warranty",
  CONDUCT_WARRANTY: "conduct-warranty",

  // Admin
  USERS: "users",
  PRODUCTS: "products",
  WARRANTY_APPROVAL: "warranty-approval",

  // EVM
  CAMPAIGNS: "campaigns",
  WARRANTY_CLAIMS: "warranty-claims",
} as const;

export default ROUTERS_PATH;
