//API xuất kho phụ tùng
export interface PartDistributionResponseCenter {
  distributionID: number;
  partSerialNumber: string;
  partTypeName: string;
  serviceCenterID: number;
  serviceCenterName: string;
  quantity: number;
  distributionDate: string; // LocalDate từ Java thường được map thành string
}

//API tồn kho phụ tùng
export interface PartInventoryResponseCenter {
  inventoryID: number;
  partSerialNumber: string;
  partTypeName: string;
  quantity: number;
  location: string;
  lastUpdated: string; // LocalDate map về string (ISO 8601 format: YYYY-MM-DD)
}
export interface PartInventoryRequestCenter {
  partSerialNumber: string; // @NotBlank
  quantity: number; // @NotNull, @Min(0)
  location?: string; // Không bắt buộc
  lastUpdated?: string; // LocalDate -> string (YYYY-MM-DD). Thường BE tự update.
  serviceCenterID?: number; // Có thể null hoặc optional
}
