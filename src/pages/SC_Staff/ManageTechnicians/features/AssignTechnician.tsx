import { useState, useEffect } from "react";
import { UserPlus, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
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
import type { WarrantyClaimResponse, TechnicianUser } from "../types";
import {
  getClaimStatusLabel,
  getClaimStatusColor,
} from "../lib/utils-warranty";
import { claimAssignmentAPI, warrantyClaimAPI } from "@/utility/index";

export default function AssignTechnician() {
  const [claims, setClaims] = useState<WarrantyClaimResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainTechnician, setMainTechnician] = useState<string>("");
  const [expectedCompletionDate, setExpectedCompletionDate] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: "success" | "error";
  }>({ open: false, title: "", description: "", type: "success" });

  // Hardcoded serviceCenterID - in production, get from auth context
  const SERVICE_CENTER_ID = 1;

  // ✅ Filter claims với status "Được chấp nhận" (ready to assign)
  const pendingRequests = claims.filter((r) => r.status === "Được chấp nhận");

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadWarrantyClaims(), loadTechnicians()]);
  };

  const loadWarrantyClaims = async () => {
    try {
      setIsLoading(true);
      const response = await warrantyClaimAPI.getClaimsByServiceCenter(
        SERVICE_CENTER_ID
      );
      const claimsData = response.data.result || [];
      setClaims(claimsData);
    } catch (error: any) {
      console.error(" Error loading warranty claims:", error);
      setAlertDialog({
        open: true,
        title: "Lỗi tải dữ liệu",
        description:
          error.response?.data?.message ||
          "Không thể tải danh sách yêu cầu bảo hành",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      const response = await claimAssignmentAPI.getTechnicians();
      setTechnicians(response.data.result || []);
    } catch (error) {
      console.error(" Error loading technicians:", error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(pendingRequests.map((r) => r.claimID));
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
    setMainTechnician("");
    setExpectedCompletionDate("");
    setInternalNotes("");
    setIsModalOpen(true);
  };

  const handleConfirmAssign = async () => {
    console.log("🔍 Validation check:");
    console.log("  mainTechnician:", mainTechnician);
    console.log("  Type:", typeof mainTechnician);
    console.log("  Is empty?", !mainTechnician || mainTechnician === "");
    console.log("  Selected requests:", selectedRequests);

    if (!mainTechnician || mainTechnician === "") {
      setAlertDialog({
        open: true,
        title: "Thiếu kỹ thuật viên chính",
        description: "Vui lòng chọn kỹ thuật viên chính trước khi xác nhận.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Assign each selected claim to technician
      const assignPromises = selectedRequests.map((claimID) =>
        claimAssignmentAPI.assignTechnician({
          claimID,
          technicianIDs: [Number(mainTechnician)], // Backend expects array of technician IDs
          expectedCompletionDate: expectedCompletionDate || undefined,
          internalNotes: internalNotes || undefined,
        })
      );

      await Promise.all(assignPromises);

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

      // Refresh data
      await loadWarrantyClaims();
    } catch (error: any) {
      console.error("Error assigning technician:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Request payload:", {
        claimID: selectedRequests[0],
        primaryTechnicianID: Number(mainTechnician),
        expectedCompletionDate: expectedCompletionDate || undefined,
        internalNotes: internalNotes || undefined,
      });
      setAlertDialog({
        open: true,
        title: "Lỗi phân công",
        description:
          error.response?.data?.message ||
          error.response?.data?.error ||
          JSON.stringify(error.response?.data) ||
          "Không thể phân công kỹ thuật viên. Vui lòng thử lại.",

        type: "error",
      });
    } finally {
      setIsSubmitting(false);
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
            Gán kỹ thuật viên cho yêu cầu bảo hành đã được chấp nhận
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
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
                    checked={
                      selectedRequests.length === pendingRequests.length &&
                      pendingRequests.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    disabled={isLoading}
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                  </TableCell>
                </TableRow>
              ) : pendingRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">
                      Không có yêu cầu nào cần phân công (Chỉ hiển thị yêu cầu
                      đã được chấp nhận)
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                pendingRequests.map((request) => (
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
                      <Badge className={getClaimStatusColor(request.status)}>
                        {getClaimStatusLabel(request.status)}
                      </Badge>
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
                onValueChange={(value) => {
                  console.log("👤 Selected technician ID:", value);
                  console.log("📝 Type of value:", typeof value);
                  setMainTechnician(value);
                }}
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
              <p className="text-xs text-muted-foreground mt-1">
                Current value: "{mainTechnician}" (Type: {typeof mainTechnician}
                )
              </p>
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

      {/* Notification Dialog (replaces toast) */}
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
