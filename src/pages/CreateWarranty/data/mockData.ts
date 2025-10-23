import type {
  Vehicle,
  Part,
  WarrantyHistory,
  WarrantyClaim,
} from "../types/warranty";

// Mock vehicles data
export const mockVehicles: Record<string, Vehicle> = {
  XYZ123ABC456: {
    vin: "XYZ123ABC456",
    model: "Ranger XLS 2022",
    year: 2022,
    saleDate: "2022-03-15",
    customerName: "Nguyễn Văn A",
    dealer: "Ford Hà Nội",
  },
  DEF789GHI012: {
    vin: "DEF789GHI012",
    model: "Ford Everest 2023",
    year: 2023,
    saleDate: "2023-01-20",
    customerName: "Trần Thị B",
    dealer: "Ford Sài Gòn",
  },
};

// Mock parts data
export const mockParts: Record<string, Part[]> = {
  XYZ123ABC456: [
    {
      id: "1",
      partCode: "8G1A-6K682",
      partName: "Turbocharger",
      installDate: "2022-03-15",
      status: "active",
    },
    {
      id: "2",
      partCode: "AB39-6C032",
      partName: "Fuel Pump",
      installDate: "2022-03-15",
      status: "active",
    },
    {
      id: "3",
      partCode: "HC3Z-8501",
      partName: "Transmission Module",
      installDate: "2022-03-15",
      status: "active",
    },
    {
      id: "4",
      partCode: "JK5T-1234",
      partName: "ECU Control Unit",
      installDate: "2022-03-15",
      status: "active",
    },
  ],
  DEF789GHI012: [
    {
      id: "5",
      partCode: "LM7Q-9876",
      partName: "Engine Block",
      installDate: "2023-01-20",
      status: "active",
    },
  ],
};

// Mock warranty history
export const mockWarrantyHistory: Record<string, WarrantyHistory[]> = {
  XYZ123ABC456: [
    {
      id: "1",
      requestCode: "CLM-2024-045",
      createdDate: "2024-08-12",
      parts: ["Fuel Pump"],
      status: "completed",
      handler: "Ford Technical",
    },
    {
      id: "2",
      requestCode: "CLM-2024-089",
      createdDate: "2024-11-03",
      parts: ["ECU Control Unit"],
      status: "approved",
      handler: "Ford Technical",
    },
  ],
  DEF789GHI012: [],
};

// Mock warranty claims
export const mockWarrantyClaims: WarrantyClaim[] = [
  {
    id: "1",
    requestCode: "CLM-2025-001",
    vin: "XYZ123ABC456",
    issueDate: "2025-01-10",
    description: "Turbocharger có tiếng kêu bất thường, giảm công suất động cơ",
    parts: ["8G1A-6K682"],
    images: [],
    diagnosticInfo: "Mã lỗi P0234: Turbocharger overboost condition",
    status: "pending",
    handler: "Ford Technical",
    createdDate: "2025-10-01",
    logs: [
      {
        id: "log1",
        user: "Kỹ thuật viên A",
        action: "Tạo yêu cầu",
        timestamp: "2025-10-01T08:30:00",
      },
    ],
  },
  {
    id: "2",
    requestCode: "CLM-2025-002",
    vin: "XYZ123ABC456",
    issueDate: "2025-02-15",
    description: "Hệ thống truyền động gặp sự cố, không chuyển số",
    parts: ["HC3Z-8501"],
    images: [],
    status: "approved",
    handler: "Ford Technical",
    createdDate: "2025-10-02",
    manufacturerResponse: {
      result: "approved",
      notes: "Thay module truyền động mới phiên bản Gen2",
      replacementParts: ["HC3Z-8501-V2"],
      updateDate: "2025-10-05",
    },
    logs: [
      {
        id: "log2",
        user: "Kỹ thuật viên B",
        action: "Tạo yêu cầu",
        timestamp: "2025-10-02T10:15:00",
      },
      {
        id: "log3",
        user: "Hãng Ford",
        action: "Phê duyệt yêu cầu",
        timestamp: "2025-10-05T14:20:00",
      },
    ],
  },
];
