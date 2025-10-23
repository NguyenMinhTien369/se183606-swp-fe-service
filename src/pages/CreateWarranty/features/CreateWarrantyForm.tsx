"use client";

import { useState } from "react";
import type { Part, WarrantyClaim } from "../types/warranty";
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
import { Upload, X, Save, Send } from "lucide-react";

interface CreateWarrantyFormProps {
  vin: string;
  parts: Part[];
  onSave: (claim: Partial<WarrantyClaim>) => void;
  onSubmit: (claim: Partial<WarrantyClaim>) => void;
  onCancel: () => void;
}

export function CreateWarrantyForm({
  vin,
  parts,
  onSave,
  onSubmit,
  onCancel,
}: CreateWarrantyFormProps) {
  const [requestCode] = useState(
    `CLM-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`
  );
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [diagnosticInfo, setDiagnosticInfo] = useState("");
  const [technicalReport, setTechnicalReport] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);

  const handlePartToggle = (partCode: string) => {
    setSelectedParts((prev) =>
      prev.includes(partCode)
        ? prev.filter((p) => p !== partCode)
        : [...prev, partCode]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTechnicalReport(e.target.files[0]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!issueDate) {
      alert("Vui lòng chọn ngày phát hiện lỗi.");
      return false;
    }
    if (!description.trim()) {
      alert("Vui lòng nhập mô tả sự cố.");
      return false;
    }
    if (selectedParts.length === 0) {
      alert("Vui lòng chọn ít nhất một phụ tùng cần bảo hành.");
      return false;
    }
    return true;
  };

  const buildClaim = (): Partial<WarrantyClaim> => {
    return {
      requestCode,
      vin,
      issueDate,
      description,
      parts: selectedParts,
      diagnosticInfo,
      images: images.map((f) => f.name),
      technicalReport: technicalReport?.name,
      status: "pending",
      handler: "Ford Technical",
      createdDate: new Date().toISOString(),
    };
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(buildClaim());
      // Nếu không muốn alert, có thể xóa dòng này
      alert("Yêu cầu bảo hành đã được lưu tạm.");
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (!technicalReport) {
      alert("Vui lòng đính kèm báo cáo kỹ thuật (.pdf/.doc).");
      return;
    }

    if (images.length === 0) {
      alert("Vui lòng đính kèm ít nhất một hình ảnh.");
      return;
    }

    onSubmit(buildClaim());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo yêu cầu bảo hành mới</CardTitle>
        <CardDescription>
          Điền thông tin chi tiết về sự cố cần bảo hành
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Cột trái: Thông tin chung */}
          <div className="space-y-4">
            <h3 className="font-medium">Thông tin chung</h3>

            <div className="space-y-2">
              <Label htmlFor="requestCode">Mã yêu cầu</Label>
              <Input id="requestCode" value={requestCode} readOnly disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input id="vin" value={vin} readOnly disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate">Ngày phát hiện lỗi</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả sự cố</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về sự cố..."
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Cột phải: Thông tin kỹ thuật */}
          <div className="space-y-4">
            <h3 className="font-medium">Thông tin kỹ thuật</h3>

            <div className="space-y-2">
              <Label>Phụ tùng cần bảo hành</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                {parts.map((part) => (
                  <div key={part.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={part.id}
                      checked={selectedParts.includes(part.partCode)}
                      onCheckedChange={() => handlePartToggle(part.partCode)}
                    />
                    <Label htmlFor={part.id} className="flex-1 cursor-pointer">
                      {part.partCode} - {part.partName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicalReport">Báo cáo kỹ thuật</Label>
              <div className="flex gap-2">
                <Input
                  id="technicalReport"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleReportUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    document.getElementById("technicalReport")?.click()
                  }
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {technicalReport ? technicalReport.name : "Tải lên PDF/Text"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Hình ảnh hư hỏng</Label>
              <div className="flex gap-2">
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("images")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Tải lên hình ảnh
                </Button>
              </div>

              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="relative bg-muted rounded px-3 py-1 flex items-center gap-2"
                    >
                      <span className="text-sm">{img.name}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosticInfo">Thông tin chẩn đoán</Label>
              <Textarea
                id="diagnosticInfo"
                placeholder="Mã lỗi, kết quả đo..."
                rows={4}
                value={diagnosticInfo}
                onChange={(e) => setDiagnosticInfo(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Lưu tạm
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              Gửi lên hãng
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
