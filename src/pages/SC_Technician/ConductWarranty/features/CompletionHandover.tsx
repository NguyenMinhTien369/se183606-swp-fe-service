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
import { Label } from "../../../../components/ui/label";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Badge } from "../../../../components/ui/badge";
import { Upload, FileText, Camera, Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { claimAssignmentAPI } from "@/utility/index";
import { useAuth } from "@/pages/Login/feature/AuthContext";
import type { AssignmentProgressResponse } from "../types";

interface CompletionHandoverProps {
  onComplete?: () => void;
}

export function CompletionHandover({
  onComplete,
}: CompletionHandoverProps) {
  // Get technician ID from auth context
  const { user } = useAuth();
  const TECHNICIAN_ID = user?.userId;

  const [assignments, setAssignments] = useState<AssignmentProgressResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAssignment, setCurrentAssignment] =
    useState<AssignmentProgressResponse | null>(null);
  const [completionData, setCompletionData] = useState({
    workDescription: "",
    completionTime: new Date().toISOString().slice(0, 16),
    isDocumentComplete: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    newHandoverFiles_PDF: File | null; // DTO dùng key "newHandoverFiles"
    newHandoverFiles_Images: File[]; // DTO dùng key "newHandoverFiles"
    newProgressFiles_Images: File[]; // DTO dùng key "newProgressFiles"
  }>({
    newHandoverFiles_PDF: null,
    newHandoverFiles_Images: [],
    newProgressFiles_Images: [],
  });

  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    type: "info", // "success" | "error" | "info"
  });

  // Load completed assignments on mount
  useEffect(() => {
    loadCompletedAssignments();
  }, []);

  const loadCompletedAssignments = async () => {
    if (!TECHNICIAN_ID) {
      console.error("Technician ID not found");
      showError(
        "Không tìm thấy thông tin kỹ thuật viên. Vui lòng đăng nhập lại."
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await claimAssignmentAPI.getAssignmentsByTechnician(
        TECHNICIAN_ID
      );
      // Filter assignments ready for handover: ONLY "Đang kiểm tra"
      const readyForHandover = response.data.result.filter(
        (assignment: AssignmentProgressResponse) =>
          assignment.status === "Đang kiểm tra"
      );
      setAssignments(readyForHandover);

      // Logic auto-select assignment
      if (currentAssignment) {
        const updatedCurrent = readyForHandover.find(
          (a: AssignmentProgressResponse) => a.assignmentID === currentAssignment.assignmentID
        );
        if (updatedCurrent) {
          setCurrentAssignment(updatedCurrent);
        } else {
          setCurrentAssignment(readyForHandover.length > 0 ? readyForHandover[0] : null);
        }
      } else if (readyForHandover.length > 0) {
        setCurrentAssignment(readyForHandover[0]);
      }
    } catch (error) {
      console.error("❌ Error loading completed assignments:", error);
      showError("Không thể tải danh sách yêu cầu đã hoàn thành.");
    } finally {
      setIsLoading(false);
    }
  };

  const mockRequest = currentAssignment || {
    claimCode: "N/A",
    vin: "N/A",
    technicianName: "N/A",
  };

  const handleFileUpload = (
    type: keyof typeof uploadedFiles,
    files: FileList | null
  ) => {
    if (!files) return;

    // [SỬA LẠI KEY CHO ĐÚNG]
    if (type === "newHandoverFiles_PDF") {
      setUploadedFiles((prev) => ({
        ...prev,
        newHandoverFiles_PDF: files[0], // Sửa key
      }));
    } else {
      setUploadedFiles((prev) => ({
        ...prev,
        [type]: [...prev[type], ...Array.from(files)],
      }));
    }

    setDialog({
      open: true,
      title: "Tải lên thành công",
      message: `Đã tải lên ${files.length} tệp.`,
      type: "success",
    });
  };

  const handleSaveDraft = () => {
    setDialog({
      open: true,
      title: "Lưu nháp thành công",
      message: "Dữ liệu của bạn đã được lưu tạm thời.",
      type: "success",
    });
  };

  // [LOGIC ĐÃ SỬA HOÀN TOÀN]
  const handleConfirmHandover = async () => {
    if (isSubmitting) return;

    // 1. Validate
    if (!completionData.workDescription.trim()) {
      return showError("Vui lòng nhập mô tả công việc đã thực hiện");
    }
    if (uploadedFiles.newProgressFiles_Images.length === 0) {
      return showError("Vui lòng tải lên ít nhất 1 ảnh sau khi hoàn tất");
    }
    if (!uploadedFiles.newHandoverFiles_PDF) {
      return showError("Vui lòng tải lên biên bản bàn giao xe (PDF)");
    }
    if (uploadedFiles.newHandoverFiles_Images.length === 0) {
      return showError("Vui lòng tải lên ít nhất 1 ảnh bàn giao");
    }
    if (!completionData.isDocumentComplete) {
      return showError("Vui lòng xác nhận đầy đủ chứng từ");
    }
    if (!currentAssignment) {
      return showError("Không tìm thấy thông tin assignment");
    }

    setIsSubmitting(true);

    try {
      // 2. Build FormData
      const formData = new FormData();

      // CHỈ CẦN GỬI STATUS NÀY
      // Backend (ClaimAssignmentServiceImpl) sẽ tự động:
      // 1. Cập nhật status WarrantyClaim -> "Hoàn thành"
      // 2. Tạo ServiceHistory
      formData.append("status", "Hoàn thành");

      const completionNotes =
        `✅ HOÀN THÀNH BẢO HÀNH\n` +
        `Thời gian hoàn tất: ${new Date(completionData.completionTime).toLocaleString("vi-VN")}\n` +
        `Mô tả công việc: ${completionData.workDescription}`;
      formData.append("internalNotes", completionNotes);

      // 3. Append files với ĐÚNG KEY DTO (UpdateAssignmentRequest.java)
      // Key "newProgressFiles" cho ảnh hoàn tất (ảnh "sau")
      uploadedFiles.newProgressFiles_Images.forEach((file) => {
        formData.append("newProgressFiles", file);
      });

      // Key "newHandoverFiles" cho cả PDF và ảnh bàn giao
      if (uploadedFiles.newHandoverFiles_PDF) {
        formData.append("newHandoverFiles", uploadedFiles.newHandoverFiles_PDF);
      }
      uploadedFiles.newHandoverFiles_Images.forEach((file) => {
        formData.append("newHandoverFiles", file);
      });

      console.log("📤 Sending assignment update (Hoàn thành)...");

      // 4. GỌI API DUY NHẤT
      const response = await claimAssignmentAPI.updateAssignmentProgress(
        currentAssignment.assignmentID,
        formData
      );

      console.log("✅ Assignment update successful:", response.data);

      setDialog({
        open: true,
        title: "✅ Hoàn tất bàn giao thành công",
        message: "Đã hoàn tất bảo hành và bàn giao xe. Trạng thái đã được cập nhật.",
        type: "success",
      });

      // 5. Reset form và tải lại
      setCompletionData({
        workDescription: "",
        completionTime: new Date().toISOString().slice(0, 16),
        isDocumentComplete: false,
      });
      setUploadedFiles({
        newHandoverFiles_PDF: null,
        newHandoverFiles_Images: [],
        newProgressFiles_Images: [],
      });

      await loadCompletedAssignments(); // Tải lại (yêu cầu này sẽ biến mất)

      if (onComplete) {
        onComplete();
      }

    } catch (error: any) {
      console.error("❌ Error confirming handover:", error);
      let errorMessage = "Không thể hoàn thành bàn giao. ";
      errorMessage += error.response?.data?.message || error.message || "Vui lòng thử lại.";
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showError = (msg: string) =>
    setDialog({ open: true, title: "Lỗi", message: msg, type: "error" });

  return (
    <div className="p-6">
      <CardHeader className="px-0">
        <CardTitle className="text-xl font-semibold">
          Hoàn tất yêu cầu bảo hành
        </CardTitle>
        <p className="text-muted-foreground">
          Hoàn tất hồ sơ, cập nhật phụ tùng mới và bàn giao xe
        </p>
      </CardHeader>

      {/* Show message if no assignments ready for handover */}
      {!isLoading && assignments.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-muted rounded-xl">
          <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Không có yêu cầu cần bàn giao
          </h3>
          <p className="text-muted-foreground text-center">
            Tất cả yêu cầu bảo hành đã được hoàn tất.<br />
            Chuyển sang các tab trước để xử lý yêu cầu mới.
          </p>
        </div>
      )}

      {/* Show form only if there are assignments */}
      {!isLoading && assignments.length > 0 && (
        <CardContent className="px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Thông tin hoàn tất</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Request Info */}
                <div className="bg-muted p-4 rounded-xl">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Mã yêu cầu:</p>
                      <p className="font-medium">#{mockRequest.claimCode}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">VIN:</p>
                      <p className="font-medium">{mockRequest.vin}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Kỹ thuật viên:</p>
                      <p className="font-medium">{mockRequest.technicianName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Trạng thái:</p>
                      <Badge className="bg-blue-100 text-blue-800">
                        🔧 Đang hoàn tất
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="work-description">
                    Mô tả công việc đã thực hiện *
                  </Label>
                  <Textarea
                    id="work-description"
                    placeholder="Mô tả chi tiết các công việc đã thực hiện..."
                    value={completionData.workDescription}
                    onChange={(e) =>
                      setCompletionData((prev) => ({
                        ...prev,
                        workDescription: e.target.value,
                      }))
                    }
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="completion-time">Thời gian hoàn tất *</Label>
                  <Input
                    id="completion-time"
                    type="datetime-local"
                    value={completionData.completionTime}
                    onChange={(e) =>
                      setCompletionData((prev) => ({
                        ...prev,
                        completionTime: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Thời gian hiện tại đã được tự động điền sẵn
                  </p>
                </div>

                <div>
                  <Label>Hình ảnh hoàn tất (ảnh "sau") *</Label> {/* SỬA LẠI LABEL */}
                  <div
                    className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload("newProgressFiles_Images", e.target.files) // SỬA KEY
                      }
                      className="hidden"
                      id="completion-images"
                    />
                    <label htmlFor="completion-images" className="cursor-pointer">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        Kéo thả ảnh hoặc click để chọn
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG tối đa 10MB
                      </p>
                    </label>

                    {uploadedFiles.newProgressFiles_Images.length > 0 && ( // SỬA KEY
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {uploadedFiles.newProgressFiles_Images.map((file, index) => ( // SỬA KEY
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Completion ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
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
              </CardContent>
            </Card>

            {/* Right Column */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span>Tài liệu bàn giao</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Biên bản bàn giao xe (PDF) *</Label>
                  <div
                    className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) =>
                        handleFileUpload("newHandoverFiles_PDF", e.target.files) // SỬA KEY
                      }
                      className="hidden"
                      id="handover-doc"
                    />
                    <label htmlFor="handover-doc" className="cursor-pointer">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Tải lên biên bản bàn giao</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Chỉ chấp nhận file PDF
                      </p>
                    </label>

                    {uploadedFiles.newHandoverFiles_PDF && ( // SỬA KEY
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-green-600" />
                          <span className="text-green-800 font-medium">
                            {uploadedFiles.newHandoverFiles_PDF.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Ảnh bàn giao / khách hàng ký nhận *</Label> {/* SỬA LABEL */}
                  <div
                    className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload("newHandoverFiles_Images", e.target.files) // SỬA KEY
                      }
                      className="hidden"
                      id="handover-images"
                    />
                    <label htmlFor="handover-images" className="cursor-pointer">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Tải lên ảnh bàn giao</p>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG tối đa 10MB mỗi ảnh
                      </p>
                    </label>

                    {uploadedFiles.newHandoverFiles_Images.length > 0 && ( // SỬA KEY
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {uploadedFiles.newHandoverFiles_Images.map((file, index) => ( // SỬA KEY
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Handover ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
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

                <div className="bg-yellow-50 p-4 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="document-complete"
                      checked={completionData.isDocumentComplete}
                      onCheckedChange={(checked) =>
                        setCompletionData((prev) => ({
                          ...prev,
                          isDocumentComplete: checked as boolean,
                        }))
                      }
                    />
                    <div>
                      <Label
                        htmlFor="document-complete"
                        className="font-medium text-yellow-800"
                      >
                        Xác nhận đủ chứng từ *
                      </Label>
                      <p className="text-sm text-yellow-700 mt-1">
                        Tôi xác nhận đã hoàn tất đầy đủ tất cả chứng từ và tài
                        liệu bàn giao cần thiết
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Lưu ý quan trọng:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • Sau khi xác nhận bàn giao, toàn bộ thao tác chỉnh sửa sẽ
                      bị khóa
                    </li>
                    <li>
                      • Thông báo sẽ được gửi tự động cho SC Staff và khách hàng
                    </li>
                    <li>• Tất cả thông tin sẽ được ghi log vào hệ thống</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              Lưu nháp
            </Button>

            <Button
              onClick={handleConfirmHandover}
              disabled={isSubmitting}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "Đang xử lý..." : "Xác nhận bàn giao"}
            </Button>
          </div>
        </CardContent>
      )}

      {/* Dialog Notification */}
      <Dialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ ...dialog, open })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle
              className={`flex items-center space-x-2 ${dialog.type === "error"
                ? "text-red-600"
                : dialog.type === "success"
                  ? "text-green-600"
                  : "text-blue-600"
                }`}
            >
              {dialog.type === "error" && <AlertCircle className="w-5 h-5" />}
              {dialog.type === "success" && <CheckCircle className="w-5 h-5" />}
              <span>{dialog.title}</span>
            </DialogTitle>
            <DialogDescription className="whitespace-pre-line text-base">
              {dialog.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setDialog({ ...dialog, open: false })}
              className={dialog.type === "success" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {dialog.type === "success" ? "✓ Đã hiểu" : "Đóng"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}