// TypeScript types for Product Management
export interface Vehicle {
    vin: string;
    model?: string;
    year?: number;
    manufacturerID?: number;
    purchaseDate?: string;
    warrantyEndDate?: string;
}

export interface Part {
    partID?: number;
    partName: string;
    serialNumber: string;
    manufacturerID?: number;
    manufactureDate?: string;
    warrantyPeriodMonths?: number;
    category?: string;
}

export interface VehicleFormData {
    vin: string;
    model: string;
    year: number;
    manufacturerID: number;
    purchaseDate: string;
    warrantyEndDate: string;
}

export interface PartFormData {
    partSerialNumber: string;
    partTypeID: number;
    productionDate: string;
    warrantyPeriod: string;
}

export type TabType = 'vehicles' | 'parts';
export type ModalMode = 'add' | 'edit';
