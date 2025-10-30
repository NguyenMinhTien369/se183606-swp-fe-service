import axiosInstance from "./axios";

// Lưu ý: Các API dưới đây đã được chuẩn hóa theo backend hiện tại trong EVWarrantyHub.
// Những endpoint chưa có ở backend đã được gỡ bỏ hoặc thay đổi cho phù hợp.

// ==================== TYPE DEFINITIONS ====================
// Tất cả interfaces dưới đây đồng bộ với backend DTOs tại:
// FA25_SWP391_SE1818_G6/EVWarrantyHub/src/main/java/swp391/evwarrantyhub/dto/request/

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

// AssignTechnicianRequest.java - Backend dùng tên khác
interface AssignTechnicianRequest {
  claimID: number;
  primaryTechnicianID: number; // Backend dùng 'primaryTechnicianID'
  expectedCompletionDate?: string; // LocalDate trong backend
  internalNotes?: string; // Backend dùng 'internalNotes'
}

// UpdateAssignmentRequest.java - Backend có nhiều fields hơn
interface UpdateAssignmentRequest {
  status?: string;
  completionPercentage?: number;
  totalHours?: number;
  actualCompletionDate?: string; // LocalDate trong backend
  internalNotes?: string;
  manufacturerRejected?: boolean;
}

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

// Search params cho claim assignments
interface SearchAssignmentsParams {
  serviceCenterID: number;
  searchKeyword?: string;
  status?: string;
}

// ==================== AUTH API ====================
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
export const userAPI = {
  getUsers: (params?: any) => axiosInstance.get("/users", { params }),
  getUserById: (id: number) => axiosInstance.get(`/users/${id}`),
  createUser: (userData: UserRegisterRequest) =>
    axiosInstance.post("/users/register", userData),
  updateUser: (id: number, userData: UserUpdateRequest) =>
    axiosInstance.put(`/users/${id}`, userData),
  deleteUser: (id: number) => axiosInstance.delete(`/users/${id}`),

  // Backend hiện tại đặt các endpoint sau dưới /users
  logout: () => axiosInstance.post("/users/logout"),
  forgotPassword: (email: string) =>
    axiosInstance.post("/users/forgot-password", { email }),
  verifyOtp: (payload: VerifyOtpRequest) =>
    axiosInstance.post("/users/verify-otp", payload),
  resetPassword: (payload: ResetPasswordRequest) =>
    axiosInstance.post("/users/reset-password", payload),
};

// ==================== WARRANTY CLAIM API ====================
export const warrantyClaimAPI = {
  // Lấy thông tin xe theo VIN (được backend cung cấp dưới warranty-claims)
  getVehicleInfoByVin: (vin: string) =>
    axiosInstance.get("/warranty-claims/vehicle-info", { params: { vin } }),

  // Lấy danh sách claim theo Service Center
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
  syncStatusFromManufacturer: (id: number, status: string) =>
    axiosInstance.post(`/warranty-claims/${id}/sync-status`, null, {
      params: { status },
    }),
};

// ==================== CLAIM ASSIGNMENT API ====================
export const claimAssignmentAPI = {
  assignTechnician: (data: AssignTechnicianRequest) =>
    axiosInstance.post("/claim-assignments/assign", data),
  getAssignmentByClaimId: (claimID: number) =>
    axiosInstance.get(`/claim-assignments/claim/${claimID}`),
  getAssignmentsProgress: (serviceCenterID: number) =>
    axiosInstance.get(`/claim-assignments/progress/${serviceCenterID}`),
  getAssignmentsByTechnician: (technicianID: number) =>
    axiosInstance.get(`/claim-assignments/technician/${technicianID}`),
  updateAssignmentProgress: (
    assignmentID: number,
    data: UpdateAssignmentRequest
  ) => axiosInstance.put(`/claim-assignments/${assignmentID}/progress`, data),
  deleteAssignment: (assignmentID: number) =>
    axiosInstance.delete(`/claim-assignments/${assignmentID}`),
  searchAssignments: (params: SearchAssignmentsParams) =>
    axiosInstance.get("/claim-assignments/search", { params }),
};

// ==================== SERVICE CENTER API ====================
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
export const serviceHistoryAPI = {
  getByCustomerId: (customerId: number) =>
    axiosInstance.get(`/service-history/customer/${customerId}`),
  getByVehicleVin: (vin: string) =>
    axiosInstance.get(`/service-history/vehicle/${vin}`),
};

// ==================== CUSTOMER API ====================
export const customerAPI = {
  getCustomers: () => axiosInstance.get("/customers"),
  getCustomerById: (id: number) => axiosInstance.get(`/customers/${id}`),
  searchCustomersByName: (name: string) =>
    axiosInstance.get("/customers/search", { params: { name } }),
  searchVehicle: (payload: VehicleSearchRequest) =>
    axiosInstance.post("/customers/vehicles/search", payload),
};
