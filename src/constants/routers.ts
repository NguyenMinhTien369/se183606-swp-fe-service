const ROUTERS_PATH = {
  HOME: "/",

  // Admin Routes
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_ROLE_PERMISSIONS: "/admin/role-permissions",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_WARRANTY_APPROVAL: "/admin/warranty-approval",

  // EVM Staff Routes
  EVM_DASHBOARD: "/evm/dashboard",
  EVM_CAMPAIGNS: "/evm/campaigns",
  EVM_WARRANTY_CLAIMS: "/evm/warranty-claims",

  // SC Staff Routes
  SC_STAFF_DASHBOARD: "/sc-staff/dashboard",
  MANAGE_CUSTOMER: "/sc-staff/manage-customer",
  CUSTOMER_SEARCH: "/sc-staff/manage-customer/search",
  INTERNAL_MANAGEMENT: "/sc-staff/internal-management",

  // SC Technician Routes
  SC_TECHNICIAN_DASHBOARD: "/technician/dashboard",
  CREATE_WARRANTY: "/technician/create-warranty",
  CONDUCT_WARRANTY: "/technician/conduct-warranty",

  // Auth Routes
  LOGIN: "/login",
  RESET_PASSWORD: "/reset-password",
  UNAUTHORIZED: "/unauthorized",
} as const;

export default ROUTERS_PATH;
