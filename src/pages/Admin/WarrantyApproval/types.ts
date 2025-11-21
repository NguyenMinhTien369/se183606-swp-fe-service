// TypeScript types for Warranty Approval
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
    | 'APPROVED'      // Được chấp nhận
    | 'REJECTED'      // Từ chối
    | 'SHIPPING'      // Đang giao phụ tùng
    | 'MISSING_PARTS' // Thiếu hàng
    | 'RECEIVED'      // Đã nhận
    | 'IN_PROGRESS'   // Đang xử lý
    | 'COMPLETED';    // Hoàn thành

export interface ApprovalRequest {
    approvalNotes: string;
}

export interface WarrantyClaimResponse {
    claimID: number;

    // Thông tin xe (đã làm phẳng)
    vin: string;
    licensePlate: string;
    modelName: string;
    color: string;
    batteryCapacity: number;
    productionYear: number;

    // Thông tin khách hàng (đã làm phẳng)
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    customerCmnd: string;
    customerAddress: string;

    // Thông tin TTBH (đã làm phẳng)
    serviceCenterName: string;
    serviceCenterAddress: string;
    serviceCenterPhone: string;

    // Thông tin đơn bảo hành
    creationDate: string; // "YYYY-MM-DD"
    status: string;       // ⬅️ QUAN TRỌNG: Đây là status Tiếng Việt từ backend
    description: string;
    result: string | null; // Dùng để lưu lý do từ chối

    affectedParts: ClaimPartResponse[];
    attachments: ClaimAttachmentResponse[];
}

export interface ClaimPartResponse {
    claimPartID: number; // ⬅️ ID của dòng ClaimParts, không phải partID
    partSerialNumber: string;
    partTypeName: string;
    partTypeDescription: string;
    description: string; // Ghi chú của KTV cho phụ tùng này
    createdDate: string;
    quantity?: number; // Số lượng yêu cầu (nếu backend trả về)
    missingQuantity?: number; // Số lượng còn thiếu cần giao bổ sung (map quantityReportedMissing)
}

export interface ClaimAttachmentResponse {
    attachmentID: number;
    fileUrl: string;
    fileType: string;
    uploadDate: string;
    // fileName không có, chúng ta sẽ tự suy ra từ fileUrl
}