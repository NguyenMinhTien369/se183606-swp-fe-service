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
