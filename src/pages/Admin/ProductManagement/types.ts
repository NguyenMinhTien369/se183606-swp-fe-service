// Backend Vehicle response
export interface Vehicle {
    vin: string;
    serialNumber: string;
    productionDate: string;
    productModelID: number;
    productModelName?: string;
    customerID: number;
    customerName?: string;
    notes?: string;
}

// Backend Part response (mapped)
export interface Part {
    serialNumber: string;
    partName: string;
    category: string;
    manufactureDate?: string;
    warrantyPeriodMonths?: number;
    warrantyExpiryDate?: string; // Ngày hết hạn bảo hành (LocalDate)
}

// Form data for creating/editing Vehicle (match backend VehicleRequest)
export interface VehicleFormData {
    vin: string;
    customerID: number;
    modelID: number; // Changed from productModelID
    licensePlate: string; // Changed from serialNumber
    batteryCapacity: number;
    image?: string;
    registrationDate: string; // Changed from productionDate
}

// Form data for creating/editing Part
export interface PartFormData {
    partSerialNumber: string;
    partTypeID: number;
    productionDate: string;
    warrantyPeriod: string;
}

export type TabType = 'vehicles' | 'parts';
export type ModalMode = 'add' | 'edit';