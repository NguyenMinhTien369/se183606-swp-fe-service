export interface Stats {
    totalClaims: number;
    pendingClaims: number;
    approvedClaims: number;
    rejectedClaims: number;
    activeCampaigns: number;
    totalParts: number;
    lowStockParts: number;
}

export interface Claim {
    id: number;
    claimNumber: string;
    customer: { fullName: string };
    vehicle: { model: string; vin: string };
    status: string;
    createdDate: string;
}

export interface TrendData {
    month: string;
    claims: number;
    approved: number;
}

export interface CampaignStat {
    name: string;
    value: number;
    color: string;
}
