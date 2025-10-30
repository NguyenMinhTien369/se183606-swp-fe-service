export type WarrantyStatus = 
  | "pending" 
  | "assigned" 
  | "receiving_parts" 
  | "in_progress" 
  | "completed" 
  | "rejected";

export type Priority = "high" | "medium" | "low";

export type WarrantyRequest = {
  id: string;
  vin: string;
  technicianName: string;
  createdDate: string;
  status: WarrantyStatus;
  manufacturerResponse?: string;
  priority: Priority;
  model: string;
  yearOfManufacture: string;
  saleDate: string;
  issueDescription: string;
  parts: string[];
  attachments: { name: string; type: string; url: string }[];
  responseHistory: { date: string; message: string; from: string }[];
  assignedTo?: string;
  assignedDate?: string;
  progress?: number;
  notes?: string;
  completedDate?: string;
  result?: string;
};

export type Technician = {
  id: string;
  name: string;
  specialty: string;
  status: "active" | "inactive";
  requestsHandled: number;
  completedOnTime: number;
  rejected: number;
  totalHours: number;
};