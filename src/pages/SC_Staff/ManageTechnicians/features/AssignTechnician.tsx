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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/StatusBadge";

import { useGetClaimsForAssignment } from "@/hooks/ManageTechnicians/AssignTechnician/useGetClaimsForAssignment";
import { useGetTechnicians } from "@/hooks/ManageTechnicians/AssignTechnician/useGetTechnicians";
import { useAssignTech } from "@/hooks/ManageTechnicians/AssignTechnician/useAssignTech";

export default function AssignTechnician() {
  const {
    claims,
    isLoading: isClaimsLoading,
    fetchClaims,
  } = useGetClaimsForAssignment();
  const { technicians, fetchTechnicians } = useGetTechnicians();

  const { assignTechnician, isSubmitting } = useAssignTech();

  // Local State cho UI
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainTechnician, setMainTechnician] = useState<string>("");
  const [expectedCompletionDate, setExpectedCompletionDate] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: "success" | "error";
  }>({ open: false, title: "", description: "", type: "success" });

  // Sắp xếp claims theo creationDate (Mới nhất lên đầu)
  const sortedClaims = useMemo(() => {
    return [...claims].sort((a, b) => {
      return (
        new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
      );
    });
  }, [claims]);

  // Load dữ liệu ban đầu
  // ĐƠN GIẢN HÓA LOGIC useEffect: Không cần kiểm tra user?.serviceCenterID vì API /unassigned tự xử lý
  useEffect(() => {
    fetchClaims();
    fetchTechnicians();
  }, [fetchClaims, fetchTechnicians]); // Chỉ phụ thuộc vào fetch functions

  // Logic xử lý Select All (Sử dụng sortedClaims)
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(sortedClaims.map((r) => r.claimID));
    } else {
      setSelectedRequests([]);
    }
  };

  // Logic xử lý Select từng dòng
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
    setMainTechnician("");
    setExpectedCompletionDate("");
    setInternalNotes("");
    setIsModalOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!mainTechnician || mainTechnician === "") {
      setAlertDialog({
        open: true,
        title: "Thiếu kỹ thuật viên chính",
        description: "Vui lòng chọn kỹ thuật viên chính trước khi xác nhận.",
        type: "error",
      });
      return;
    }

    const result = await assignTechnician({
      claimIDs: selectedRequests,
      mainTechnicianID: Number(mainTechnician),
      expectedCompletionDate,
      internalNotes,
    });

    if (result.success) {
      const tech = technicians.find((t) => t.userID === Number(mainTechnician));

      setAlertDialog({
        open: true,
        title: "Phân công thành công",
        description: `Đã phân công ${tech?.fullName} xử lý ${selectedRequests.length} yêu cầu.`,
        type: "success",
      });

      setIsModalOpen(false);
      setSelectedRequests([]);
      setMainTechnician("");
      setExpectedCompletionDate("");
      setInternalNotes("");

      await fetchClaims();
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Phân công kỹ thuật viên
          </h2>
          <p className="text-sm text-muted-foreground">
            Gán kỹ thuật viên cho yêu cầu bảo hành
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

      <Card className="border rounded-xl shadow-sm">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    // Sử dụng sortedClaims
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
                <TableHead>Trung tâm</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Mô tả</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isClaimsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                  </TableCell>
                </TableRow>
              ) : sortedClaims.length === 0 ? ( // Sử dụng sortedClaims
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">
                      Không có yêu cầu nào cần phân công
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                // Sử dụng sortedClaims để render đúng thứ tự
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
                    <TableCell>{request.serviceCenterName || "-"}</TableCell>
                    <TableCell>
                      {new Date(request.creationDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>

                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {request.description || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Assign Technician Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Phân công kỹ thuật viên
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Selected Requests */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Yêu cầu được chọn
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedRequests.map((id) => (
                  <Badge key={id} variant="secondary" className="rounded-md">
                    #{id}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Main Technician */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Kỹ thuật viên chính *
              </label>
              <Select
                value={mainTechnician}
                onValueChange={(value) => setMainTechnician(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kỹ thuật viên..." />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem
                      key={tech.userID}
                      value={tech.userID.toString()}
                    >
                      {tech.fullName} — {tech.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expected Completion Date */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Ngày dự kiến hoàn thành
              </label>
              <Input
                type="date"
                value={expectedCompletionDate}
                onChange={(e) => setExpectedCompletionDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Assignment Date (Read-only) */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Ngày phân công
              </label>
              <div className="p-3 bg-muted rounded-lg text-sm">
                {new Date().toLocaleDateString("vi-VN")}
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Ghi chú nội bộ
              </label>
              <Textarea
                placeholder="Nhập ghi chú cho kỹ thuật viên..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button onClick={handleConfirmAssign} disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
      >
        <DialogContent className="sm:max-w-md rounded-xl text-center space-y-4">
          <div className="flex flex-col items-center justify-center space-y-3">
            {alertDialog.type === "success" ? (
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            ) : (
              <AlertCircle className="w-12 h-12 text-red-500" />
            )}
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {alertDialog.title}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {alertDialog.description}
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setAlertDialog({ ...alertDialog, open: false })}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
