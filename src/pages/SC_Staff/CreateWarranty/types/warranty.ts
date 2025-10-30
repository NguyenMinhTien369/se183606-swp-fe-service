// Types for warranty management system

export type WarrantyStatus = 'pending' | 'approved' | 'completed' | 'rejected';

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
  status: 'active' | 'replaced' | 'warranty';
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
    result: 'approved' | 'rejected';
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