export type WarrantyStatus =
  | "Nháp" // Draft
  | "Chờ duyệt" // Pending
  | "Được chấp nhận" // Approved
  | "Đang xử lý" // In Progress
  | "Hoàn thành" // Completed
  | "Từ chối"; // Rejected

// Assignment Status (backend enum)
export type AssignmentStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "AWAITING_PARTS"
  | "COMPLETED";

// ==================== WarrantyClaimResponse ====================
// Backend: WarrantyClaimController.getClaimsByServiceCenter()
// Endpoint: GET /api/warranty-claims/service-center/{id}
export interface WarrantyClaimResponse {
  claimID: number;
  vin: string;
  licensePlate: string;
  registrationDate: string;
  modelName: string;
  color: string;
  batteryCapacity: number;
  productionYear: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCmnd: string;
  customerAddress: string;
  serviceCenterName: string;
  serviceCenterAddress: string;
  serviceCenterPhone: string;
  creationDate: string;
  status: string; // PENDING, APPROVED, IN_PROGRESS, COMPLETED, REJECTED
  description: string;
  result: string | null;
  affectedParts: ClaimPartResponse[];
  attachments: ClaimAttachmentResponse[];
}

export interface ClaimPartResponse {
  claimPartID: number;
  partSerialNumber: string;
  partTypeName: string;
  partTypeDescription: string;
  description: string;
  createdDate: string;
  quantity: number;
  quantityReportedMissing: number;
}

export interface ClaimAttachmentResponse {
  attachmentID: number;
  fileUrl: string;
  fileType: string;
  uploadDate: string;
}

// ==================== Assignment Progress ====================
// Backend: ClaimAssignmentController.getAssignmentsProgress()
// Endpoint: GET /api/claim-assignments/progress/{serviceCenterID}
// Response: AssignmentProgressResponse
export interface AssignmentProgress {
  assignmentID: number;
  claimCode: number; // Note: Backend uses claimCode, not claimID
  vin: string;
  technicianName: string;
  assignedDate: string;
  status: string;
  completionPercentage: number;
  internalNotes: string | null;
  canEdit: boolean;
  canDelete: boolean;
}

// ==================== Technician Performance ====================
// Backend: ClaimAssignmentController.getTechnicianPerformance()
// Endpoint: GET /api/claim-assignments/performance/{serviceCenterID}
// Response: TechnicianPerformanceResponse
export interface TechnicianPerformance {
  userID: number; // Note: Backend uses userID, not technicianID
  fullName: string; // Note: Backend uses fullName, not technicianName
  totalAssignedClaims: number; // Note: Backend uses totalAssignedClaims
  completedOnTime: number; // Note: Backend uses completedOnTime
  manufacturerRejected: number;
  totalHours: number; // Total hours, not average
}

// ==================== User/Technician ====================
// Backend: UserController.getAllUsers()
// Endpoint: GET /api/users
// Response: UserResponse
export interface TechnicianUser {
  userID: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  image?: string;
  role: RoleResponse;
  serviceCenter?: ServiceCenterResponse;
}

export interface RoleResponse {
  roleID: number;
  roleName: string;
  description: string;
}

export interface ServiceCenterResponse {
  serviceCenterID: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

// ==================== Assignment Request ====================
// Backend: ClaimAssignmentController.assignTechnician()
// Endpoint: POST /api/claim-assignments/assign
export interface AssignTechnicianRequest {
  claimID: number;
  technicianIDs: number[]; // Backend expects List<Integer> - min 1, max 4 technicians
  expectedCompletionDate?: string; // LocalDate format: YYYY-MM-DD
  internalNotes?: string;
}

// ==================== Assignment Update Request ====================
// Backend: ClaimAssignmentController.updateAssignmentProgress()
// Endpoint: PUT /api/claim-assignments/{assignmentID}/progress
// Note: Uses FormData with multipart/form-data
export interface UpdateAssignmentProgressRequest {
  progressPercentage?: number;
  status?: string;
  internalNotes?: string;
  completionDate?: string;
  // attachments: File[] (sent via FormData)
}

export type WarrantyRequest = WarrantyClaimResponse;

export type Technician = TechnicianUser;
