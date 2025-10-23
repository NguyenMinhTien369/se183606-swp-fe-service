import type { WarrantyRequest, Technician } from "../types/warranty";

export const mockWarrantyRequests: WarrantyRequest[] = [
  {
    id: "CLM-2025-021",
    vin: "XCF12345",
    technicianName: "Nguyễn Văn A",
    createdDate: "2025-01-10",
    status: "pending",
    priority: "medium",
    model: "VinFast VF8",
    yearOfManufacture: "2024",
    saleDate: "2024-03-15",
    issueDescription: "Lỗi hệ thống phanh ABS, đèn cảnh báo sáng liên tục",
    parts: ["Cảm biến ABS", "Mô-đun điều khiển phanh"],
    attachments: [
      { name: "bao_cao_ky_thuat.pdf", type: "pdf", url: "#" },
      { name: "anh_loi.jpg", type: "image", url: "#" }
    ],
    responseHistory: [
      { date: "2025-01-10", message: "Yêu cầu đã được tạo", from: "Hệ thống" }
    ]
  },
  {
    id: "CLM-2025-022",
    vin: "XCF12346",
    technicianName: "Trần Thị B",
    createdDate: "2025-01-12",
    status: "assigned",
    priority: "high",
    model: "VinFast VF9",
    yearOfManufacture: "2024",
    saleDate: "2024-05-20",
    issueDescription: "Pin sạc không lên đầy, mất 20% dung lượng",
    parts: ["Module pin", "BMS"],
    attachments: [
      { name: "kiem_tra_pin.pdf", type: "pdf", url: "#" }
    ],
    responseHistory: [
      { date: "2025-01-12", message: "Yêu cầu đã được tạo", from: "Hệ thống" },
      { date: "2025-01-13", message: "Đã phân công cho Nguyễn Văn B", from: "SC Staff" }
    ],
    assignedTo: "Nguyễn Văn B",
    assignedDate: "2025-01-13"
  },
  {
    id: "CLM-2025-023",
    vin: "XCF12347",
    technicianName: "Lê Văn C",
    createdDate: "2025-01-15",
    status: "in_progress",
    priority: "low",
    model: "VinFast VF5",
    yearOfManufacture: "2023",
    saleDate: "2023-08-10",
    issueDescription: "Hệ thống điều hòa không làm lạnh",
    parts: ["Lốc lạnh", "Gas điều hòa"],
    attachments: [],
    responseHistory: [
      { date: "2025-01-15", message: "Yêu cầu đã được tạo", from: "Hệ thống" },
      { date: "2025-01-16", message: "Đã phân công cho Phạm Thị D", from: "SC Staff" },
      { date: "2025-01-17", message: "Đang tiến hành thay thế", from: "Phạm Thị D" }
    ],
    assignedTo: "Phạm Thị D",
    assignedDate: "2025-01-16",
    progress: 65,
    notes: "Đợi phụ tùng"
  },
  {
    id: "CLM-2025-024",
    vin: "XCF12348",
    technicianName: "Hoàng Văn E",
    createdDate: "2025-01-20",
    status: "completed",
    priority: "medium",
    model: "VinFast VF8",
    yearOfManufacture: "2024",
    saleDate: "2024-06-25",
    issueDescription: "Màn hình trung tâm bị treo, không phản hồi",
    parts: ["Màn hình giải trí", "Cáp kết nối"],
    attachments: [
      { name: "bao_cao_hoan_thanh.pdf", type: "pdf", url: "#" },
      { name: "anh_truoc.jpg", type: "image", url: "#" },
      { name: "anh_sau.jpg", type: "image", url: "#" }
    ],
    responseHistory: [
      { date: "2025-01-20", message: "Yêu cầu đã được tạo", from: "Hệ thống" },
      { date: "2025-01-21", message: "Đã phân công cho Nguyễn Văn B", from: "SC Staff" },
      { date: "2025-01-23", message: "Hoàn thành thay thế", from: "Nguyễn Văn B" }
    ],
    assignedTo: "Nguyễn Văn B",
    assignedDate: "2025-01-21",
    progress: 100,
    completedDate: "2025-01-23",
    result: "OK"
  },
  {
    id: "CLM-2025-025",
    vin: "XCF12349",
    technicianName: "Đỗ Thị F",
    createdDate: "2025-02-01",
    status: "receiving_parts",
    manufacturerResponse: "Đã duyệt",
    priority: "high",
    model: "VinFast VF9",
    yearOfManufacture: "2024",
    saleDate: "2024-07-15",
    issueDescription: "Rò rỉ dầu động cơ",
    parts: ["Gioăng nắp quy-lát", "Dầu động cơ"],
    attachments: [
      { name: "kiem_tra_dong_co.pdf", type: "pdf", url: "#" }
    ],
    responseHistory: [
      { date: "2025-02-01", message: "Yêu cầu đã được tạo", from: "Hệ thống" },
      { date: "2025-02-02", message: "Hãng đã duyệt yêu cầu", from: "VinFast" }
    ],
    assignedTo: "Trần Văn G",
    assignedDate: "2025-02-02",
    progress: 30
  }
];

export const mockTechnicians: Technician[] = [
  {
    id: "tech-001",
    name: "Nguyễn Văn B",
    specialty: "Điện tử",
    status: "active",
    requestsHandled: 12,
    completedOnTime: 10,
    rejected: 2,
    totalHours: 45
  },
  {
    id: "tech-002",
    name: "Phạm Thị D",
    specialty: "Động cơ",
    status: "active",
    requestsHandled: 8,
    completedOnTime: 7,
    rejected: 1,
    totalHours: 32
  },
  {
    id: "tech-003",
    name: "Trần Văn G",
    specialty: "Thân vỏ",
    status: "active",
    requestsHandled: 15,
    completedOnTime: 14,
    rejected: 1,
    totalHours: 58
  },
  {
    id: "tech-004",
    name: "Lê Minh H",
    specialty: "Pin",
    status: "active",
    requestsHandled: 10,
    completedOnTime: 9,
    rejected: 1,
    totalHours: 40
  },
  {
    id: "tech-005",
    name: "Hoàng Thị I",
    specialty: "ECU",
    status: "active",
    requestsHandled: 6,
    completedOnTime: 5,
    rejected: 1,
    totalHours: 28
  }
];