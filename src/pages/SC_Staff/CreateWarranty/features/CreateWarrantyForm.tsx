"use client";

import { useState } from "react";
import type { InstalledPartInfo, ClaimPartRequest } from "../types/warranty";
import { warrantyClaimAPI } from "@/utility/index";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  X,
  Save,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface CreateWarrantyFormProps {
  vin: string;
  installedParts: InstalledPartInfo[];
  serviceCenterID: number;
  onSuccess: (claimID: number, isDraft: boolean) => void;
  onCancel: () => void;
  // ✅ Props cho Edit Mode
  editMode?: boolean;
  claimID?: number;
  initialDescription?: string;
  initialSelectedParts?: ClaimPartRequest[];
}

export function CreateWarrantyForm({
  vin,
  installedParts,
  serviceCenterID,
  onSuccess,
  onCancel,
  editMode = false,
  claimID,
  initialDescription = "",
  initialSelectedParts = [],
}: CreateWarrantyFormProps) {
  const [description, setDescription] = useState(initialDescription);
  const [selectedParts, setSelectedParts] =
    useState<ClaimPartRequest[]>(initialSelectedParts);
  const [partDescriptions, setPartDescriptions] = useState<
    Record<string, string>
  >(() => {
    // Pre-fill part descriptions for edit mode
    const descriptions: Record<string, string> = {};
    initialSelectedParts.forEach((part) => {
      descriptions[part.partSerialNumber] = part.description || "";
    });
    return descriptions;
  });
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // Alert state management
  const [alertState, setAlertState] = useState<{
    show: boolean;
    type: "error" | "success";
    title: string;
    description: string;
    details?: string[];
  }>({
    show: false,
    type: "error",
    title: "",
    description: "",
    details: [],
  });

  const showAlert = (
    type: "error" | "success",
    title: string,
    description: string,
    details?: string[]
  ) => {
    setAlertState({ show: true, type, title, description, details });
    // Auto hide after 5 seconds
    setTimeout(() => {
      setAlertState((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const handlePartToggle = (partSerialNumber: string) => {
    setSelectedParts((prev) => {
      const exists = prev.find((p) => p.partSerialNumber === partSerialNumber);
      if (exists) {
        return prev.filter((p) => p.partSerialNumber !== partSerialNumber);
      } else {
        return [
          ...prev,
          {
            partSerialNumber,
            description: partDescriptions[partSerialNumber] || "",
          },
        ];
      }
    });
  };

  const handlePartDescriptionChange = (
    partSerialNumber: string,
    desc: string
  ) => {
    setPartDescriptions((prev) => ({ ...prev, [partSerialNumber]: desc }));
    setSelectedParts((prev) =>
      prev.map((p) =>
        p.partSerialNumber === partSerialNumber
          ? { ...p, description: desc }
          : p
      )
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachmentFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!description.trim()) {
      showAlert(
        "error",
        "Thiếu thông tin bắt buộc",
        "Vui lòng nhập mô tả sự cố.",
        ["Mô tả sự cố là trường bắt buộc", "Vui lòng điền thông tin chi tiết"]
      );
      return false;
    }
    if (selectedParts.length === 0) {
      showAlert(
        "error",
        "Thiếu thông tin bắt buộc",
        "Vui lòng chọn ít nhất một phụ tùng cần bảo hành.",
        ["Chọn phụ tùng cần bảo hành từ danh sách bên phải"]
      );
      return false;
    }
    return true;
  };

  const buildFormData = (isDraft: boolean): FormData => {
    const formData = new FormData();
    formData.append("vin", vin);
    formData.append("serviceCenterID", serviceCenterID.toString());
    formData.append("description", description);

    // ✅ FIX: Gửi từng claimPart như array elements cho Spring Boot
    selectedParts.forEach((part, index) => {
      formData.append(
        `claimParts[${index}].partSerialNumber`,
        part.partSerialNumber
      );
      formData.append(
        `claimParts[${index}].description`,
        part.description || ""
      );
    });

    formData.append("isDraft", isDraft.toString());

    attachmentFiles.forEach((file) => {
      formData.append("attachmentFiles", file);
    });

    return formData;
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const formData = buildFormData(true);

      // ✅ Edit Mode: Update existing claim
      if (editMode && claimID) {
        const response = await warrantyClaimAPI.updateClaim(claimID, formData);
        const updatedClaimID = response.data.result;

        showAlert(
          "success",
          "Thành công! Đã cập nhật bản nháp",
          `Bản nháp yêu cầu bảo hành đã được cập nhật với Claim ID: ${updatedClaimID}`
        );

        setTimeout(() => {
          onSuccess(updatedClaimID, true);
        }, 1500);
      } else {
        // Create Mode: Create new claim
        const response = await warrantyClaimAPI.createClaim(formData);
        const newClaimID = response.data.result;

        showAlert(
          "success",
          "Thành công! Đã lưu bản nháp",
          `Bản nháp yêu cầu bảo hành đã được lưu với Claim ID: ${newClaimID}`
        );

        setTimeout(() => {
          onSuccess(newClaimID, true);
        }, 1500);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        `Không thể ${
          editMode ? "cập nhật" : "lưu"
        } bản nháp. Vui lòng thử lại.`;
      showAlert(
        "error",
        `Không thể ${editMode ? "cập nhật" : "lưu"} bản nháp`,
        errorMsg,
        ["Kiểm tra kết nối mạng", "Đảm bảo thông tin hợp lệ", "Thử lại sau"]
      );
      console.error("Error saving draft:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitToClaim = async () => {
    if (!validateForm()) return;

    // Only require attachments for new claims, not for edits
    if (!editMode && attachmentFiles.length === 0) {
      showAlert(
        "error",
        "Thiếu tài liệu đính kèm",
        "Vui lòng đính kèm ít nhất một tài liệu/hình ảnh.",
        ["Tải lên ảnh hoặc PDF minh chứng", "Tài liệu giúp xử lý nhanh hơn"]
      );
      return;
    }

    try {
      setLoading(true);
      const formData = buildFormData(false);

      // ✅ Edit Mode: Update existing claim
      if (editMode && claimID) {
        const response = await warrantyClaimAPI.updateClaim(claimID, formData);
        const updatedClaimID = response.data.result;

        showAlert(
          "success",
          "Thành công! Yêu cầu đã được cập nhật",
          `Yêu cầu bảo hành đã được cập nhật thành công với Claim ID: ${updatedClaimID}`
        );

        setTimeout(() => {
          onSuccess(updatedClaimID, false);
        }, 1500);
      } else {
        // Create Mode: Create new claim
        const response = await warrantyClaimAPI.createClaim(formData);
        const newClaimID = response.data.result;

        showAlert(
          "success",
          "Thành công! Yêu cầu đã được gửi",
          `Yêu cầu bảo hành đã được gửi thành công với Claim ID: ${newClaimID}`
        );

        setTimeout(() => {
          onSuccess(newClaimID, false);
        }, 1500);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        `Không thể ${editMode ? "cập nhật" : "gửi"} yêu cầu. Vui lòng thử lại.`;
      showAlert(
        "error",
        `Không thể ${editMode ? "cập nhật" : "gửi"} yêu cầu`,
        errorMsg,
        [
          "Kiểm tra kết nối mạng",
          "Đảm bảo thông tin hợp lệ",
          "Liên hệ hỗ trợ nếu lỗi tiếp diễn",
        ]
      );
      console.error("Error submitting claim:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editMode
            ? `Chỉnh sửa yêu cầu bảo hành #${claimID}`
            : "Tạo yêu cầu bảo hành mới"}
        </CardTitle>
        <CardDescription>
          {editMode
            ? "Cập nhật thông tin chi tiết về sự cố cần bảo hành"
            : "Điền thông tin chi tiết về sự cố cần bảo hành"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Alert notification */}
        {alertState.show && (
          <div className="mb-6">
            <Alert
              variant={alertState.type === "error" ? "destructive" : "default"}
            >
              {alertState.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertTitle>{alertState.title}</AlertTitle>
              <AlertDescription>
                <p>{alertState.description}</p>
                {alertState.details && alertState.details.length > 0 && (
                  <ul className="list-inside list-disc text-sm mt-2">
                    {alertState.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cột trái: Thông tin chung */}
          <div className="space-y-4">
            <h3 className="font-medium">Thông tin chung</h3>

            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                value={vin}
                readOnly
                disabled
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceCenterID">Service Center ID</Label>
              <Input
                id="serviceCenterID"
                value={serviceCenterID}
                readOnly
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Mô tả sự cố <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về sự cố cần bảo hành..."
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Cột phải: Phụ tùng và tài liệu */}
          <div className="space-y-4">
            <h3 className="font-medium">Phụ tùng cần bảo hành</h3>

            <div className="space-y-2">
              <Label>
                Chọn phụ tùng <span className="text-destructive">*</span>
              </Label>
              <div className="border rounded-md p-3 space-y-3 max-h-64 overflow-y-auto">
                {installedParts.map((part, index) => {
                  const isSelected = selectedParts.some(
                    (p) => p.partSerialNumber === part.partSerialNumber
                  );
                  return (
                    <div
                      key={`${part.partSerialNumber}-${index}`}
                      className="space-y-2"
                    >
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id={part.partSerialNumber}
                          checked={isSelected}
                          onCheckedChange={() =>
                            handlePartToggle(part.partSerialNumber)
                          }
                          disabled={loading}
                        />
                        <Label
                          htmlFor={part.partSerialNumber}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{part.partTypeName}</div>
                          <div className="text-sm text-muted-foreground">
                            SN: {part.partSerialNumber}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {part.partTypeDescription}
                          </div>
                        </Label>
                      </div>
                      {isSelected && (
                        <Input
                          placeholder="Mô tả chi tiết lỗi của phụ tùng này (tùy chọn)"
                          value={partDescriptions[part.partSerialNumber] || ""}
                          onChange={(e) =>
                            handlePartDescriptionChange(
                              part.partSerialNumber,
                              e.target.value
                            )
                          }
                          disabled={loading}
                          className="ml-6 text-sm"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">
                Tài liệu đính kèm (ảnh, PDF, tài liệu)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="attachments"
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    document.getElementById("attachments")?.click()
                  }
                  disabled={loading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Tải lên tài liệu ({attachmentFiles.length})
                </Button>
              </div>

              {attachmentFiles.length > 0 && (
                <div className="space-y-2 mt-2">
                  {attachmentFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted rounded px-3 py-2"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-destructive hover:text-destructive/80 ml-2"
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editMode ? "Đang cập nhật..." : "Đang lưu..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editMode ? "Cập nhật bản nháp" : "Lưu bản nháp"}
                </>
              )}
            </Button>
            <Button onClick={handleSubmitToClaim} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editMode ? "Đang cập nhật..." : "Đang gửi..."}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {editMode ? "Cập nhật yêu cầu" : "Gửi yêu cầu"}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
