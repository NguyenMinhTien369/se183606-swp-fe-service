"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Badge } from "../../../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Label } from "../../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../../components/ui/dialog";
import { Settings } from "lucide-react";
import { claimAssignmentAPI } from "@/utility/index";
import type { AssignmentProgressResponse } from "../types";

interface RepairProgressProps {
  selectedRequest?: any;
  onSelectRequest?: (request: any) => void;
  onNextStep?: () => void;
}

export function RepairProgress({
  selectedRequest,
  onSelectRequest,
  onNextStep,
}: RepairProgressProps) {
  // Get technician ID from localStorage or auth context
  const TECHNICIAN_ID = 1; // TODO: Get from AuthContext

  const [assignments, setAssignments] = useState<AssignmentProgressResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentWorkingRequest, setCurrentWorkingRequest] =
    useState<AssignmentProgressResponse | null>(null);
  const [dialog, setDialog] = useState({ open: false, title: "", message: "" });

  const [workStatus, setWorkStatus] = useState({
    startTime: "",
    expectedCompletion: "",
    status: "Đang thay thế",
    completionPercentage: 10,
  });

  const [partInfo, setPartInfo] = useState({
    newPartSerial: "",
    notes: "Phụ tùng mới đã được kiểm tra và lắp đặt đúng quy trình",
  });

  // Load assignments on mount
  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await claimAssignmentAPI.getAssignmentsByTechnician(
        TECHNICIAN_ID
      );
      // Filter only IN_PROGRESS status (currently being repaired)
      const inProgressClaims = response.data.result.filter(
        (assignment: AssignmentProgressResponse) =>
          assignment.status === "Đang thay thế"
      );
      setAssignments(inProgressClaims);

      // Auto-select first assignment if exists
      if (inProgressClaims.length > 0 && !currentWorkingRequest) {
        setCurrentWorkingRequest(inProgressClaims[0]);
        onSelectRequest?.(inProgressClaims[0]);
      }
    } catch (error) {
      console.error("Error loading assignments:", error);
      showDialog("Lỗi", "Không thể tải danh sách yêu cầu đang sửa chữa.");
    } finally {
      setIsLoading(false);
    }
  };

  const showDialog = (title: string, message: string) => {
    setDialog({ open: true, title, message });
  };

  const handleSelectRequest = (assignment: AssignmentProgressResponse) => {
    setCurrentWorkingRequest(assignment);
    onSelectRequest?.(assignment);
  };

  const handleUpdatePartInfo = () => {
    if (!partInfo.newPartSerial.trim()) {
      showDialog("Lỗi", "Vui lòng nhập số seri phụ tùng mới.");
      return;
    }

    showDialog("Cập nhật thành công", "Đã cập nhật thông tin phụ tùng.");
  };

  const handleCompleteWork = async () => {
    if (!partInfo.newPartSerial.trim()) {
      showDialog(
        "Lỗi",
        "Vui lòng nhập số seri phụ tùng mới trước khi hoàn thành."
      );
      return;
    }

    if (!currentWorkingRequest) return;

    try {
      const formData = new FormData();
      formData.append("status", "Hoàn thành");
      formData.append("completionPercentage", "100");
      formData.append(
        "internalNotes",
        `Hoàn thành sửa chữa. Serial phụ tùng mới: ${partInfo.newPartSerial}. ${partInfo.notes}`
      );

      await claimAssignmentAPI.updateAssignmentProgress(
        currentWorkingRequest.assignmentID,
        formData
      );

      setWorkStatus((prev) => ({
        ...prev,
        status: "Hoàn thành",
        completionPercentage: 100,
      }));

      showDialog("Hoàn tất", "Đã hoàn thành sửa chữa.");

      setTimeout(() => {
        onNextStep?.();
      }, 1200);
    } catch (error) {
      console.error("Error completing work:", error);
      showDialog("Lỗi", "Không thể hoàn thành sửa chữa. Vui lòng thử lại.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Bảng chọn yêu cầu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Chọn yêu cầu bảo hành để sửa chữa</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã yêu cầu</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead>Kỹ thuật viên</TableHead>
                <TableHead>Tiến độ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày phân công</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                      <span className="text-muted-foreground">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">
                      Không có yêu cầu nào đang sửa chữa
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((assignment) => (
                  <TableRow
                    key={assignment.assignmentID}
                    className={`cursor-pointer transition-all hover:bg-muted/50 ${
                      currentWorkingRequest?.assignmentID ===
                      assignment.assignmentID
                        ? "bg-blue-50 border-blue-200"
                        : ""
                    }`}
                    onClick={() => handleSelectRequest(assignment)}
                  >
                    <TableCell className="font-medium">
                      #{assignment.claimCode}
                    </TableCell>
                    <TableCell>{assignment.vin}</TableCell>
                    <TableCell>{assignment.technicianName}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${assignment.completionPercentage}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm">
                          {assignment.completionPercentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        🔧 Đang sửa
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(assignment.assignedDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={
                          currentWorkingRequest?.assignmentID ===
                          assignment.assignmentID
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRequest(assignment);
                        }}
                      >
                        {currentWorkingRequest?.assignmentID ===
                        assignment.assignmentID
                          ? "Đã chọn"
                          : "Chọn"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Chi tiết yêu cầu */}
      {currentWorkingRequest && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết yêu cầu đang thực hiện</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Mã yêu cầu</Label>
                  <p className="font-medium">
                    #{currentWorkingRequest.claimCode}
                  </p>
                </div>
                <div>
                  <Label>VIN</Label>
                  <p className="font-medium">{currentWorkingRequest.vin}</p>
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <Badge
                    className={
                      workStatus.status === "Đang thay thế"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {workStatus.status === "Đang thay thế" &&
                      "🔧 Đang thay thế"}
                    {workStatus.status === "Hoàn thành" && "✅ Hoàn thành"}
                  </Badge>
                </div>
                <div>
                  <Label>Kỹ thuật viên</Label>
                  <p className="font-medium">
                    {currentWorkingRequest.technicianName}
                  </p>
                </div>
                <div>
                  <Label>Thời gian bắt đầu</Label>
                  <Input
                    type="datetime-local"
                    value={workStatus.startTime}
                    onChange={(e) =>
                      setWorkStatus((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    disabled={workStatus.status === "received"}
                  />
                </div>
                <div>
                  <Label>Dự kiến hoàn thành</Label>
                  <Input
                    type="datetime-local"
                    value={workStatus.expectedCompletion}
                    onChange={(e) =>
                      setWorkStatus((prev) => ({
                        ...prev,
                        expectedCompletion: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                {workStatus.status === "Đang thay thế" && (
                  <Button
                    onClick={handleCompleteWork}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Hoàn thành sửa chữa
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thông tin phụ tùng */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>🧰 Phụ tùng & thông số</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Số seri phụ tùng mới *</Label>
                  <Input
                    placeholder="Nhập số seri phụ tùng mới..."
                    value={partInfo.newPartSerial}
                    onChange={(e) =>
                      setPartInfo((prev) => ({
                        ...prev,
                        newPartSerial: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Ghi chú kỹ thuật</Label>
                <Textarea
                  placeholder="Nhập ghi chú về quá trình thay thế phụ tùng..."
                  value={partInfo.notes}
                  onChange={(e) =>
                    setPartInfo((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleUpdatePartInfo} variant="outline">
                  Cập nhật thông tin
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Thông tin phụ tùng sẽ được gắn với hồ
                  sơ xe và đồng bộ với hệ thống quản lý.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Nút hành động */}
      {currentWorkingRequest && workStatus.status === "Hoàn thành" && (
        <div className="flex justify-end">
          <Button onClick={onNextStep} size="lg">
            Tiến tới bước tiếp theo
          </Button>
        </div>
      )}

      {/* Dialog thông báo */}
      <Dialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ ...dialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.title}</DialogTitle>
            <DialogDescription>{dialog.message}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setDialog({ ...dialog, open: false })}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
