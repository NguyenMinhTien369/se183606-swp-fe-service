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

import SuccessCreated from "../AlertComponents/SuccessCreated";
import SuccessDraft from "../AlertComponents/SuccessDraft";

interface CreateWarrantyFormProps {
  open: boolean;
  vin: string;
  installedParts: InstalledPartInfo[];
  serviceCenterID: number;
  onSuccess: (claimID: number, isDraft: boolean) => void;
  onCancel: () => void;
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
  // --- STATE ---
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
    const descriptions: Record<string, string> = {};
    initialSelectedParts.forEach((part) => {
      descriptions[part.partSerialNumber] = part.description || "";
    });
    return descriptions;
  });

  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // State cho Alert thông báo
  const [successClaimId, setSuccessClaimId] = useState<number | undefined>(
    undefined
  );
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showDraftAlert, setShowDraftAlert] = useState(false);

  // --- LOGIC XỬ LÝ PART & FILE ---
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
            quantity: 1,
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

  // --- VALIDATION & BUILD DATA ---
  const validateForm = (): boolean => {
    if (!description.trim()) {
      console.log("Vui lòng nhập mô tả sự cố.");
      return false;
    }
    if (selectedParts.length === 0) {
      console.log("Vui lòng chọn ít nhất một phụ tùng cần bảo hành.");
      return false;
    }
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

  // Middleware xử lý thành công để hiện Alert trước khi đóng form
  const handleSuccess = (id: number, isDraft: boolean) => {
    setSuccessClaimId(id);
    if (isDraft) {
      setShowDraftAlert(true);
    } else {
      setShowSuccessAlert(true);
    }
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      if (editMode && claimID) {
        const formData = buildFormData(true);
        const response = await warrantyClaimAPI.updateClaim(claimID, formData);
        handleSuccess(response.data.result.claimID, true);
      } else {
        const formData = buildFormData(true);
        const response = await warrantyClaimAPI.createClaim(formData);
        handleSuccess(response.data.result.claimID, true);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        `Không thể ${editMode ? "cập nhật" : "lưu"} bản nháp.`;
      console.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDraft = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      if (editMode && claimID) {
        const response = await warrantyClaimAPI.submitClaim(claimID);
        handleSuccess(response.data.result.claimID, false); // Dùng handleSuccess
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Không thể gửi yêu cầu.";
      console.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitToClaim = async () => {
    if (!validateForm()) return;
    if (!editMode && attachmentFiles.length === 0) {
      console.log("Vui lòng đính kèm tài liệu.");
      return;
    }

    try {
      setLoading(true);
      const formData = buildFormData(false);
      if (editMode && claimID) {
        const response = await warrantyClaimAPI.updateClaim(claimID, formData);
        handleSuccess(response.data.result.claimID, false);
      } else {
        const response = await warrantyClaimAPI.createClaim(formData);
        handleSuccess(response.data.result.claimID, false);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        `Không thể ${editMode ? "cập nhật" : "gửi"} yêu cầu.`;
      console.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const submitAction = editMode ? handleSubmitDraft : handleSubmitToClaim;

  const handleAction = (action: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const saveDraftLabel = editMode ? "Cập nhật bản nháp" : "Lưu bản nháp";
  const saveDraftLoadingLabel = editMode ? "Đang cập nhật..." : "Đang lưu...";

  return (
    <>
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
                  <Label>VIN</Label>
                  <Input value={vin} readOnly disabled className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Service Center ID</Label>
                  <Input value={serviceCenterID} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Mô tả sự cố <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả chi tiết về sự cố..."
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Cột phải: Phụ tùng & Tài liệu */}
              <div className="space-y-4">
                <h3 className="font-medium">Phụ tùng cần bảo hành</h3>

                {/* Danh sách phụ tùng */}
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
                              checked={isSelected}
                              onCheckedChange={() =>
                                handlePartToggle(part.partSerialNumber)
                              }
                              disabled={loading}
                            />
                            <Label className="flex-1 cursor-pointer">
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
                              <Label className="text-xs text-muted-foreground">
                                SL
                              </Label>
                              <Input
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
                            placeholder="Mô tả lỗi phụ tùng (tùy chọn)"
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

                {/* Upload Tài liệu */}
                <div className="space-y-2">
                  <Label>Tài liệu đính kèm</Label>
                  <div className="flex gap-2">
                    <Input
                      id="attachments"
                      type="file"
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
                          <span className="text-sm truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-destructive"
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

            {/* --- FOOTER TỐI ƯU --- */}
            <div className="flex justify-between mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleAction(onCancel)}
                disabled={loading}
              >
                Hủy
              </Button>

              <div className="flex gap-2">
                {/* Nút Lưu Nháp */}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAction(handleSaveDraft)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {saveDraftLoadingLabel}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {saveDraftLabel}
                    </>
                  )}
                </Button>

                {/* Nút Gửi Yêu Cầu */}
                <Button
                  type="button"
                  onClick={handleAction(submitAction)}
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
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <SuccessCreated
        open={showSuccessAlert}
        onOpenChange={(open) => {
          setShowSuccessAlert(open);
          // Nếu người dùng đóng alert (open = false), có thể gọi onSuccess để đóng form chính luôn
          if (!open) onSuccess(successClaimId!, false);
        }}
        claimID={successClaimId}
      />

      <SuccessDraft
        open={showDraftAlert}
        onOpenChange={setShowDraftAlert}
        claimID={successClaimId}
      />
    </>
  );
}
