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
    partID: number;
    partName: string;
    partSerialNumber: string;
    partTypeDescription?: string;
    description?: string;
    createdDate: string;
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
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'IN_PROGRESS'
    | 'COMPLETED';

export interface ApprovalRequest {
    approvalNotes: string;
}
