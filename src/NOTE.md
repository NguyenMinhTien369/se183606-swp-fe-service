1.  Sửa toàn bộ tiếng anh cột trạng thái thành tiếng việt trong file manufacterResponse.tsx

# Khi tôi thay đổi 1 đường dẫn API trong file CreateWarranty.tsx tôi phải sửa những gì, hãy liệt kê chi tiết cho tôi. Ví dụ như tôi không muốn file ManufactureResponse.tsx nhận API từ getClaimsByServiceCenter() tôi muốn thay thế bằng

1.  Kiểm tra file index đã có API đó chưa ?
2.

# Khi tôi thay đổi 1 đường dẫn API trong file AssignTechnician.tsx tôi phải sửa những gì, hãy liệt kê chi tiết cho tôi.

# Ví dụ như tôi không muốn file AssignTechnician.tsx nhận API từ userAPI.getAllUsers() tôi muốn thay thế bằng claimAssignmentAPI.getTechnicians();

# tiếp tục thay thế

- kiểm tra lại user controller

1. Load danh sách kĩ thuật viên
   getAssignmentsByTechnician: (technicianID: number) =>
   axiosInstance.get(`/claim-assignments/technician/${technicianID}`),
2. Gửi lên be
   assignTechnician: (data: AssignTechnicianRequest) =>
   axiosInstance.post("/claim-assignments/assign", data),

- trong dự án hiện tại của tôi có một số chỗ đang bị hardcode,tôi muốn au khi đăng nhập là sẽ có dữ liệu từ tài khoản đăng nhập, tôi muốn dùng redux toolkit để có thể lấy

1. Giúp tôi ở trang Danh sách yêu cầu được duyệt gắn API "claimAssignmentAPI.getAssignmentsByTechnician(id)"
2. Khi ấn vào xác nhận phụ tùng gắn API sau cho tôi:""
