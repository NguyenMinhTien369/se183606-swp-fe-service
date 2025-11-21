import { useState } from "react";
import type { InstalledPartInfo, ClaimPartRequest } from "../types/warranty";
import { warrantyClaimAPI } from "@/utility/index";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Save, Send, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreateWarrantyFormProps {
  open: boolean;
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

export default function CreateWarrantyForm({
  open,
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
  const [selectedParts, setSelectedParts] = useState<ClaimPartRequest[]>(
    initialSelectedParts.map((p) => ({
      ...p,
      quantity:
        typeof p.quantity === "number" && p.quantity > 0 ? p.quantity : 1,
    }))
  );
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
            quantity: 1, // default quantity
          },
        ];
      }
    });
  };

  const handlePartDetailChange = (
    partSerialNumber: string,
    field: "description" | "quantity",
    value: string | number
  ) => {
    setSelectedParts((prev) =>
      prev.map((p) =>
        p.partSerialNumber === partSerialNumber
          ? {
              ...p,
              [field]:
                field === "quantity" ? Math.max(1, Number(value) || 1) : value,
            }
          : p
      )
    );
    if (field === "description") {
      setPartDescriptions((prev) => ({
        ...prev,
        [partSerialNumber]: String(value),
      }));
    }
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
      console.log("Vui lòng nhập mô tả sự cố.");
      return false;
    }
    if (selectedParts.length === 0) {
      console.log("Vui lòng chọn ít nhất một phụ tùng cần bảo hành.");
      return false;
    }
    // Validate quantities
    for (const part of selectedParts) {
      if (!part.quantity || part.quantity <= 0) {
        console.log("Số lượng phải lớn hơn 0");
        return false;
      }
    }
    return true;
  };

  const buildFormData = (isDraft: boolean): FormData => {
    const formData = new FormData();
    formData.append("vin", vin);
    formData.append("serviceCenterID", serviceCenterID.toString());
    formData.append("description", description);

    // ✅ Gửi từng claimPart như array elements cho Spring Boot + quantity
    selectedParts.forEach((part, index) => {
      formData.append(
        `claimParts[${index}].partSerialNumber`,
        part.partSerialNumber
      );
      formData.append(
        `claimParts[${index}].description`,
        part.description || ""
      );
      formData.append(
        `claimParts[${index}].quantity`,
        String(part.quantity ?? 1)
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

      // ✅ Edit Mode: Update draft (giữ status = "Nháp", chỉ cập nhật thông tin)
      if (editMode && claimID) {
        const formData = buildFormData(true); // isDraft = true
        const response = await warrantyClaimAPI.updateClaim(claimID, formData);
        const updatedClaimID = response.data.result;
        onSuccess(updatedClaimID, true); // isDraft = true (vẫn là nháp)
      } else {
        // Create Mode: Create new draft claim (status = "Nháp")
        const formData = buildFormData(true);
        const response = await warrantyClaimAPI.createClaim(formData);
        const newClaimID = response.data.result;
        onSuccess(newClaimID, true);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        `Không thể ${
          editMode ? "cập nhật" : "lưu"
        } bản nháp. Vui lòng thử lại.`;
      console.log(errorMsg);
      console.error("Error saving draft:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Hàm mới: Submit claim từ Nháp sang Chờ duyệt (chỉ dùng trong EDIT MODE)
  const handleSubmitDraft = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (editMode && claimID) {
        // Gọi submitClaim để chuyển từ "Nháp" sang "Chờ duyệt"
        const response = await warrantyClaimAPI.submitClaim(claimID);
        const updatedClaimID = response.data.result;
        onSuccess(updatedClaimID, false); // isDraft = false (đã submit)
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Không thể gửi yêu cầu. Vui lòng thử lại.";
      console.log(errorMsg);
      console.error("Error submitting claim:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitToClaim = async () => {
    if (!validateForm()) return;

    // Only require attachments for new claims, not for edits
    if (!editMode && attachmentFiles.length === 0) {
      console.log("Vui lòng đính kèm ít nhất một tài liệu/hình ảnh.");
      return;
    }

    try {
      setLoading(true);
      const formData = buildFormData(false);

      // ✅ Edit Mode: Update existing claim
      if (editMode && claimID) {
        const response = await warrantyClaimAPI.updateClaim(claimID, formData);
        const updatedClaimID = response.data.result;
        onSuccess(updatedClaimID, false);
      } else {
        // Create Mode: Create new claim
        const response = await warrantyClaimAPI.createClaim(formData);
        const newClaimID = response.data.result;
        onSuccess(newClaimID, false);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        `Không thể ${editMode ? "cập nhật" : "gửi"} yêu cầu. Vui lòng thử lại.`;
      console.log(errorMsg);
      console.error("Error submitting claim:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent
        className="max-w-6xl max-h-[95vh] sm:max-w-6xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {editMode
              ? `Chỉnh sửa yêu cầu bảo hành #${claimID}`
              : "Tạo yêu cầu bảo hành mới"}
          </DialogTitle>
          <DialogDescription>
            {editMode
              ? "Cập nhật thông tin chi tiết về sự cố cần bảo hành"
              : "Điền thông tin chi tiết về sự cố cần bảo hành"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-140px)] pr-4">
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
                    const selectedPart = selectedParts.find(
                      (p) => p.partSerialNumber === part.partSerialNumber
                    );
                    const isSelected = !!selectedPart;
                    return (
                      <div
                        key={`${part.partSerialNumber}-${index}`}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
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
                              <div className="font-medium">
                                {part.partTypeName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                SN: {part.partSerialNumber}
                              </div>
                            </Label>
                          </div>

                          {isSelected && (
                            <div className="flex items-center gap-2">
                              <Label
                                htmlFor={`qty-${part.partSerialNumber}`}
                                className="text-xs text-muted-foreground"
                              >
                                SL
                              </Label>
                              <Input
                                id={`qty-${part.partSerialNumber}`}
                                type="number"
                                min="1"
                                value={selectedPart?.quantity ?? 1}
                                onChange={(e) =>
                                  handlePartDetailChange(
                                    part.partSerialNumber,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                disabled={loading}
                                className="w-20 h-8 text-sm"
                              />
                            </div>
                          )}
                        </div>

                        {isSelected && (
                          <Input
                            placeholder="Mô tả chi tiết lỗi của phụ tùng này (tùy chọn)"
                            value={selectedPart?.description || ""}
                            onChange={(e) =>
                              handlePartDetailChange(
                                part.partSerialNumber,
                                "description",
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
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCancel();
              }}
              disabled={loading}
            >
              Hủy
            </Button>
            <div className="flex gap-2">
              {/* Nút "Lưu/Cập nhật bản nháp" - Luôn hiển thị */}
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSaveDraft();
                }}
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

              {/* Nút "Gửi yêu cầu" */}
              {editMode ? (
                // EDIT MODE: Nút "Gửi yêu cầu" để submit từ Nháp sang Chờ duyệt
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmitDraft();
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Gửi yêu cầu
                    </>
                  )}
                </Button>
              ) : (
                // CREATE MODE: Nút "Gửi yêu cầu" để tạo đơn với status Chờ duyệt
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmitToClaim();
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Gửi yêu cầu
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
