// Backend ProductModel response
export interface ProductModel {
    modelID: number;
    modelName: string;
    color: string;
    productionYear: number;
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

// Form data for creating/editing ProductModel
export interface ProductModelFormData {
    modelName: string;
    color: string;
    productionYear: number;
    warrantyPeriod: number;
}

// Form data for creating/editing Part
export interface PartFormData {
    partSerialNumber: string;
    partTypeID: number;
    productionDate: string;
    warrantyPeriod: string;
}

export type TabType = 'models' | 'parts';
export type ModalMode = 'add' | 'edit';