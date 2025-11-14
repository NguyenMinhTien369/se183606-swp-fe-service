import axiosInstance from "./axios";

// Lưu ý: Các API dưới đây đã được chuẩn hóa theo backend hiện tại trong EVWarrantyHub.
// Những endpoint chưa có ở backend đã được gỡ bỏ hoặc thay đổi cho phù hợp.

// ==================== TYPE DEFINITIONS ====================
// Tất cả interfaces dưới đây đồng bộ với backend DTOs tại:

// Auth & User (LoginRequest.java)
interface LoginCredentials {
  username: string;
  password: string;
}

// UserRegisterRequest.java - Backend yêu cầu roleId và serviceCenterId
interface UserRegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string; // Backend dùng 'phone' không phải 'phoneNumber'
  roleId: number; // Required trong backend
  serviceCenterId?: number;
}

// UserUpdateRequest.java - Backend có thêm nhiều fields
interface UserUpdateRequest {
  username?: string;
  password?: string;
  fullName?: string;
  email: string; // Required trong backend (@NotBlank)
  phone: string; // Required trong backend (@NotBlank)
  image?: string;
  roleId?: number;
  serviceCenterId?: number;
}

// VerifyOtpRequest.java - Backend dùng 'otpCode' không phải 'otp'
interface VerifyOtpRequest {
  email: string;
  otpCode: string; // Backend field name là 'otpCode'
}

// ResetPasswordRequest.java - Backend yêu cầu confirmPassword
interface ResetPasswordRequest {
  email: string;
  otpCode: string; // Backend dùng 'otpCode'
  newPassword: string;
  confirmPassword: string; // Required trong backend
}

// AssignTechnicianRequest.java - Backend expects array of technician IDs
interface AssignTechnicianRequest {
  claimID: number;
  technicianIDs: number[]; // Backend expects List<Integer> - min 1, max 4 technicians
  expectedCompletionDate?: string; // LocalDate trong backend
  internalNotes?: string; // Backend dùng 'internalNotes'
}

// UpdateAssignmentRequest.java - Backend yêu cầu multipart/form-data
// Không cần interface, sử dụng FormData trực tiếp khi gọi updateAssignmentProgress()

// CreateServiceCenterRequest.java - Backend dùng 'phone' không phải 'phoneNumber'
interface ServiceCenterRequest {
  name: string;
  phone: string; // Backend dùng 'phone'
  email: string; // Required trong backend
  address: string;
}

// CreatePartRequest.java - Backend có cấu trúc khác
interface PartRequest {
  partSerialNumber: string; // Backend dùng 'partSerialNumber'
  partTypeID: number;
  productionDate: string; // LocalDate - backend dùng 'productionDate'
  warrantyPeriod: string; // LocalDate - backend dùng 'warrantyPeriod'
}

// PartUpdateRequest.java - Khớp với backend
interface PartUpdateRequest {
  partTypeID?: number;
  productionDate?: string; // LocalDate
  warrantyPeriod?: string; // LocalDate
}

// PartTypeRequest.java - Backend dùng 'name' không phải 'typeName'
interface PartTypeRequest {
  name: string; // Backend dùng 'name'
  description?: string;
  // Backend KHÔNG có warranty_months trong PartTypeRequest
}

// InstalledPartRequest.java - Backend dùng tên field khác
interface InstalledPartRequest {
  vin: string;
  partSerialNumber: string; // Backend dùng 'partSerialNumber'
  installationDate: string; // LocalDate - backend dùng 'installationDate'
}

// VehicleSearchRequest.java - Backend dùng 'serialNumber' thay vì 'licensePlate'
interface VehicleSearchRequest {
  vin?: string;
  serialNumber?: string; // Backend dùng 'serialNumber'
  // Backend KHÔNG có phoneNumber
}

// CustomerRequest.java - Tạo/cập nhật customer
interface CustomerRequest {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
}

// Search params cho customers
interface CustomerSearchParams {
  name?: string;
  phone?: string;
  vin?: string;
}

// Search params cho claim assignments
interface SearchAssignmentsParams {
  serviceCenterID: number;
  searchKeyword?: string;
  status?: string;
}

// ServiceHistoryRequest.java - Tạo service history
interface ServiceHistoryRequest {
  vin: string;
  serviceCenterID: number;
  serviceDate: string; // LocalDate
  serviceType: string;
  description?: string;
  cost?: number;
}

// VehicleRequest.java - Đăng ký xe mới
interface VehicleRequest {
  vin: string;
  customerID: number;
  modelID: number;
  licensePlate: string;
  batteryCapacity: number;
  image?: string;
  registrationDate: string | number[]; // LocalDate - can be string "YYYY-MM-DD" or array [year, month, day]
}

// ProductModelRequest.java - Tạo product model
interface ProductModelRequest {
  modelName: string;
  productionYear: number;
  warrantyPeriod: number; // months
  description?: string;
  color?: string; // Optional field for compatibility
}

// ==================== AUTH API ====================
// Backend: AuthenticationController.java
// Path: /api/auth/*
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    axiosInstance.post("/auth/login", credentials),
  introspect: (token: string) =>
    axiosInstance.post("/auth/introspect", { token }),
  logout: () => axiosInstance.post("/users/logout"), // API logout từ backend UserController
  // Reset Password Flow
  forgotPassword: (email: string) =>
    axiosInstance.post("/users/forgot-password", { email }),
  verifyOtp: (payload: VerifyOtpRequest) =>
    axiosInstance.post("/users/verify-otp", payload),
  resetPassword: (payload: ResetPasswordRequest) =>
    axiosInstance.post("/users/reset-password", payload),
};

// ==================== USER API ====================
// Backend: UserController.java
// Path: /api/users/*
export const userAPI = {
  // User management (ADMIN only for register/getAll/delete)
  createUser: (userData: UserRegisterRequest) =>
    axiosInstance.post("/users/register", userData),
  getAllUsers: () => axiosInstance.get("/users"),
  getUsers: () => axiosInstance.get("/users"), // Alias for compatibility
  updateUser: (id: number, userData: UserUpdateRequest) =>
    axiosInstance.put(`/users/${id}`, userData),
  deleteUser: (id: number) => axiosInstance.delete(`/users/${id}`),

  // Authentication & Password recovery
  logout: () => axiosInstance.post("/users/logout"),
  forgotPassword: (email: string) =>
    axiosInstance.post("/users/forgot-password", { email }),
  verifyOtp: (payload: VerifyOtpRequest) =>
    axiosInstance.post("/users/verify-otp", payload),
  resetPassword: (payload: ResetPasswordRequest) =>
    axiosInstance.post("/users/reset-password", payload),
};

// ==================== WARRANTY CLAIM API ====================
// Backend: WarrantyClaimController.java
// Path: /api/warranty-claims/*
export const warrantyClaimAPI = {
  // Lấy thông tin xe theo VIN (được backend cung cấp dưới warranty-claims)
  getVehicleInfoByVin: (vin: string) =>
    axiosInstance.get("/warranty-claims/vehicle-info", { params: { vin } }),

  // Lấy TẤT CẢ claims (ADMIN only)
  getAllClaims: () => axiosInstance.get("/warranty-claims"),

  // Lấy claims theo trạng thái (ADMIN, EVM_STAFF)
  getClaimsByStatus: (status: string) =>
    axiosInstance.get(`/warranty-claims/status/${status}`),

  // Lấy danh sách claim theo Service Center (SC_STAFF)
  getClaimsByServiceCenter: (serviceCenterID: number) =>
    axiosInstance.get(`/warranty-claims/service-center/${serviceCenterID}`),

  getClaimById: (id: number) => axiosInstance.get(`/warranty-claims/${id}`),

  // Backend yêu cầu multipart/form-data cho tạo/cập nhật claim
  createClaim: (formData: FormData) =>
    axiosInstance.post("/warranty-claims", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateClaim: (id: number, formData: FormData) =>
    axiosInstance.put(`/warranty-claims/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteClaim: (id: number) => axiosInstance.delete(`/warranty-claims/${id}`),

  submitClaim: (id: number) =>
    axiosInstance.post(`/warranty-claims/${id}/submit`),
  //API  của table  phân công kỹ thuật viên
  getUnassignedClaims: () => axiosInstance.get("/warranty-claims/unassigned"),

  syncStatusFromManufacturer: (id: number, status: string, note?: string) => {
    const params = note !== undefined ? { status, note } : { status };
    return axiosInstance.post(`/warranty-claims/${id}/sync-status`, null, {
      params,
    });
  },

  // Giao phụ tùng cho đơn bảo hành đã được chấp nhận
  shipParts: (id: number) =>
    axiosInstance.post(`/warranty-claims/${id}/ship-parts`),

  // Báo thiếu phụ tùng
  reportMissingParts: (id: number, note: string) =>
    axiosInstance.post(`/warranty-claims/${id}/report-missing-parts`, null, {
      params: { note },
    }),
}; // ==================== CLAIM ASSIGNMENT API ====================
// Backend: ClaimAssignmentController.java
// Path: /api/claim-assignments/*
export const claimAssignmentAPI = {
  // Lấy danh sách kỹ thuật viên theo Service Center (SC_STAFF only)
  getTechnicians: () => axiosInstance.get("/claim-assignments/technicians"),

  assignTechnician: (data: AssignTechnicianRequest) =>
    axiosInstance.post("/claim-assignments/assign", data),

  getAssignmentByClaimId: (claimID: number) =>
    axiosInstance.get(`/claim-assignments/claim/${claimID}`),

  getAssignmentsProgress: (serviceCenterID: number) =>
    axiosInstance.get(`/claim-assignments/progress/${serviceCenterID}`),

  getAssignmentsByTechnician: (technicianID: number) =>
    axiosInstance.get(`/claim-assignments/technician/${technicianID}`),

  updateAssignmentProgress: (assignmentID: number, formData: FormData) =>
    axiosInstance.put(`/claim-assignments/${assignmentID}/progress`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteAssignment: (assignmentID: number) =>
    axiosInstance.delete(`/claim-assignments/${assignmentID}`),
  getTechnicianPerformance: (serviceCenterID: number) =>
    axiosInstance.get(`/claim-assignments/performance/${serviceCenterID}`),
  searchAssignments: (params: SearchAssignmentsParams) =>
    axiosInstance.get("/claim-assignments/search", { params }),
};

// ==================== SERVICE CENTER API ====================
// Backend: ServiceCenterController.java
// Path: /api/service-centers/*
export const serviceCenterAPI = {
  getServiceCenters: () => axiosInstance.get("/service-centers"),
  searchServiceCenters: (keyword: string) =>
    axiosInstance.get("/service-centers/search", { params: { keyword } }),
  getServiceCenterById: (id: number) =>
    axiosInstance.get(`/service-centers/${id}`),
  createServiceCenter: (data: ServiceCenterRequest) =>
    axiosInstance.post("/service-centers", data),
  updateServiceCenter: (id: number, data: ServiceCenterRequest) =>
    axiosInstance.put(`/service-centers/${id}`, data),
  deleteServiceCenter: (id: number) =>
    axiosInstance.delete(`/service-centers/${id}`),
};

// ==================== PART API ====================
// Backend: PartController.java
// Path: /api/parts/*
export const partAPI = {
  // Backend dùng serialNumber làm key
  getPartBySerialNumber: (serialNumber: string) =>
    axiosInstance.get(`/parts/${serialNumber}`),
  createPart: (data: PartRequest) => axiosInstance.post("/parts", data),
  updatePart: (serialNumber: string, data: PartUpdateRequest) =>
    axiosInstance.put(`/parts/${serialNumber}`, data),
  deletePart: (serialNumber: string) =>
    axiosInstance.delete(`/parts/${serialNumber}`),
  searchPartsBySerialNumber: (serialNumber: string) =>
    axiosInstance.get("/parts/search", { params: { serialNumber } }),
};

// ==================== PART TYPE API ====================
// Backend: PartTypeController.java
// Path: /api/part-types/*
export const partTypeAPI = {
  getPartTypes: () => axiosInstance.get("/part-types"),
  getPartTypeById: (id: number) => axiosInstance.get(`/part-types/${id}`),
  createPartType: (data: PartTypeRequest) =>
    axiosInstance.post("/part-types", data),
  updatePartType: (id: number, data: PartTypeRequest) =>
    axiosInstance.put(`/part-types/${id}`, data),
  deletePartType: (id: number) => axiosInstance.delete(`/part-types/${id}`),
};

// ==================== INSTALLED PART API ====================
// Backend: InstalledPartController.java
// Path: /api/installed-parts/*
export const installedPartAPI = {
  installPart: (data: InstalledPartRequest) =>
    axiosInstance.post("/installed-parts", data),
  getInstalledPartsByVehicle: (vin: string) =>
    axiosInstance.get(`/installed-parts/vehicle/${vin}`),
  getVehiclesByPart: (serialNumber: string) =>
    axiosInstance.get(`/installed-parts/part/${serialNumber}/vehicles`),
  getLatestInstalledParts: (vin: string) =>
    axiosInstance.get(`/installed-parts/vehicle/${vin}/latest`),
};

// ==================== SERVICE HISTORY API ====================
// Backend: ServiceHistoryController.java
// Path: /api/service-history/*
export const serviceHistoryAPI = {
  // Backend chỉ hỗ trợ lấy theo VIN, không có getByCustomerId
  getAll: () => axiosInstance.get("/service-history"),
  getByVehicleVin: (vin: string) =>
    axiosInstance.get(`/service-history/vehicle/${vin}`),

  // Tạo service history mới
  createServiceHistory: (data: ServiceHistoryRequest) =>
    axiosInstance.post("/service-history", data),

  getByServiceCenter: (id: number) =>
    axiosInstance.get(`/service-history/service-center/${id}`),
};

// ==================== CUSTOMER API ====================
// Backend: CustomerController.java
// Path: /api/customers/*
export const customerAPI = {
  getCustomers: () => axiosInstance.get("/customers"),
  getCustomerById: (id: number) => axiosInstance.get(`/customers/${id}`),

  // Backend hỗ trợ search với name, phone, hoặc vin
  searchCustomers: (params: CustomerSearchParams) =>
    axiosInstance.get("/customers/search", { params }),

  searchVehicle: (payload: VehicleSearchRequest) =>
    axiosInstance.post("/customers/vehicles/search", payload),

  // CRUD operations
  createCustomer: (data: CustomerRequest) =>
    axiosInstance.post("/customers", data),
  updateCustomer: (id: number, data: CustomerRequest) =>
    axiosInstance.put(`/customers/${id}`, data),
};

// ==================== VEHICLE API ====================
// Backend: VehicleController.java
// Path: /api/vehicles/*
export const vehicleAPI = {
  getAllVehicles: () => axiosInstance.get("/vehicles"),
  getVehicleByVin: (vin: string) => axiosInstance.get(`/vehicles/${vin}`),
  getVehiclesByCustomerId: (customerId: number) =>
    axiosInstance.get(`/vehicles/customer/${customerId}`),
  registerVehicle: (data: VehicleRequest) =>
    axiosInstance.post("/vehicles", data),
  updateVehicle: (vin: string, data: VehicleRequest) =>
    axiosInstance.put(`/vehicles/${vin}`, data),
  updateVehicleNotes: (vin: string, notes: string) =>
    axiosInstance.put(`/vehicles/${vin}/notes`, { notes }),
  deleteVehicle: (vin: string) => axiosInstance.delete(`/vehicles/${vin}`),
};

// ==================== PRODUCT MODEL API ====================
// Backend: ProductModelController.java
// Path: /api/product-models/*
export const productModelAPI = {
  getAllProductModels: () => axiosInstance.get("/product-models"),
  getProductModelById: (id: number) =>
    axiosInstance.get(`/product-models/${id}`),
  createProductModel: (data: ProductModelRequest) =>
    axiosInstance.post("/product-models", data),
};

// PartDistributionRequest.java - Yêu cầu phân phối phụ tùng
interface PartDistributionRequest {
  partSerialNumber: string;
  serviceCenterID: number;
  quantity: number;
  distributionDate?: string; // LocalDate
}

// ==================== PART DISTRIBUTION API ====================
// Backend: PartDistributionController.java
// Path: /api/distributions/*
export const partDistributionAPI = {
  getAllDistributions: () => axiosInstance.get("/distributions"),
  getDistributionById: (id: number) =>
    axiosInstance.get(`/distributions/${id}`),
  createDistribution: (data: PartDistributionRequest) =>
    axiosInstance.post("/distributions", data),
  updateDistribution: (id: number, data: PartDistributionRequest) =>
    axiosInstance.put(`/distributions/${id}`, data),
  deleteDistribution: (id: number) =>
    axiosInstance.delete(`/distributions/${id}`),
  getDistributionsByPart: (serialNumber: string) =>
    axiosInstance.get(`/distributions/part/${serialNumber}`),
  getDistributionsByServiceCenter: (serviceCenterId: number) =>
    axiosInstance.get(`/distributions/service-center/${serviceCenterId}`),
  getDistributionsByDateRange: (startDate: string, endDate: string) =>
    axiosInstance.get("/distributions/date-range", {
      params: { startDate, endDate },
    }),
  getDistributionsByPartAndServiceCenter: (
    serialNumber: string,
    serviceCenterId: number
  ) =>
    axiosInstance.get(
      `/distributions/part/${serialNumber}/service-center/${serviceCenterId}`
    ),
};
