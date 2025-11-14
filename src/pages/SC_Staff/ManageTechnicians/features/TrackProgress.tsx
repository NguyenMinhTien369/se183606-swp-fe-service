import { useState, useEffect } from "react";
import { Edit, Bell, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { claimAssignmentAPI } from "@/utility/index";
import type { AssignmentProgress } from "../types";
import {
  getAssignmentStatusLabel,
  getAssignmentStatusColor,
} from "../lib/utils-warranty";

export default function TrackProgress() {
  const [assignments, setAssignments] = useState<AssignmentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<AssignmentProgress | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
  }>({
    title: "",
    message: "",
    type: "success",
  });
  const [newNote, setNewNote] = useState("");

  // Hardcoded serviceCenterID - in production, get from auth context
  const SERVICE_CENTER_ID = 1;

  // Load assignments on mount
  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await claimAssignmentAPI.getAssignmentsProgress(
        SERVICE_CENTER_ID
      );
      const assignmentsData = response.data.result || [];

      // ✅ Sắp xếp theo ngày phân công mới nhất
      const sortedAssignments = assignmentsData.sort(
        (a: AssignmentProgress, b: AssignmentProgress) => {
          const dateA = new Date(a.assignedDate).getTime();
          const dateB = new Date(b.assignedDate).getTime();
          return dateB - dateA; // Mới nhất trước
        }
      );

      setAssignments(sortedAssignments);
    } catch (error) {
      console.error("Error loading assignments:", error);
      setAlertMessage({
        title: "Lỗi",
        message: "Không thể tải danh sách phân công",
        type: "error",
      });
      setIsAlertDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = (request: AssignmentProgress) => {
    setSelectedRequest(request);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async () => {
    if (!selectedRequest || !newNote.trim()) {
      setAlertMessage({
        title: "Thiếu thông tin",
        message: "Vui lòng nhập ghi chú trước khi lưu.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
      return;
    }

    try {
      // Create FormData for update
      const formData = new FormData();
      formData.append("internalNotes", newNote);

      await claimAssignmentAPI.updateAssignmentProgress(
        selectedRequest.assignmentID,
        formData
      );

      setAlertMessage({
        title: "Thành công",
        message: `Đã thêm ghi chú cho phân công #${selectedRequest.assignmentID}.`,
        type: "success",
      });
      setIsAlertDialogOpen(true);

      // Reload data
      await loadAssignments();

      setIsNoteModalOpen(false);
      setNewNote("");
      setSelectedRequest(null);
    } catch (error: any) {
      console.error("Error saving note:", error);
      setAlertMessage({
        title: "Lỗi",
        message: error.response?.data?.message || "Không thể lưu ghi chú",
        type: "error",
      });
      setIsAlertDialogOpen(true);
    }
  };

  const handleSendReminder = (request: AssignmentProgress) => {
    // This is a UI-only feature, could integrate with notification system
    setAlertMessage({
      title: "Đã gửi nhắc nhở",
      message: `Nhắc nhở đã được gửi đến ${request.technicianName} cho phân công #${request.assignmentID}.`,
      type: "success",
    });
    setIsAlertDialogOpen(true);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">
            Theo dõi tiến độ xử lý
          </h2>
          <p className="text-muted-foreground">
            Giúp SC Staff theo dõi tình trạng bảo hành và tiến độ thực hiện.
          </p>
        </div>
      </div>

      {/* Bảng theo dõi tiến độ */}
      <Card className="shadow-sm border border-border/60">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã yêu cầu</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead>Kỹ thuật viên</TableHead>
                <TableHead>Ngày nhận</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>% hoàn thành</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                  </TableCell>
                </TableRow>
              ) : assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">
                      Không có phân công nào đang xử lý
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((assignment) => (
                  <TableRow
                    key={assignment.assignmentID}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      #{assignment.claimCode}
                    </TableCell>
                    <TableCell>{assignment.vin}</TableCell>
                    <TableCell>{assignment.technicianName || "-"}</TableCell>
                    <TableCell>
                      {assignment.assignedDate
                        ? new Date(assignment.assignedDate).toLocaleDateString(
                            "vi-VN"
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getAssignmentStatusColor(assignment.status)}
                      >
                        {getAssignmentStatusLabel(assignment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2 min-w-[200px]">
                        <div className="flex items-center justify-between">
                          <span>{assignment.completionPercentage || 0}%</span>
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <Progress
                          value={assignment.completionPercentage || 0}
                          className="h-2 rounded-full"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {assignment.internalNotes ? (
                        <span className="block text-sm">
                          {assignment.internalNotes}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAddNote(assignment)}
                          title="Thêm ghi chú"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSendReminder(assignment)}
                          title="Gửi nhắc nhở"
                        >
                          <Bell className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Dialog: thêm ghi chú */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm ghi chú nội bộ</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Mã phân công
                </label>
                <div className="p-3 bg-muted rounded-md font-medium">
                  #{selectedRequest.assignmentID}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Mã yêu cầu
                </label>
                <div className="p-3 bg-muted rounded-md font-medium">
                  #{selectedRequest.claimCode}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  VIN
                </label>
                <div className="p-3 bg-muted rounded-md font-medium">
                  {selectedRequest.vin}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Kỹ thuật viên
                </label>
                <div className="p-3 bg-muted rounded-md font-medium">
                  {selectedRequest.technicianName}
                </div>
              </div>

              {selectedRequest.internalNotes && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Ghi chú hiện tại
                  </label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {selectedRequest.internalNotes}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm mb-1 block font-medium">
                  Ghi chú mới *
                </label>
                <Textarea
                  placeholder="Nhập ghi chú nội bộ..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNoteModalOpen(false);
                setNewNote("");
                setSelectedRequest(null);
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveNote}>Lưu ghi chú</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: thông báo kết quả thao tác (thay cho toast) */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center gap-3 py-2">
            {alertMessage.type === "success" ? (
              <CheckCircle2 className="text-green-600 w-10 h-10" />
            ) : (
              <AlertTriangle className="text-red-600 w-10 h-10" />
            )}
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {alertMessage.title}
              </DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">{alertMessage.message}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAlertDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
