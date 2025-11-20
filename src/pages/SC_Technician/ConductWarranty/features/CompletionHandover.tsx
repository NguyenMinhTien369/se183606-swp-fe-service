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
import {
  Upload,
  FileText,
  Camera,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
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
  selectedRequest?: any;
  onNextStep?: () => void;
  onComplete?: () => void;
}

export function CompletionHandover({
  selectedRequest,
  onNextStep,
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
    handoverDoc: File | null;
    handoverImages: File[];
    completionImages: File[];
  }>({
    handoverDoc: null,
    handoverImages: [],
    completionImages: [],
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

      console.log("Assignments ready for handover:", readyForHandover);

      // Update current assignment if it still exists in the list
      if (currentAssignment) {
        const updatedCurrent = readyForHandover.find(
          (a: AssignmentProgressResponse) => a.assignmentID === currentAssignment.assignmentID
        );
        if (updatedCurrent) {
          setCurrentAssignment(updatedCurrent);
          console.log("Updated current assignment:", updatedCurrent);
        } else {
          // Current assignment completed, select first available or clear
          if (readyForHandover.length > 0) {
            setCurrentAssignment(readyForHandover[0]);
            console.log("Current assignment completed, selected next:", readyForHandover[0]);
          } else {
            setCurrentAssignment(null);
            console.log("No more assignments ready for handover");
          }
        }
      } else if (readyForHandover.length > 0) {
        // Auto-select first assignment if no current selection
        setCurrentAssignment(readyForHandover[0]);
        console.log("Auto-selected assignment:", readyForHandover[0]);
      }
    } catch (error) {
      console.error("Error loading completed assignments:", error);
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

    if (type === "handoverDoc") {
      setUploadedFiles((prev) => ({
        ...prev,
        handoverDoc: files[0],
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

  const extractClaimID = (assignment: any): number | null => {
    console.log("Extracting claimID from:", assignment);

    // Try from selectedRequest first
    if (selectedRequest?.claimDetails?.claimID) {
      console.log("Found claimID in selectedRequest:", selectedRequest.claimDetails.claimID);
      return selectedRequest.claimDetails.claimID;
    }

    // Try from assignment.claimID
    if (assignment.claimID) {
      console.log("Found claimID in assignment.claimID:", assignment.claimID);
      return assignment.claimID;
    }

    // Try from assignment.warrantyClaim?.claimID
    if (assignment.warrantyClaim?.claimID) {
      console.log("Found claimID in assignment.warrantyClaim:", assignment.warrantyClaim.claimID);
      return assignment.warrantyClaim.claimID;
    }

    // Extract from claimCode (format: "CLM-123" or just "123")
    if (assignment.claimCode) {
      const codeStr = String(assignment.claimCode);
      console.log("Attempting to extract from claimCode:", codeStr);

      // Try multiple patterns
      const match = codeStr.match(/CLM-?(\d+)/i) || codeStr.match(/(\d+)/);
      if (match && match[1]) {
        const extractedID = parseInt(match[1]);
        console.log("Extracted claimID from claimCode:", extractedID);
        return extractedID;
      }
    }

    console.warn("Could not extract claimID from assignment");
    return null;
  };

  const handleConfirmHandover = async () => {
    if (isSubmitting) return;

    if (!completionData.workDescription.trim()) {
      return showError("Vui lòng nhập mô tả công việc đã thực hiện");
    }
    if (!completionData.completionTime) {
      return showError("Vui lòng chọn thời gian hoàn tất");
    }
    if (uploadedFiles.completionImages.length === 0) {
      return showError("Vui lòng tải lên ít nhất 1 ảnh sau khi hoàn tất");
    }
    if (!uploadedFiles.handoverDoc) {
      return showError("Vui lòng tải lên biên bản bàn giao xe (PDF)");
    }
    if (uploadedFiles.handoverImages.length === 0) {
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
      console.log("Starting handover process...");
      console.log("Assignment ID:", currentAssignment.assignmentID);
      console.log("Current assignment:", currentAssignment);

      // Step 1: Extract claimID BEFORE making any updates
      const claimID = extractClaimID(currentAssignment);
      console.log("ClaimID for sync:", claimID);

      // Step 2: Update assignment to "Hoàn thành" - COMBINE EVERYTHING IN ONE REQUEST
      const formData = new FormData();
      formData.append("status", "Hoàn thành");
      formData.append("completionPercentage", "100");

      // Internal notes with completion details AND sync request
      const completionNotes =
        `HOÀN THÀNH BẢO HÀNH\n` +
        `Thời gian hoàn tất: ${new Date(completionData.completionTime).toLocaleString("vi-VN")}\n` +
        `Mô tả công việc: ${completionData.workDescription}\n` +
        `Biên bản bàn giao: ${uploadedFiles.handoverDoc?.name || "N/A"}\n` +
        `Số ảnh hoàn tất: ${uploadedFiles.completionImages.length}\n` +
        `Số ảnh bàn giao: ${uploadedFiles.handoverImages.length}\n\n` +
        `AUTOMATIC STATUS SYNC REQUEST\n` +
        `Assignment completed, please update warranty claim ${claimID || 'N/A'} to "Hoàn thành"\n` +
        `Technician: ${user?.username || 'Unknown'}`;

      formData.append("internalNotes", completionNotes);

      // Append files
      uploadedFiles.completionImages.forEach((file) => {
        formData.append("newProgressFiles", file);
      });

      if (uploadedFiles.handoverDoc) {
        formData.append("newHandoverFiles", uploadedFiles.handoverDoc);
      }

      uploadedFiles.handoverImages.forEach((file) => {
        formData.append("newHandoverFiles", file);
      });

      console.log("📤 Sending assignment update...");
      const response = await claimAssignmentAPI.updateAssignmentProgress(
        currentAssignment.assignmentID,
        formData
      );

      console.log("Assignment update successful:", response.data);

      // Step 3: Log sync status (no additional API calls needed)
      if (claimID) {
        console.log(`Assignment ${currentAssignment.assignmentID} completed. ` +
          `Warranty claim ${claimID} sync requested in internal notes.`);
      } else {
        console.warn("No claimID found - SC Staff will need to manually update warranty claim");
      }

      // Success message
      setDialog({
        open: true,
        title: "Hoàn tất bàn giao thành công",
        message:
          "Đã hoàn tất bảo hành và bàn giao xe thành công!\n\n" +
          "Assignment đã được cập nhật trạng thái Hoàn thành\n" +
          "Đã gửi yêu cầu sync trạng thái warranty claim\n" +
          "Thông báo đã được gửi cho SC Staff\n" +
          "Có thể chuyển sang yêu cầu tiếp theo",
        type: "success",
      });

      // Reset form data
      setCompletionData({
        workDescription: "",
        completionTime: new Date().toISOString().slice(0, 16),
        isDocumentComplete: false,
      });
      setUploadedFiles({
        handoverDoc: null,
        handoverImages: [],
        completionImages: [],
      });

      // Reload the assignments list to remove completed one
      await loadCompletedAssignments();

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }

    } catch (error: any) {
      console.error("Error confirming handover:", error);

      // Extract detailed error message
      let errorMessage = "Không thể hoàn thành bàn giao. ";
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Vui lòng thử lại.";
      }

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
                  <Label>Hình ảnh hoàn tất (ảnh "sau")</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload("completionImages", e.target.files)
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

                    {uploadedFiles.completionImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {uploadedFiles.completionImages.map((file, index) => (
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
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) =>
                        handleFileUpload("handoverDoc", e.target.files)
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

                    {uploadedFiles.handoverDoc && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-green-600" />
                          <span className="text-green-800 font-medium">
                            {uploadedFiles.handoverDoc.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Ảnh bàn giao / khách hàng ký nhận</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload("handoverImages", e.target.files)
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

                    {uploadedFiles.handoverImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {uploadedFiles.handoverImages.map((file, index) => (
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
            <Button variant="outline" onClick={handleSaveDraft}>
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
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Xác nhận bàn giao
                </>
              )}
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