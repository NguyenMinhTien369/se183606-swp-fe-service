export type WarrantyStatus =
  | "Nháp"
  | "Chờ duyệt"
  | "Được chấp nhận"
  | "Đang xử lý"
  | "Hoàn thành"
  | "Bị từ chối";

export interface VehicleInfo {
  vin: string;
  licensePlate: string;
  registrationDate: string;
  modelName: string;
  color: string;
  productionYear: number;
  batteryCapacity: number;
  customerName: string;
  // customerPhone: string;
  // customerEmail: string;
  // customerCmnd: string;
  // customerAddress: string;
  image?: string;
  internalNotes?: string | null;
  installedParts: InstalledPartInfo[];
}

export interface InstalledPartInfo {
  id: string;
  partSerialNumber: string;
  partTypeName: string;
  installationDate: string;
  warrantyPeriod: string;
  isUnderWarranty: boolean;
}

export interface Vehicle {
  vin: string;
  model: string;
  year: number;
  saleDate: string;
  customerName: string;
  dealer: string;
}

export interface Part {
  id: string;
  partCode: string;
  partName: string;
  installDate: string;
  status: "active" | "replaced" | "warranty";
}

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
  status: string;
  description?: string;
  result: string | null;
  affectedParts: ClaimPartResponse[];
  attachments: ClaimAttachmentResponse[];
}

export interface ClaimPartResponse {
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

export interface CreateWarrantyClaimRequest {
  vin: string;
  serviceCenterID: number;
  description: string;
  claimParts: ClaimPartRequest[];
  attachmentFiles?: File[];
  isDraft?: boolean;
}

export interface ClaimPartRequest {
  partSerialNumber: string;
  description?: string;
  quantity?: number;
}

export interface WarrantyHistory {
  id: string;
  requestCode: string;
  createdDate: string;
  parts: string[];
  status: WarrantyStatus;
  handler: string;
}

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
    result: "Được chấp nhận" | "Bị từ chối";
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
