"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
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
import { Settings, CheckCircle, Loader2 } from "lucide-react";
import { claimAssignmentAPI } from "@/utility/index";
import { useAuth } from "@/pages/Login/feature/AuthContext";
import type { AssignmentProgressResponse, AssignmentStatus } from "../types";

interface RepairProgressProps {
  onSelectRequest?: (request: any) => void;
  onNextStep?: () => void;
}

export function RepairProgress({
  onSelectRequest,
  onNextStep,
}: RepairProgressProps) {
  const { user } = useAuth();
  const TECHNICIAN_ID = user?.userId;

  const [assignments, setAssignments] = useState<AssignmentProgressResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWorkingRequest, setCurrentWorkingRequest] =
    useState<AssignmentProgressResponse | null>(null);
  const [dialog, setDialog] = useState({ open: false, title: "", message: "" });
  const [partInfo, setPartInfo] = useState({
    internalNotes: "Phụ tùng mới đã được kiểm tra và lắp đặt đúng quy trình.",
  });
  const [progressPhotos, setProgressPhotos] = useState<File[]>([]);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    if (!TECHNICIAN_ID) {
      console.error("Technician ID not found");
      showDialog(
        "Lỗi",
        "Không tìm thấy thông tin kỹ thuật viên. Vui lòng đăng nhập lại."
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await claimAssignmentAPI.getAssignmentsByTechnician(TECHNICIAN_ID);
      // Filter assignments ready for repair: "Nhận phụ tùng" (just confirmed) OR "Đang thay thế" (in progress)
      const repairReadyClaims = response.data.result.filter(
        (assignment: AssignmentProgressResponse) =>
          assignment.status === "Nhận phụ tùng" ||
          assignment.status === "Đang thay thế"
      );
      setAssignments(repairReadyClaims);

      // Update current working request if it exists in the new list
      if (currentWorkingRequest) {
        const updatedCurrent = repairReadyClaims.find(
          (a: AssignmentProgressResponse) => a.assignmentID === currentWorkingRequest.assignmentID
        );
        if (updatedCurrent) {
          console.log("Updating current request with new data:", updatedCurrent);
          setCurrentWorkingRequest(updatedCurrent);
          onSelectRequest?.(updatedCurrent);
        }
      } else if (repairReadyClaims.length > 0) {
        // Auto-select first assignment if no current selection
        setCurrentWorkingRequest(repairReadyClaims[0]);
        onSelectRequest?.(repairReadyClaims[0]);
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
    setProgressPhotos([]);
    setPartInfo({ internalNotes: "Phụ tùng mới đã được kiểm tra và lắp đặt đúng quy trình." });
  };

  const handleProgressPhotosUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setProgressPhotos((prev) => [...prev, ...newFiles]);
    showDialog("Thành công", `Đã tải lên ${newFiles.length} ảnh hiện trường.`);
  };

  const handleStartRepair = async () => {
    if (!currentWorkingRequest) return;
    if (progressPhotos.length === 0) {
      showDialog("Lỗi", "Vui lòng chụp ảnh hiện trường trước khi bắt đầu sửa chữa.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("status", "Đang thay thế");
      formData.append("internalNotes", `🔧 Bắt đầu thay thế phụ tùng.`);
      progressPhotos.forEach((file) => {
        formData.append("newProgressFiles", file);
      });

      const response = await claimAssignmentAPI.updateAssignmentProgress(
        currentWorkingRequest.assignmentID,
        formData
      );

      showDialog("Bắt đầu", "✅ Đã bắt đầu quá trình thay thế phụ tùng.");

      // Cập nhật state local ngay lập tức
      const updatedAssignment = response.data.result;
      setCurrentWorkingRequest(updatedAssignment);
      setAssignments(prev =>
        prev.map(a => a.assignmentID === updatedAssignment.assignmentID ? updatedAssignment : a)
      );
      onSelectRequest?.(updatedAssignment);
    } catch (error) {
      console.error("Error starting repair:", error);
      showDialog("Lỗi", "Không thể bắt đầu sửa chữa. Vui lòng thử lại.");
    }
  };

  const handleCompleteWork = async () => {
    if (!partInfo.internalNotes.trim()) {
      showDialog("Lỗi", "Vui lòng nhập ghi chú nội bộ về quá trình thay thế.");
      return;
    }
    if (!currentWorkingRequest) return;

    try {
      const formData = new FormData();
      formData.append("status", "Đang kiểm tra");
      const notes = `Đã thay thế phụ tùng.\nGhi chú: ${partInfo.internalNotes}`;
      formData.append("internalNotes", notes);

      await claimAssignmentAPI.updateAssignmentProgress(
        currentWorkingRequest.assignmentID,
        formData
      );

      showDialog(
        "Thành công",
        "Đã lưu thông tin. Vui lòng chuyển sang bước 3 để Hoàn tất & Bàn giao."
      );

      loadAssignments();

      setTimeout(() => {
        onNextStep?.();
      }, 2000);
    } catch (error: any) {
      console.error("Error updating progress:", error);

      // Extract detailed error message
      let errorMessage = "Không thể cập nhật tiến độ. ";
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Vui lòng thử lại.";
      }

      showDialog("Lỗi", errorMessage);
    }
  };

  const getStatusBadge = (status: AssignmentStatus) => {
    if (status === "Nhận phụ tùng") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Đã nhận phụ tùng
        </Badge>
      );
    }
    if (status === "Đang thay thế") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Settings className="w-3 h-3 mr-1 animate-spin" />
          Đang thay thế
        </Badge>
      );
    }
    return <Badge>{status}</Badge>;
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
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
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
                    className={`cursor-pointer transition-all hover:bg-muted/50 ${currentWorkingRequest?.assignmentID ===
                      assignment.assignmentID
                      ? "bg-blue-50 border-blue-200"
                      : ""
                      }`}
                    onClick={() => handleSelectRequest(assignment)}
                  >
                    <TableCell className="font-medium">
                      {getStatusBadge(assignment.status as AssignmentStatus)}
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
                      currentWorkingRequest.status === "Đang thay thế"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {currentWorkingRequest.status === "Đang thay thế" &&
                      "🔧 Đang thay thế"}
                    {currentWorkingRequest.status === "Nhận phụ tùng" &&
                      "📦 Đã nhận phụ tùng"}
                    {currentWorkingRequest.status === "Hoàn thành" && "✅ Hoàn thành"}
                  </Badge>
                </div>
                <div>
                  <Label>Kỹ thuật viên</Label>
                  <p className="font-medium">
                    {currentWorkingRequest.technicianName}
                  </p>
                </div>
                <div>
                  <Label>Tiến độ công việc</Label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${currentWorkingRequest.completionPercentage}%`,
                        }}
                      />
                    </div>
                    <span className="text-lg font-semibold text-blue-600">
                      {currentWorkingRequest.completionPercentage}%
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Thời gian phân công</Label>
                  <p className="font-medium">
                    {new Date(currentWorkingRequest.assignedDate).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                {currentWorkingRequest?.status === "Nhận phụ tùng" && (
                  <Button
                    onClick={handleStartRepair}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={progressPhotos.length === 0} // Disable nếu chưa có ảnh
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Bắt đầu sửa chữa (Đã chụp {progressPhotos.length} ảnh)
                  </Button>
                )}
                {currentWorkingRequest?.status === "Đang thay thế" && (
                  <Button
                    onClick={handleCompleteWork}
                    className="bg-green-600 hover:bg-green-700 text-white" // ⬅️ Đổi màu
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Lưu & Chuyển sang Bước 3 (Bàn giao)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 1: Bắt đầu sửa chữa - Upload ảnh hiện trường */}
          {currentWorkingRequest?.status === "Nhận phụ tùng" && (
            <Card className="border-blue-300 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <Settings className="w-5 h-5" />
                  <span>📸 Bước 1: Chụp ảnh hiện trường trước khi sửa chữa</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Ảnh hiện trường (Trước khi bắt đầu thay thế) *</Label>
                  <div
                    className="mt-2 border-2 border-dashed border-blue-300 rounded-lg p-4 bg-white">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleProgressPhotosUpload(e.target.files)}
                      className="hidden"
                      id="progress-photos"
                    />
                    <label htmlFor="progress-photos" className="cursor-pointer block text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Settings className="w-8 h-8 text-blue-400" />
                        <p className="text-sm text-gray-600">
                          📷 Nhấn để chụp/chọn ảnh hiện trường
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG tối đa 10MB mỗi ảnh
                        </p>
                      </div>
                    </label>

                    {progressPhotos.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {progressPhotos.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Progress ${index + 1}`}
                              className="w-full h-20 object-cover rounded border-2 border-blue-200"
                            />
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {file.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-100 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>⚠️ Quan trọng:</strong> Ảnh hiện trường phải được chụp trước khi bắt đầu
                    thay thế phụ tùng.
                    Đây là bằng chứng về tình trạng xe trước sửa chữa.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 2: Cập nhật tiến độ thay thế - Nhập ghi chú */}
          {currentWorkingRequest?.status === "Đang thay thế" && (
            <Card className="border-orange-300 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <Settings className="w-5 h-5" />
                  <span>📝 Bước 2: Cập nhật tiến độ thay thế phụ tùng</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Ghi chú nội bộ về quá trình thay thế *</Label>
                  <Textarea
                    placeholder="Mô tả chi tiết quá trình thay thế phụ tùng: tình trạng phụ tùng cũ, cách thức lắp đặt, kiểm tra chất lượng..."
                    value={partInfo.internalNotes}
                    onChange={(e) =>
                      setPartInfo((prev) => ({ ...prev, internalNotes: e.target.value }))
                    }
                    rows={5}
                    className="bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Ghi chú này dùng nội bộ, không hiển thị cho khách hàng.
                    Nên ghi rõ: phụ tùng đã thay, vấn đề phát hiện, các kiểm tra đã thực hiện.
                  </p>
                </div>

                <div className="bg-orange-100 p-3 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>📋 Thông tin cần ghi:</strong> Mô tả chi tiết quá trình thay thế,
                    tình trạng phụ tùng cũ, phụ tùng mới đã lắp, các kiểm tra kỹ thuật đã thực hiện.
                  </p>
                </div>

                {progressPhotos.length > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-300">
                    <p className="text-sm text-green-700 mb-2">
                      ✅ Đã có {progressPhotos.length} ảnh hiện trường từ bước trước
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {progressPhotos.map((file, index) => (
                        <div key={index}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Progress ${index + 1}`}
                            className="w-full h-16 object-cover rounded border"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Nút hành động - đã ẩn vì tự động chuyển sau khi hoàn tất */}

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
