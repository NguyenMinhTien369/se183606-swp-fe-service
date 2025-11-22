import { useState, useEffect } from "react";
import type {
  InstalledPartInfo,
  ClaimPartRequest,
  WarrantyClaimResponse,
} from "../types/warranty";
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
import { Upload, FileText, X, Save, Send, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Đảm bảo import đúng đường dẫn component Alert của bạn
import SuccessCreated from "@/pages/SC_Staff/ManageWarranty/AlertComponents/SuccessCreated";
import SuccessDraft from "@/pages/SC_Staff/ManageWarranty/AlertComponents/SuccessDraft";
import type { ClaimPartResponse } from "../../ManageTechnicians/types";

interface CreateWarrantyFormProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (claimID: number, isDraft: boolean) => void;

  // Props cho trường hợp TẠO MỚI (Create Mode)
  vin?: string;
  installedParts?: InstalledPartInfo[];
  serviceCenterID?: number;

  // Props cho trường hợp CHỈNH SỬA (Edit Mode)
  editMode?: boolean;
  claimID?: number;
}

export default function CreateWarrantyForm({
  open,
  onCancel,
  onSuccess,
  vin = "",
  installedParts = [],
  serviceCenterID = 0,
  editMode = false,
  claimID,
}: CreateWarrantyFormProps) {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [currentStatus, setCurrentStatus] = useState<string>("");

  // Danh sách phụ tùng được chọn để gửi đi
  const [selectedParts, setSelectedParts] = useState<ClaimPartRequest[]>([]);

  // Danh sách phụ tùng hiển thị trên UI
  const [displayInstalledParts, setDisplayInstalledParts] =
    useState<InstalledPartInfo[]>(installedParts);

  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [currentAttachments, setCurrentAttachments] = useState<any[]>([]);

  const [successClaimId, setSuccessClaimId] = useState<number | undefined>(
    undefined
  );
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showDraftAlert, setShowDraftAlert] = useState(false);

  useEffect(() => {
    if (open && editMode && claimID) {
      const fetchClaimData = async () => {
        try {
          setLoading(true);
          const response = await warrantyClaimAPI.getClaimById(claimID);
          const data: any = response.data.result;

          setDescription(data.description || "");
          setCurrentStatus(data.status || "");

          // 2. Điền Parts đã chọn
          const listParts = data.affectedParts || [];
          const mappedParts: ClaimPartRequest[] = listParts.map(
            (p: ClaimPartResponse) => ({
              partSerialNumber: p.partSerialNumber,
              quantity: p.quantity || 1,
              description: p.description || "",
            })
          );
          setSelectedParts(mappedParts);

          // 3. Tạo danh sách hiển thị (Map từ affectedParts của chi tiết đơn)
          const partsForDisplay = listParts.map((p: any) => ({
            partSerialNumber: p.partSerialNumber,
            partName: p.partTypeName, // Fallback
            partTypeName: p.partTypeName,
            partTypeDescription: p.partTypeDescription,
            vehicleID: 0,
            installedDate: p.createdDate,
          })) as unknown as InstalledPartInfo[]; // Ép kiểu về InstalledPartInfo

          setDisplayInstalledParts(partsForDisplay);

          // 4. Điền File cũ
          setCurrentAttachments(data.attachments || []);
        } catch (error) {
          console.error("Lỗi tải dữ liệu edit:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchClaimData();
    } else {
      // Reset form khi mở Create Mode
      if (open) {
        setDescription("");
        setSelectedParts([]);
        setAttachmentFiles([]);
        setDisplayInstalledParts(installedParts);
        setSuccessClaimId(undefined);
      }
    }
  }, [open, editMode, claimID]);

  const handlePartToggle = (partSerialNumber: string) => {
    setSelectedParts((prev) => {
      const exists = prev.find((p) => p.partSerialNumber === partSerialNumber);
      if (exists)
        return prev.filter((p) => p.partSerialNumber !== partSerialNumber);
      return [...prev, { partSerialNumber, description: "", quantity: 1 }];
    });
  };

  const handlePartDetailChange = (
    sn: string,
    field: "quantity" | "description",
    value: any
  ) => {
    setSelectedParts((prev) =>
      prev.map((p) =>
        p.partSerialNumber === sn ? { ...p, [field]: value } : p
      )
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files)
      setAttachmentFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const buildFormData = (isDraft: boolean): FormData => {
    const formData = new FormData();
    if (!editMode) {
      formData.append("vin", vin);
      formData.append("serviceCenterID", String(serviceCenterID));
    }
    formData.append("description", description);

    // Nếu API Create cần isDraft
    if (!editMode) {
      formData.append("isDraft", String(isDraft));
    }

    selectedParts.forEach((part, index) => {
      formData.append(
        `claimParts[${index}].partSerialNumber`,
        part.partSerialNumber
      );
      formData.append(
        `claimParts[${index}].description`,
        part.description || ""
      );
      formData.append(`claimParts[${index}].quantity`, String(part.quantity));
    });

    attachmentFiles.forEach((file) => formData.append("attachmentFiles", file));
    return formData;
  };

  const validateForm = () => {
    if (!description.trim()) {
      alert("Vui lòng nhập mô tả");
      return false;
    }
    if (selectedParts.length === 0) {
      alert("Vui lòng chọn ít nhất 1 phụ tùng");
      return false;
    }
    return true;
  };

  // --- ACTION 1: LƯU NHÁP ---
  const handleSaveDraft = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);

      // Logic Lưu Nháp
      if (editMode && claimID) {
        const formData = buildFormData(true); // isDraft param có thể không cần thiết cho update, tùy API
        await warrantyClaimAPI.updateClaim(claimID, formData);

        setSuccessClaimId(claimID);
        setShowDraftAlert(true);
      } else {
        // Create: Gọi Create với isDraft = true
        const formData = buildFormData(true);
        const response = await warrantyClaimAPI.createClaim(formData);

        setSuccessClaimId(response.data.result.claimID);
        setShowDraftAlert(true);
      }
    } catch (error: any) {
      console.error("Lỗi lưu nháp:", error);
      alert(error.response?.data?.message || "Không thể lưu nháp");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION 2: GỬI YÊU CẦU (SUBMIT) ---
  const handleSubmitMain = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);

      if (editMode && claimID) {
        // --- LOGIC EDIT & SUBMIT ---
        // B1: Update dữ liệu mới nhất trước
        const formData = buildFormData(false);
        await warrantyClaimAPI.updateClaim(claimID, formData);

        // B2: Nếu đang là Nháp -> Gọi Submit để đổi trạng thái
        if (currentStatus === "Nháp") {
          await warrantyClaimAPI.submitClaim(claimID);
        }

        setSuccessClaimId(claimID);
        setShowSuccessAlert(true);
      } else {
        // --- LOGIC CREATE & SUBMIT ---
        const formData = buildFormData(false); // isDraft = false
        const response = await warrantyClaimAPI.createClaim(formData);

        setSuccessClaimId(response.data.result.claimID);
        setShowSuccessAlert(true);
      }
    } catch (error: any) {
      console.error("Lỗi gửi yêu cầu:", error);
      alert(error.response?.data?.message || "Không thể gửi yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  // Wrapper để chặn hành vi mặc định của button trong form
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
          className="max-w-5xl max-h-[95vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {editMode
                ? `Chỉnh sửa yêu cầu #${claimID}`
                : "Tạo yêu cầu bảo hành mới"}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? "Cập nhật thông tin sự cố và gửi lại."
                : "Nhập thông tin chi tiết về sự cố cần bảo hành."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(95vh-140px)] pr-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Cột trái: Thông tin chung */}
              <div className="space-y-4">
                <h3 className="font-medium">Thông tin chung</h3>
                <div className="space-y-2">
                  <Label>VIN</Label>
                  <Input
                    value={vin}
                    readOnly
                    disabled
                    className="font-mono bg-muted"
                  />
                </div>
                {!editMode && (
                  <div className="space-y-2">
                    <Label>Service Center ID</Label>
                    <Input value={serviceCenterID} readOnly disabled bg-muted />
                  </div>
                )}
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
                  {displayInstalledParts.map((part, index) => {
                    const selectedPart = selectedParts.find(
                      (p) => p.partSerialNumber === part.partSerialNumber
                    );
                    const isSelected = !!selectedPart;
                    return (
                      <div
                        key={`${part.partSerialNumber}-${index}`}
                        className="space-y-2 pb-2 border-b last:border-0"
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
                              <div className="text-xs text-muted-foreground font-mono">
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
                                className="w-16 h-7 text-xs"
                              />
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <Input
                            placeholder="Ghi chú lỗi..."
                            className="text-xs h-7 ml-6 w-[90%]"
                            value={selectedPart?.description || ""}
                            onChange={(e) =>
                              handlePartDetailChange(
                                part.partSerialNumber,
                                "description",
                                e.target.value
                              )
                            }
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

                  {/* File mới upload */}
                  {attachmentFiles.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {attachmentFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted rounded px-3 py-1"
                        >
                          <span className="text-xs truncate max-w-[200px]">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-destructive"
                            disabled={loading}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* File cũ từ server (Chỉ hiện thị) */}
                  {currentAttachments.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <Label className="text-xs text-muted-foreground">
                        File đã lưu:
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {currentAttachments.map((f) => (
                          <div
                            key={f.attachmentID}
                            className="text-xs flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded"
                          >
                            <FileText className="w-3 h-3" /> {f.fileName}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- FOOTER ACTIONS --- */}
            <div className="flex justify-between mt-6 pt-6 border-t bg-background sticky bottom-0">
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
                  onClick={handleAction(handleSubmitMain)}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {editMode ? "Cập nhật & Gửi" : "Gửi yêu cầu"}
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
