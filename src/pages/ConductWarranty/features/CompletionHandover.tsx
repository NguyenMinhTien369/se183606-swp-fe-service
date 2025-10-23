"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";

interface CompletionHandoverProps {
  selectedRequest?: {
    id: string;
    vin: string;
    parts: string;
  };
  onNextStep?: () => void;
}

export function CompletionHandover({
  selectedRequest,
  onNextStep,
}: CompletionHandoverProps) {
  const [completionData, setCompletionData] = useState({
    workDescription: "",
    completionTime: "",
    newPartSerial: "",
    completionImages: [],
    isDocumentComplete: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState({
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

  const mockRequest = selectedRequest || {
    id: "CLM-2025-031",
    vin: "XCF12345",
    parts: "Turbo Kit",
  };

  const handleFileUpload = (type: string, files: FileList | null) => {
    if (!files) return;
    setUploadedFiles((prev) => ({
      ...prev,
      [type]:
        type === "handoverDoc"
          ? files[0]
          : [...prev[type], ...Array.from(files)],
    }));

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

  const handleConfirmHandover = () => {
    if (!completionData.workDescription.trim()) {
      return showError("Vui lòng nhập mô tả công việc đã thực hiện");
    }
    if (!completionData.completionTime) {
      return showError("Vui lòng chọn thời gian hoàn tất");
    }
    if (!completionData.newPartSerial.trim()) {
      return showError("Vui lòng nhập số seri phụ tùng mới");
    }
    if (!uploadedFiles.handoverDoc) {
      return showError("Vui lòng tải lên biên bản bàn giao xe (PDF)");
    }
    if (!completionData.isDocumentComplete) {
      return showError("Vui lòng xác nhận đầy đủ chứng từ");
    }

    setDialog({
      open: true,
      title: "Xác nhận thành công",
      message:
        "Đã xác nhận bàn giao xe thành công! Thông báo đã được gửi cho SC Staff và khách hàng.",
      type: "success",
    });

    setTimeout(() => {
      onNextStep();
    }, 1500);
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
                    <p className="font-medium">{mockRequest.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">VIN:</p>
                    <p className="font-medium">{mockRequest.vin}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phụ tùng:</p>
                    <p className="font-medium">{mockRequest.parts}</p>
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
              </div>

              <div>
                <Label htmlFor="new-serial">Số seri phụ tùng mới *</Label>
                <Input
                  id="new-serial"
                  placeholder="Nhập số seri phụ tùng mới..."
                  value={completionData.newPartSerial}
                  onChange={(e) =>
                    setCompletionData((prev) => ({
                      ...prev,
                      newPartSerial: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Hình ảnh hoàn tất (ảnh “sau”)</Label>
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
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Xác nhận bàn giao
          </Button>
        </div>
      </CardContent>

      {/* Dialog Notification */}
      <Dialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ ...dialog, open })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle
              className={`flex items-center space-x-2 ${
                dialog.type === "error"
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
            <DialogDescription>{dialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDialog({ ...dialog, open: false })}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
