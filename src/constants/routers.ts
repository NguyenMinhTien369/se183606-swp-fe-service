import { WARRANTY_CLAIM_STATUS } from "@/utils/constants";

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
  //Kiểm tra lại phần này, xóa đi nếu không dùng
  MANAGE_CUSTOMER: "/sc-staff/manage-customer",
  MANAGE_CUSTOMER_DETAIL: "/sc-staff/manage-customer/:customerId", // Dynamic route
  VEHICLE_INFORMATION: "/sc-staff/manage-customer/vehicle-information",
  SERVICE_HISTORY: "/sc-staff/manage-customer/service-history",
  PARTS_MANAGEMENT: "/sc-staff/manage-customer/parts-management",
  CUSTOMER_SEARCH: "/sc-staff/manage-customer/search",
  SERVICE_HISTORY_ALL: "/sc-staff/service-history-all",

  //F2 - Internal Management
  INTERNAL_MANAGEMENT: "/sc-staff/internal-management",

  // SC Technician Routes
  TECHNICIAN_BASE: "/technician",
  SC_TECHNICIAN_DASHBOARD: "/technician/dashboard",
  MANAGE_WARRANTY: "/technician/manage-warranty",
  CREATE_WARRANTY: "/technician/create-warranty",
  CONDUCT_WARRANTY: "/technician/conduct-warranty",
} as const;

export const RELATIVE_PATHS = {
  // SC Staff
  DASHBOARD: "dashboard",
  MANAGE_CUSTOMER: "manage-customer",
  MANAGE_CUSTOMER_PARAM: "manage-customer/:customerId",

  //F2 - Internal Management
  INTERNAL_MANAGEMENT: "internal-management",
  WARRANTY_REQUEST: "warranty-request",
  ASSIGN_TECHNICIAN: "assign-technician",
  PROGRESS: "progress",
  SERVICE_HISTORY_ALL: "service-history-all",

  // Customer Management Tabs
  VEHICLE_INFORMATION: "vehicle-information",
  SERVICE_HISTORY: "service-history",
  PARTS_MANAGEMENT: "parts-management",

  // Technician
  //F3 - Create Warranty
  MANAGE_WARRANTY: "manage-warranty",
  CREATE_WARRANTY: "create-warranty",
  WARRANTY_LIST: "warranty-list",
  MANUFACTURER_RESPONSE_PANEL: "manufacturer-response-panel",

  //F4 - Conduct Warranty
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
