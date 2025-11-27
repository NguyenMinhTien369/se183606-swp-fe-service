// TypeScript types for Warranty Approval

// 1. Common Interfaces
export interface Customer {
    id?: number;
    fullName: string;
    email: string;
    phone?: string;
}

export interface Vehicle {
    id?: number;
    vin: string;
    model: string;
    year?: number;
    manufacturerID?: number;
    licensePlate?: string;
}

export interface Attachment {
    attachmentID: number;
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadDate: string;
}

// 2. Main Warranty Claim Interface (Internal Use)
export interface WarrantyClaim {
    id: number;
    claimNumber: string;
    customer: Customer;
    vehicle: Vehicle;
    issueDescription: string;
    status: ClaimStatus;
    createdDate: string;
    estimatedCost: number;
    approvalNotes?: string;
    rejectionReason?: string;
    assignedTechnician?: string;
    result?: string;
    affectedParts?: any[];
    attachments?: Attachment[];
}

// ✅ 3. UPDATE: Cập nhật đầy đủ trạng thái cho Scenario 02
export type ClaimStatus =
    | 'PENDING'             // Chờ duyệt (Cũ)
    | 'WAITING_MANUFACTURER' // Chờ hãng duyệt (Mới - Scenario 02)
    | 'MANUFACTURER_APPROVED' // Hãng đã duyệt
    | 'APPROVED'            // Được chấp nhận (Cũ)
    | 'REJECTED'            // Từ chối
    | 'SHIPPING'            // Đang giao hàng (Case 2.1)
    | 'MISSING_PARTS'       // Thiếu hàng (Cũ)
    | 'WAITING_SUPPLEMENT'  // Chờ bổ sung (Case 2.2)
    | 'RECEIVED'            // Đã nhận
    | 'IN_PROGRESS'         // Đang xử lý
    | 'COMPLETED';          // Hoàn thành

export interface ApprovalRequest {
    approvalNotes: string;
}

// ✅ 4. ADD: Interfaces khớp với API Response từ Backend
export interface WarrantyClaimResponse {
    claimID: number;
    vin: string;
    licensePlate: string;
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
    status: string;       // Backend trả về chuỗi (Tiếng Việt hoặc Enum)
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
    quantity?: number;
    missingQuantity?: number; // Số lượng thiếu (cho Case 2.2)
}

export interface ClaimAttachmentResponse {
    attachmentID: number;
    fileUrl: string;
    fileType: string;
    uploadDate: string;
}