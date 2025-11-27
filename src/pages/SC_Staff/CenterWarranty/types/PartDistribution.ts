//API xuất kho phụ tùng
export interface PartDistributionResponseCenter {
  distributionID: number;
  partSerialNumber: string;
  partTypeName: string;
  serviceCenterID: number;
  serviceCenterName: string;
  quantity: number;
  distributionDate: string;
}

//API tồn kho phụ tùng
export interface PartInventoryResponseCenter {
  inventoryID: number;
  partSerialNumber: string;
  partTypeName: string;
  quantity: number;
  location: string;
  lastUpdated: string;
}
export interface PartInventoryRequestCenter {
  partSerialNumber: string; // @NotBlank
  quantity: number; // @NotNull, @Min(0)
  location?: string; // Không bắt buộc
  lastUpdated?: string;
  serviceCenterID?: number; // Có thể null hoặc optional
}
