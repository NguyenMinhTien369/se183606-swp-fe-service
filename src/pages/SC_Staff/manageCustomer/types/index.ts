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
  registrationDate?: string;
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
        name: backendCustomer.fullName,
        phone: backendCustomer.phone,
        email: backendCustomer.email,
        address: backendCustomer.address,
        cmnd: backendCustomer.cmnd,
        vin: "Chưa có xe",
        model: "N/A",
        year: 0,
        licensePlate: "N/A",
      },
    ];
  }

  // Nếu có nhiều vehicle → tạo 1 row cho mỗi vehicle
  return backendCustomer.vehicles.map((vehicle) => ({
    id: `${backendCustomer.customerID}-${vehicle.vin}`,
    name: backendCustomer.fullName,
    phone: backendCustomer.phone,
    email: backendCustomer.email,
    address: backendCustomer.address,
    cmnd: backendCustomer.cmnd,
    vin: vehicle.vin,
    model: vehicle.modelName || "N/A", // ✅ FLAT access
    year: vehicle.productionYear || 0, // ✅ FLAT access
    color: vehicle.color, // ✅ Thêm color
    licensePlate: vehicle.licensePlate || "Chưa đăng ký",
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

export interface SyncStatus {
  synced: boolean;
  lastSyncTime?: string;
}
