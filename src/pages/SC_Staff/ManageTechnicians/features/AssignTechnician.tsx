import { useState, useEffect, useMemo } from "react";
import { UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/StatusBadge";

// Import Hooks "Chờ hãng duyệt", "Hãng đã duyệt", "Phụ tùng đã về trung tâm", "Đang giao phụ tùng"
import { useGetClaimsForAssignment } from "@/hooks/ManageTechnicians/AssignTechnician/useGetClaimsForAssignment";
import { useGetTechnicians } from "@/hooks/ManageTechnicians/AssignTechnician/useGetTechnicians";
import { useAssignTech } from "@/hooks/ManageTechnicians/AssignTechnician/useAssignTech";

export default function AssignTechnician() {
  // Hooks lấy dữ liệu
  const {
    claims,
    isLoading: isClaimsLoading,
    fetchClaims,
  } = useGetClaimsForAssignment();

  const { technicians, fetchTechnicians } = useGetTechnicians();
  const { assignTechnician, isSubmitting } = useAssignTech();

  // --- STATE ---
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]); // Lưu mảng Claim ID
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State lưu danh sách ID kỹ thuật viên được chọn (Mảng string hoặc number)
  // Ở đây dùng string để dễ xử lý với checkbox value, khi gửi sẽ convert sang number
  const [assignedTechIds, setAssignedTechIds] = useState<string[]>([]);

  const [expectedCompletionDate, setExpectedCompletionDate] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: "success" | "error";
  }>({ open: false, title: "", description: "", type: "success" });

  // Sắp xếp claims mới nhất lên đầu
  const sortedClaims = useMemo(() => {
    return [...claims].sort((a, b) => {
      return (
        new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
      );
    });
  }, [claims]);

  // Load dữ liệu khi vào trang
  useEffect(() => {
    fetchClaims();
    fetchTechnicians();
  }, [fetchClaims, fetchTechnicians]);

  // --- HANDLERS: CHỌN CLAIM ---
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(sortedClaims.map((r) => r.claimID));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requestId: number, checked: boolean) => {
    if (checked) {
      setSelectedRequests([...selectedRequests, requestId]);
    } else {
      setSelectedRequests(selectedRequests.filter((id) => id !== requestId));
    }
  };

  const handleOpenAssignModal = () => {
    if (selectedRequests.length === 0) {
      setAlertDialog({
        open: true,
        title: "Chưa chọn yêu cầu",
        description: "Vui lòng chọn ít nhất một yêu cầu trước khi phân công.",
        type: "error",
      });
      return;
    }
    // Reset form
    setAssignedTechIds([]);
    setExpectedCompletionDate("");
    setInternalNotes("");
    setIsModalOpen(true);
  };

  // --- HANDLERS: CHỌN TECHNICIAN (CHECKBOX) ---
  const handleToggleTechnician = (techId: string, checked: boolean) => {
    if (checked) {
      setAssignedTechIds((prev) => [...prev, techId]);
    } else {
      setAssignedTechIds((prev) => prev.filter((id) => id !== techId));
    }
  };

  // --- SUBMIT ---
  const handleConfirmAssign = async () => {
    // Validate: Phải chọn ít nhất 1 kỹ thuật viên
    if (assignedTechIds.length === 0) {
      setAlertDialog({
        open: true,
        title: "Chưa chọn kỹ thuật viên",
        description: "Vui lòng chọn ít nhất một kỹ thuật viên.",
        type: "error",
      });
      return;
    }

    // Gửi dữ liệu qua Hook
    const result = await assignTechnician({
      claimIDs: selectedRequests,
      technicianIDs: assignedTechIds.map((id) => parseInt(id)), // Convert String -> Number[]
      expectedCompletionDate: expectedCompletionDate || undefined, // Backend optional
      internalNotes: internalNotes || undefined, // Backend optional
    });

    if (result.success) {
      setAlertDialog({
        open: true,
        title: "Phân công thành công",
        description: `Đã phân công ${assignedTechIds.length} kỹ thuật viên cho ${selectedRequests.length} yêu cầu.`,
        type: "success",
      });

      setIsModalOpen(false);
      setSelectedRequests([]);
      setAssignedTechIds([]);
      await fetchClaims(); // Reload lại danh sách
    } else {
      setAlertDialog({
        open: true,
        title: "Lỗi phân công",
        description: result.error || "Đã có lỗi xảy ra.",
        type: "error",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Phân công kỹ thuật viên
          </h2>
          <p className="text-sm text-muted-foreground">
            Quản lý và phân công công việc sửa chữa
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleOpenAssignModal}
            disabled={selectedRequests.length === 0}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Phân công ({selectedRequests.length})
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border rounded-xl shadow-sm">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedRequests.length === sortedClaims.length &&
                      sortedClaims.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    disabled={isClaimsLoading}
                  />
                </TableHead>
                <TableHead>Mã yêu cầu</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Mô tả lỗi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isClaimsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : sortedClaims.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Không có yêu cầu nào cần phân công
                  </TableCell>
                </TableRow>
              ) : (
                sortedClaims.map((request) => (
                  <TableRow key={request.claimID}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRequests.includes(request.claimID)}
                        onCheckedChange={(checked) =>
                          handleSelectRequest(
                            request.claimID,
                            checked as boolean
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>#{request.claimID}</TableCell>
                    <TableCell>{request.vin}</TableCell>
                    {/* Hiển thị tên khách hàng từ type WarrantyClaimResponse */}
                    <TableCell>{request.customerName}</TableCell>
                    <TableCell>
                      {new Date(request.creationDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {request.description || "Không có mô tả"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle>Phân công kỹ thuật viên</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Danh sách yêu cầu đã chọn */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Yêu cầu đang chọn ({selectedRequests.length})
              </label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {selectedRequests.map((id) => (
                  <Badge key={id} variant="secondary">
                    #{id}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Chọn Technician (Multi-select) */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">
                  Chọn kỹ thuật viên *
                </label>
                <span className="text-xs text-muted-foreground">
                  Đã chọn: {assignedTechIds.length}
                </span>
              </div>
              <Card className="border p-1 rounded-md h-48">
                <ScrollArea className="h-full">
                  <div className="space-y-1 p-2">
                    {technicians.map((tech) => (
                      <div
                        key={tech.userID}
                        className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                        onClick={() => {
                          // Cho phép click vào dòng để chọn
                          const isChecked = assignedTechIds.includes(
                            tech.userID.toString()
                          );
                          handleToggleTechnician(
                            tech.userID.toString(),
                            !isChecked
                          );
                        }}
                      >
                        <Checkbox
                          id={`tech-${tech.userID}`}
                          checked={assignedTechIds.includes(
                            tech.userID.toString()
                          )}
                          onCheckedChange={(checked) =>
                            handleToggleTechnician(
                              tech.userID.toString(),
                              checked as boolean
                            )
                          }
                          // Ngăn sự kiện click dòng lan vào checkbox gây double toggle
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="grid gap-0.5">
                          {/* Hiển thị fullName và role từ TechnicianUser */}
                          <label className="text-sm font-medium cursor-pointer">
                            {tech.fullName}
                          </label>
                          <span className="text-xs text-muted-foreground">
                            {tech.role?.roleName} - {tech.email}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </div>

            {/* Ngày hoàn thành & Ghi chú */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Ngày dự kiến
                </label>
                <Input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={expectedCompletionDate}
                  onChange={(e) => setExpectedCompletionDate(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Ghi chú
                </label>
                <Input
                  placeholder="Ghi chú nội bộ..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleConfirmAssign} disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Thông báo kết quả */}
      <Dialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
      >
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex justify-center mb-4">
            {alertDialog.type === "success" ? (
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            ) : (
              <AlertCircle className="w-12 h-12 text-red-500" />
            )}
          </div>
          <DialogHeader>
            <DialogTitle className="text-center">
              {alertDialog.title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">{alertDialog.description}</p>
          <DialogFooter className="sm:justify-center mt-4">
            <Button
              onClick={() => setAlertDialog({ ...alertDialog, open: false })}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
