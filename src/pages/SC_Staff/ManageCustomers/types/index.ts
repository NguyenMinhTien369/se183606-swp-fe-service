// 🔷 Backend Response Types (khớp 100% với VehicleResponse.java)
export interface VehicleResponse {
  vin: string;
  customerName?: string;
  modelName: string;
  color?: string;
  productionYear?: number;
  licensePlate?: string;
  batteryCapacity?: number;
  image?: string;
  registrationDate?: string; // LocalDate from backend
  installedParts?: any[]; // List<InstalledPartResponse>
}

export interface CustomerResponse {
  customerID: number;
  fullName: string;
  phone: string;
  email: string;
  cmnd: string;
  address: string;
  vehicles: VehicleResponse[];
}

// 🔷 Frontend Display Type (flat structure để dễ hiển thị)
export interface Customer {
  id: string;
  customerID: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  cmnd: string;
  vin: string;
  model: string;
  year: number;
  color?: string;
  licensePlate?: string;
  batteryCapacity?: number;
  registrationDate?: string;
}

// 🔧 Helper function: Flatten backend response sang frontend type
export function flattenCustomerData(
  backendCustomer: CustomerResponse
): Customer[] {
  // Nếu customer không có vehicle → trả về customer với placeholder data
  if (!backendCustomer.vehicles || backendCustomer.vehicles.length === 0) {
    return [
      {
        id: backendCustomer.customerID.toString(),
        customerID: backendCustomer.customerID,
        name: backendCustomer.fullName,
        phone: backendCustomer.phone,
        email: backendCustomer.email,
        address: backendCustomer.address,
        cmnd: backendCustomer.cmnd,
        vin: "Chưa có xe",
        model: "N/A",
        year: 0,
        licensePlate: "N/A",
        batteryCapacity: undefined,
        registrationDate: undefined,
      },
    ];
  }

  // Nếu có nhiều vehicle → tạo 1 row cho mỗi vehicle
  return backendCustomer.vehicles.map((vehicle) => ({
    id: `${backendCustomer.customerID}-${vehicle.vin}`,
    customerID: backendCustomer.customerID,
    name: backendCustomer.fullName,
    phone: backendCustomer.phone,
    email: backendCustomer.email,
    address: backendCustomer.address,
    cmnd: backendCustomer.cmnd,
    vin: vehicle.vin,
    model: vehicle.modelName || "N/A",
    year: vehicle.productionYear || 0,
    color: vehicle.color,
    licensePlate: vehicle.licensePlate || "Chưa đăng ký",
    batteryCapacity: vehicle.batteryCapacity,
    registrationDate: vehicle.registrationDate,
  }));
}

export interface Part {
  id: string;
  name: string;
  serialNumber: string;
  type: "Chính" | "Phụ";
  installedDate: string;
}

export interface ServiceHistory {
  id: string;
  date: string;
  serviceType: string;
  category: string;
  partReplaced: string;
  serialNumber: string;
  technician: string;
}
export interface ServiceHistoryItem {
  serviceID: number;
  vin: string;
  serviceCenterName: string;
  claimID: number;
  serviceDate: string;
  serviceType: string;
  workItem: string;
  replacementPartName: string;
  replacementPartSerial: string;
  technicianName: string;
}

export interface SyncStatus {
  synced: boolean;
  lastSyncTime?: string;
}

export interface InstalledPart {
  installedPartID: number;
  partTypeName: string;
  partSerialNumber: string;
  partTypeID: number;
  installationDate: string;
}
