// Types for warranty management system
// Đồng bộ với backend DTOs: VehicleInfoResponse, WarrantyClaimResponse, CreateWarrantyClaimRequest

// ✅ Status đồng bộ với backend (tiếng Việt)
export type WarrantyStatus =
  | "Nháp" // Draft
  | "Chờ duyệt" // Pending
  | "Được chấp thuận" // Approved
  | "Đang xử lý" // In Progress
  | "Hoàn thành" // Completed
  | "Bị từ chối"; // Rejected

// ==================== VehicleInfoResponse.java ====================
// Backend: WarrantyClaimController.getVehicleInfoByVin()
// Endpoint: GET /api/warranty-claims/vehicle-info?vin={vin}
// Response: ApiResponse<VehicleInfoResponse>
// Status: ✅ ĐÚNG - Đã đồng bộ hoàn toàn với backend
export interface VehicleInfo {
  vin: string; // ✅ String vin
  licensePlate: string; // ✅ String licensePlate
  registrationDate: string; // ✅ LocalDate registrationDate
  modelName: string; // ✅ String modelName
  color: string; // ✅ String color
  productionYear: number; // ✅ Integer productionYear
  batteryCapacity: number; // ✅ Double batteryCapacity
  customerName: string; // ✅ String customerName
  customerPhone: string; // ✅ String customerPhone
  customerEmail: string; // ✅ String customerEmail
  customerCmnd: string; // ✅ String customerCmnd
  customerAddress: string; // ✅ String customerAddress
  installedParts: InstalledPartInfo[]; // ✅ List<InstalledPartInfo> installedParts
}

// VehicleInfoResponse.InstalledPartInfo (nested class)
// Status: ✅ ĐÚNG - Đã đồng bộ hoàn toàn với backend
export interface InstalledPartInfo {
  partSerialNumber: string; // ✅ String partSerialNumber
  partTypeName: string; // ✅ String partTypeName
  partTypeDescription: string; // ✅ String partTypeDescription
  installationDate: string; // ✅ LocalDate installationDate
  warrantyPeriod: string; // ✅ LocalDate warrantyPeriod
  isUnderWarranty: boolean; // ✅ Boolean isUnderWarranty
}

// Deprecated: Giữ để tương thích, sẽ migrate sang VehicleInfo
export interface Vehicle {
  vin: string;
  model: string;
  year: number;
  saleDate: string;
  customerName: string;
  dealer: string;
}

// Deprecated: Giữ để tương thích, sẽ migrate sang InstalledPartInfo
export interface Part {
  id: string;
  partCode: string;
  partName: string;
  installDate: string;
  status: "active" | "replaced" | "warranty";
}

// ==================== WarrantyClaimResponse.java ====================
// Backend: WarrantyClaimController.getClaimById()
// Endpoint: GET /api/warranty-claims/{claimId}
// Response: ApiResponse<WarrantyClaimResponse>
// Status: ✅ ĐÚNG - Đã đồng bộ hoàn toàn với backend
export interface WarrantyClaimResponse {
  claimID: number; // ✅ Integer claimID
  vin: string; // ✅ String vin (từ Vehicle)
  licensePlate: string; // ✅ String licensePlate (từ Vehicle)
  registrationDate: string; // ✅ LocalDate registrationDate (từ Vehicle)
  modelName: string; // ✅ String modelName (từ ProductModel)
  color: string; // ✅ String color (từ Vehicle)
  batteryCapacity: number; // ✅ Double batteryCapacity (từ ProductModel)
  productionYear: number; // ✅ Integer productionYear (từ Vehicle)
  customerName: string; // ✅ String customerName (từ Customer)
  customerPhone: string; // ✅ String customerPhone (từ Customer)
  customerEmail: string; // ✅ String customerEmail (từ Customer)
  customerCmnd: string; // ✅ String customerCmnd (từ Customer)
  customerAddress: string; // ✅ String customerAddress (từ Customer)
  serviceCenterName: string; // ✅ String serviceCenterName (từ ServiceCenter)
  serviceCenterAddress: string; // ✅ String serviceCenterAddress (từ ServiceCenter)
  serviceCenterPhone: string; // ✅ String serviceCenterPhone (từ ServiceCenter)
  creationDate: string; // ✅ LocalDate creationDate
  status: string; // ✅ String status (enum: PENDING, APPROVED, REJECTED, etc.)
  description: string; // ✅ String description
  result: string | null; // ✅ String result (nullable)
  affectedParts: ClaimPartResponse[]; // ✅ List<ClaimPartResponse> affectedParts
  attachments: ClaimAttachmentResponse[]; // ✅ List<ClaimAttachmentResponse> attachments
}

// WarrantyClaimResponse.ClaimPartResponse (nested class)
// Status: ✅ ĐÚNG - Đã đồng bộ hoàn toàn với backend
export interface ClaimPartResponse {
  partSerialNumber: string; // ✅ String partSerialNumber
  partTypeName: string; // ✅ String partTypeName
  partTypeDescription: string; // ✅ String partTypeDescription
  description: string; // ✅ String description
  createdDate: string; // ✅ LocalDate createdDate
}

// WarrantyClaimResponse.ClaimAttachmentResponse (nested class)
// Status: ✅ ĐÚNG - Đã đồng bộ hoàn toàn với backend
export interface ClaimAttachmentResponse {
  attachmentID: number; // ✅ Integer attachmentID
  fileName: string; // ✅ String fileName
  fileUrl: string; // ✅ String fileUrl
  fileType: string; // ✅ String fileType
  uploadDate: string; // ✅ LocalDate uploadDate
}

// ==================== CreateWarrantyClaimRequest.java ====================
// Backend: WarrantyClaimController.createWarrantyClaim()
// Endpoint: POST /api/warranty-claims
// Request: multipart/form-data (FormData)
// Response: ApiResponse<Integer> (claimID)
// Status: ✅ ĐÚNG - Đã đồng bộ hoàn toàn với backend
export interface CreateWarrantyClaimRequest {
  vin: string; // ✅ @RequestParam String vin (required)
  serviceCenterID: number; // ✅ @RequestParam Integer serviceCenterID (required)
  description: string; // ✅ @RequestParam String description (required)
  claimParts: ClaimPartRequest[]; // ✅ @RequestParam List<ClaimPartRequest> claimParts (JSON array)
  attachmentFiles?: File[]; // ✅ @RequestParam(required=false) List<MultipartFile> attachmentFiles
  isDraft?: boolean; // ✅ @RequestParam(defaultValue="false") boolean isDraft
}

// CreateWarrantyClaimRequest.ClaimPartRequest (nested class)
// Status: ✅ ĐÚNG - Đã đồng bộ hoàn toàn với backend
export interface ClaimPartRequest {
  partSerialNumber: string; // ✅ String partSerialNumber (required)
  description?: string; // ✅ String description (optional)
}

// Deprecated: Giữ để tương thích với code cũ
export interface WarrantyHistory {
  id: string;
  requestCode: string;
  createdDate: string;
  parts: string[];
  status: WarrantyStatus;
  handler: string;
}

// Deprecated: Giữ để tương thích với code cũ, migrate sang WarrantyClaimResponse
export interface WarrantyClaim {
  id: string;
  requestCode: string;
  vin: string;
  issueDate: string;
  description: string;
  parts: string[];
  technicalReport?: File | string;
  images: (File | string)[];
  diagnosticInfo?: string;
  status: WarrantyStatus;
  handler: string;
  createdDate: string;
  manufacturerResponse?: {
    result: "Được chấp thuận" | "Bị từ chối";
    notes: string;
    replacementParts?: string[];
    updateDate: string;
  };
  logs: WarrantyLog[];
}

export interface WarrantyLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  changes?: string;
}
