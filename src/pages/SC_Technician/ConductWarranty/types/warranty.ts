// ==================== BACKEND DTO TYPES ====================
// Synchronized with backend ClaimAssignment DTOs

// ==================== ClaimAssignmentResponse ====================
// Backend: ClaimAssignmentController.getAssignmentByClaimId()
// Endpoint: GET /api/claim-assignments/claim/{claimID}
// Also used in: GET /api/claim-assignments/technician/{technicianID}
export interface ClaimAssignmentResponse {
  assignmentID: number;
  claimID: number;
  vin: string;
  description: string;
  claimStatus: string; // PENDING, APPROVED, IN_PROGRESS, COMPLETED, REJECTED

  technicianName: string;
  technicianPhone: string;
  technicianEmail: string;

  assignedDate: string; // LocalDate
  expectedCompletionDate: string | null; // LocalDate
  actualCompletionDate: string | null; // LocalDate
  status: string; // ASSIGNED, IN_PROGRESS, AWAITING_PARTS, COMPLETED
  completionPercentage: number;
  totalHours: number | null;
  internalNotes: string;
  manufacturerRejected: boolean;

  createdAt: string; // LocalDateTime
}

// ==================== Assignment Progress Response ====================
// Backend: ClaimAssignmentController.getAssignmentsProgress()
// Endpoint: GET /api/claim-assignments/progress/{serviceCenterID}
export interface AssignmentProgressResponse {
  assignmentID: number;
  claimCode: number;
  vin: string;
  technicianName: string;
  assignedDate: string; // LocalDate
  status: string; // ASSIGNED, IN_PROGRESS, AWAITING_PARTS, COMPLETED
  completionPercentage: number;
  internalNotes: string;
  canEdit: boolean;
  canDelete: boolean;
}

// ==================== Update Assignment Request ====================
// Backend: ClaimAssignmentController.updateAssignmentProgress()
// Endpoint: PUT /api/claim-assignments/{assignmentID}/progress
// Content-Type: multipart/form-data
export interface UpdateAssignmentRequest {
  status?: string; // ASSIGNED, IN_PROGRESS, AWAITING_PARTS, COMPLETED
  completionPercentage?: number;
  internalNotes?: string;
  manufacturerRejected?: boolean;

  // Files (sent via FormData)
  newProgressFiles?: File[]; // Ảnh chụp hiện trường (Bước 2: RepairProgress)
  newHandoverFiles?: File[]; // Biên bản bàn giao (Bước 3: CompletionHandover)

  // Part replacements
  partReplacements?: PartReplacementRequest[];
}

export interface PartReplacementRequest {
  claimPartID: number; // ID của phụ tùng trong claim
  newPartSerialNumber: string; // Số seri phụ tùng mới thay thế
}

// ==================== Warranty Claim Response (for reference) ====================
// Reuse from InternalManagement types
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
  claimPartID?: number; // ID của phụ tùng trong claim_parts table
  partSerialNumber: string;
  partTypeName: string;
  partTypeDescription: string;
  description: string;
  createdDate: string;
}

export interface ClaimAttachmentResponse {
  attachmentID: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadDate: string;
}

// ==================== Assignment Status Enums ====================
export type AssignmentStatus =
  | "Đã phân công"
  // Đã phân công
  | "Đang thay thế" // Đang sửa chữa
  | "Nhận phụ tùng"
  | "Hoàn thành"; // Hoàn tất

export type WarrantyClaimStatus =
  | "Chờ duyệt"
  | "Được chấp nhận"
  | "Đang xử lý"
  | "Đã xử lý"
  | "Từ chối";
