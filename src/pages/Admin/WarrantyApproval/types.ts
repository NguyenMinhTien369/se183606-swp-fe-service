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

export interface AffectedPart {
    claimPartID: number;
    partName: string;
    partSerialNumber: string;
    partTypeDescription?: string;
    description?: string;
    createdDate: string;
    quantity: number;
}

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
    attachments?: Attachment[];
    affectedParts?: AffectedPart[];
}

export type ClaimStatus =
    | 'PENDING'       // Chờ duyệt
    | 'APPROVED'      // Được chấp nhận (Legacy)
    | 'REJECTED'      // Từ chối
    | 'SHIPPING'      // Đang giao phụ tùng
    | 'MISSING_PARTS' // Thiếu hàng
    | 'RECEIVED'      // Đã nhận
    | 'IN_PROGRESS'   // Đang xử lý
    | 'COMPLETED'     // Hoàn thành
    | 'WAITING_MANUFACTURER' // Chờ hãng duyệt (New)
    | 'MANUFACTURER_APPROVED' // Hãng đã duyệt (New)
    | 'WAITING_SUPPLEMENT';   // Chờ bổ sung phụ tùng (New)

export interface ApprovalRequest {
    approvalNotes: string;
}

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
    status: string;
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
    missingQuantity?: number;
}

export interface ClaimAttachmentResponse {
    attachmentID: number;
    fileUrl: string;
    fileType: string;
    uploadDate: string;
}