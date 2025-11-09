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

Thực hiện những yêu cầu sau cho folder ConductWarranty

1. Giúp tôi ở trang Danh sách yêu cầu được duyệt gắn API "claimAssignmentAPI.getAssignmentsByTechnician(id)"
2. Khi ấn vào xác nhận phụ tùng gắn API sau cho tôi:"claimAssignmentAPI.updateAssignmentProgress(assId, request)"
3. Gắn API:"claimAssignmentAPI.getAssignmentsByTechnician(id)" cho phần Chọn yêu cầu bảo hành để sửa chữa
4. Gắn API:"claimAssignmentAPI.updateAssignmentProgress(assId, request)" cho phần Hoàn tất & bàn giao

Thực hiện sửa những yêu cầu sau cho folder ConductWarranty

1. Trong hiển thị Danh sách yêu cầu được duyệt và trong folder ConductWarranty thay thế toàn bộ status từ "ASSIGNED" thành "Đã phân công".
2. Trong chức năng Xác nhận phụ tùng và trong folder ConductWarranty thay thế toàn bộ status từ "IN_PROGRESS" thành "Đang thay thế".
3. Trong yêu cầu số 3: thay thế toàn bộ status từ "IN_PROGRESS" thành "Đang thay thế".
4. Trong yêu cầu số 4: thay thế toàn bộ status từ "COMPLETED" thành "Hoàn thành".

Mình đang nghi ngờ:

1. Lỗi không tải được "Danh sách yêu cầu được duyệt" nằm ở userid hoặc là service center ID

- Tài khoản hiện tại
  👤 Username: sc_technician
  🔒 Password: tech123
  📧 Email: technician@evwarrantyhub.com
  📱 Phone: 0912345678
  🏢 Service Center: VinFast Thủ Đức (ID: 2)
  👨‍🔧 Role: SC_TECHNICIAN

2. Đơn đang được gán là:

- claimid 14 và 18 đều gán cho userid là 3, thằng này có service_centerid là 1

- tôi đang gặp vấn đề sau, trong database có 1 bảng là user đó là nơi chứa thông tin user bao gồm tài khoản và mật khẩu, nhưng hiện tại, tại sao tôi không thể đăng nhập bằng tài khoản có trong database mà chỉ có thể đăng nhập được bằng những tài khoản mà được tạo sẵn ở trong be.hãy giải thích nguyên nhân và đề xuất phương án khắc phục cho tôi
