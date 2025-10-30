export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  vin: string;
  model: string;
  year: number;
  color?: string;
  licensePlate?: string;
}

export interface Part {
  id: string;
  name: string;
  serialNumber: string;
  type: 'Chính' | 'Phụ';
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
