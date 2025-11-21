"use client";

import { useState, useEffect, useCallback } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { claimAssignmentAPI, warrantyClaimAPI } from "@/utility";
import { useAuth } from "@/pages/Login/feature/AuthContext";

import type {
  AssignmentProgressResponse,
  WarrantyClaimResponse,
  ConfirmPartsRequestDTO,
  ReportMissingPartsRequestDTO,
  ClaimPartResponse,
} from "../types/warranty";

interface ApprovedRequestsListProps {
  selectedRequest?: any;
  onSelectRequest?: (request: ClaimDetailsWithAssignment) => void;
  onNextStep?: () => void;
  onComplete?: () => void;
}

// State nội bộ để quản lý chi tiết
interface ClaimDetailsWithAssignment extends AssignmentProgressResponse {
  claimDetails?: WarrantyClaimResponse;
}

// State để KTV nhập serial mới
interface PartConfirmation {
  claimPartID: number;
  partTypeName: string;
  partTypeDescription: string;
  originalSerial: string;
  newSerialNumber: string;
  quantity: number;
  notes: string;
}

// State mới để quản lý số lượng báo thiếu
interface MissingPartInput {
  claimPartID: number;
  partTypeName: string;
  quantityRequested: number;
  missingQuantity: number; // Số lượng KTV nhập
}

export function ApprovedRequestsList({
  onSelectRequest,
  onNextStep,
}: ApprovedRequestsListProps) {
  const { user } = useAuth();
  const TECHNICIAN_ID = user?.userId;

  const [assignments, setAssignments] = useState<AssignmentProgressResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClaimDetails, setIsLoadingClaimDetails] = useState(false);
  const [selectedRequestData, setSelectedRequestData] =
    useState<ClaimDetailsWithAssignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState({ vin: "", requestCode: "" });

  // State cho Step 1: Xác nhận đủ
  const [partConfirmations, setPartConfirmations] = useState<PartConfirmation[]>([]);

  // State cho Step 2: Báo thiếu
  const [isDiscrepancy, setIsDiscrepancy] = useState(false);
  const [discrepancyNote, setDiscrepancyNote] = useState("");
  const [missingParts, setMissingParts] = useState<MissingPartInput[]>([]); //  State mới

  const loadAssignments = useCallback(async () => {
    if (!TECHNICIAN_ID) {
      setDialogMessage("❌ Không tìm thấy thông tin kỹ thuật viên.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await claimAssignmentAPI.getAssignmentsByTechnician(TECHNICIAN_ID);
      const assignedClaims = response.data.result.filter(
        (assignment: AssignmentProgressResponse) =>
          assignment.status === "Đã phân công"
      );
      setAssignments(assignedClaims);
    } catch (err) {
      console.error("Error loading assignments:", err);
      setDialogMessage("❌ Lỗi khi tải danh sách yêu cầu.");
    } finally {
      setIsLoading(false);
    }
  }, [TECHNICIAN_ID]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const filteredRequests = assignments.filter((assignment) => {
    return (
      (filters.vin === "" || assignment.vin.toLowerCase().includes(filters.vin.toLowerCase())) &&
      (filters.requestCode === "" || assignment.claimCode.toString().includes(filters.requestCode))
    );
  });

  const handleViewDetails = async (assignment: AssignmentProgressResponse) => {
    setIsLoadingClaimDetails(true);
    try {
      const response = await warrantyClaimAPI.getClaimById(assignment.claimCode);
      const claimDetails: WarrantyClaimResponse = response.data.result;

      setSelectedRequestData({ ...assignment, claimDetails });

      // 2. Khởi tạo state cho KTV nhập liệu
      if (claimDetails.affectedParts && claimDetails.affectedParts.length > 0) {
        const initialPartConfirmations: PartConfirmation[] = [];
        const initialMissingParts: MissingPartInput[] = [];

        claimDetails.affectedParts.forEach((part: ClaimPartResponse) => {
          // ⬅️ Lấy số lượng từ DTO (đã cập nhật ở file warranty.ts)
          const partQuantity = part.quantity || 1;

          initialPartConfirmations.push({
            claimPartID: part.claimPartID,
            partTypeName: part.partTypeName,
            partTypeDescription: part.partTypeDescription,
            originalSerial: part.partSerialNumber,
            newSerialNumber: "",
            quantity: partQuantity,
            notes: "",
          });

          initialMissingParts.push({
            claimPartID: part.claimPartID,
            partTypeName: part.partTypeName,
            quantityRequested: partQuantity,
            missingQuantity: 0, // Mặc định là 0
          });
        });

        setPartConfirmations(initialPartConfirmations);
        setMissingParts(initialMissingParts); // ⬅️ Set state mới
      } else {
        setPartConfirmations([]);
        setMissingParts([]);
      }

      // 3. Reset form
      setIsDiscrepancy(false);
      setDiscrepancyNote("");
      setIsModalOpen(true);

    } catch (error) {
      console.error("Error loading claim details:", error);
      setDialogMessage("❌ Lỗi khi tải thông tin chi tiết đơn bảo hành.");
    } finally {
      setIsLoadingClaimDetails(false);
    }
  };

  // Logic này KHÔNG ĐỔI (vẫn xác nhận 1-1 theo DTO backend)
  const handleConfirmParts = async () => {
    const unconfirmedParts = partConfirmations.filter(p => !p.newSerialNumber.trim());
    if (unconfirmedParts.length > 0) {
      setDialogMessage(`⚠️ Vui lòng nhập số seri mới cho tất cả ${partConfirmations.length} phụ tùng.`);
      return;
    }
    if (!selectedRequestData) {
      setDialogMessage("⚠️ Không tìm thấy thông tin yêu cầu.");
      return;
    }

    setIsLoading(true);

    try {
      const partReplacements = partConfirmations.map(p => {
        const serial = p.newSerialNumber.trim();
        const repeat = Math.max(1, Number(p.quantity) || 1);
        const serials = Array.from({ length: repeat }, () => serial);
        return {
          claimPartID: p.claimPartID,
          newPartSerialNumbers: serials,
        };
      });

      const requestData: ConfirmPartsRequestDTO = {
        partReplacements
      };

      await claimAssignmentAPI.confirmPartsReceipt(
        selectedRequestData.assignmentID,
        requestData
      );

      setDialogMessage(`✅ Đã xác nhận đủ ${partConfirmations.length} phụ tùng thành công.`);
      setIsModalOpen(false);
      onSelectRequest?.(selectedRequestData);
      loadAssignments();

      setTimeout(() => {
        onNextStep?.();
      }, 2000);

    } catch (err: unknown) {
      console.error("❌ [Technician] Error confirming parts:", err);
      let errorMessage = "Lỗi khi xác nhận phụ tùng!\n\n";
      const maybeAxios: any = err as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      errorMessage += maybeAxios?.response?.data?.message || (err instanceof Error ? err.message : String(err));
      setDialogMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ⬅️ [SỬA HOÀN TOÀN LOGIC NÀY]
  const handleReportDiscrepancy = async () => {
    // 1. Lọc ra những phụ tùng có báo thiếu
    const partsToReport = missingParts.filter(p => p.missingQuantity > 0);

    if (partsToReport.length === 0) {
      setDialogMessage("Vui lòng nhập số lượng thiếu cho ít nhất 1 phụ tùng.");
      return;
    }
    if (!selectedRequestData || !selectedRequestData.claimDetails) return;

    setIsLoading(true);

    try {
      const claimID = selectedRequestData.claimCode;

      // 2. Build DTO khớp với ReportMissingPartsRequest.java (từ backend)
      const missingPartsDTO = partsToReport.map(p => ({
        claimPartID: p.claimPartID,
        missingQuantity: p.missingQuantity
      }));

      const requestData: ReportMissingPartsRequestDTO = {
        missingParts: missingPartsDTO,
        note: discrepancyNote.trim() || "KTV Báo thiếu hàng."
      };

      console.log("Calling API: reportMissingParts", requestData);

      // 3. GỌI API BÁO THIẾU
      //
      await warrantyClaimAPI.reportMissingParts(claimID, requestData);

      setDialogMessage(
        "📨 Đã gửi báo cáo thiếu hàng thành công.\n" +
        "Hãng xe sẽ nhận được thông báo để xử lý."
      );
      setIsModalOpen(false);

    } catch (err: unknown) {
      console.error("Error reporting discrepancy:", err);
      let errorMessage = "❌ Lỗi khi gửi báo cáo.\n\n";
      const maybeAxios: any = err as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      errorMessage += maybeAxios?.response?.data?.message || (err instanceof Error ? err.message : String(err));
      setDialogMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ⬅️ THÊM: Hàm để cập nhật số lượng thiếu
  const handleMissingQuantityChange = (claimPartID: number, value: string) => {
    const qty = parseInt(value) || 0;
    setMissingParts(prev =>
      prev.map(p =>
        p.claimPartID === claimPartID
          ? { ...p, missingQuantity: qty < 0 ? 0 : qty }
          : p
      )
    );
  };


  return (
    <div className="p-6">
      <CardHeader className="px-0">
        <CardTitle className="flex items-center space-x-2 text-gray-800">
          <span>Danh sách yêu cầu đã được duyệt</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        {/* Bộ lọc */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 border rounded-lg shadow-sm">
          {/* (Input VIN) */}
          <div>
            <Label htmlFor="vin-filter">VIN</Label>
            <Input
              id="vin-filter"
              placeholder="Nhập VIN..."
              value={filters.vin}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, vin: e.target.value }))
              }
            />
          </div>
          {/* (Input Mã yêu cầu) */}
          <div>
            <Label htmlFor="request-filter">Mã yêu cầu</Label>
            <Input
              id="request-filter"
              placeholder="Nhập mã yêu cầu..."
              value={filters.requestCode}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  requestCode: e.target.value,
                }))
              }
            />
          </div>
          {/* (Input Ngày duyệt - disabled) */}
          <div>
            <Label htmlFor="date-filter">Ngày duyệt</Label>
            <Input
              id="date-filter"
              type="date"
              disabled
            />
          </div>
          {/* (Input Phụ tùng - disabled) */}
          <div>
            <Label htmlFor="parts-filter">Phụ tùng</Label>
            <Input
              id="parts-filter"
              placeholder="Nhập tên phụ tùng..."
              disabled
            />
          </div>
        </div>

        {/* Bảng */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã yêu cầu</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Phụ tùng yêu cầu</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày duyệt</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-muted-foreground">Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">
                    Không có yêu cầu nào được phân công
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((assignment) => (
                <TableRow
                  key={assignment.assignmentID}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium">
                    #{assignment.claimCode}
                  </TableCell>
                  <TableCell>{assignment.vin}</TableCell>
                  <TableCell>{"-"}</TableCell>
                  <TableCell>{"-"}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Đã phân công
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.assignedDate).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(assignment)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Modal xác nhận nhận phụ tùng */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {isDiscrepancy ? "Báo cáo thiếu phụ tùng" : "Xác nhận nhận phụ tùng"}
              </DialogTitle>
            </DialogHeader>

            {isLoadingClaimDetails ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-muted-foreground">Đang tải thông tin...</span>
              </div>
            ) : selectedRequestData && (
              <div className="space-y-3">
                {/* Thông tin chung */}
                <div className="bg-gray-50 rounded-lg p-2.5 border text-sm">
                  <p className="mb-1">
                    <strong>Mã yêu cầu:</strong> #{selectedRequestData.claimCode}
                  </p>
                  <p className="mb-1">
                    <strong>VIN:</strong> {selectedRequestData.vin}
                  </p>
                  <p>
                    <strong>Kỹ thuật viên:</strong> {selectedRequestData.technicianName}
                  </p>
                </div>

                {/* ⬅️ SỬA: Hiển thị UI dựa trên state isDiscrepancy */}
                {!isDiscrepancy ? (
                  // ==========================================
                  // GIAO DIỆN 1: XÁC NHẬN ĐỦ HÀNG
                  // ==========================================
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                      <p className="text-sm font-semibold text-blue-800 mb-2">
                        🔧 Danh sách {partConfirmations.length} phụ tùng cần xác nhận:
                      </p>

                      {partConfirmations.map((part, index) => (
                        <div key={part.claimPartID} className="mb-4 last:mb-0 bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                          <p className="text-sm font-semibold text-blue-700 mb-2">
                            Phụ tùng {index + 1}: {part.partTypeName}
                          </p>

                          <div className="text-xs text-gray-700 space-y-1 mb-3">
                            <p><strong>Mô tả:</strong> {part.partTypeDescription}</p>
                            <p><strong>Serial cũ (đang lắp):</strong> <code className="bg-gray-100 px-1 py-0.5 rounded">{part.originalSerial}</code></p>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <Label htmlFor={`newSerial-${index}`} className="text-xs font-semibold">
                                Số serial mới thay thế * (Nhập 1 serial)
                              </Label>
                              <Input
                                id={`newSerial-${index}`}
                                placeholder="Nhập serial mới..."
                                value={part.newSerialNumber}
                                onChange={(e) => {
                                  const newParts = [...partConfirmations];
                                  newParts[index].newSerialNumber = e.target.value;
                                  setPartConfirmations(newParts);
                                }}
                                className="mt-1"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor={`quantity-${index}`} className="text-xs">Số lượng (Yêu cầu)</Label>
                                <Input
                                  id={`quantity-${index}`}
                                  type="number"
                                  value={part.quantity} // ⬅️ Hiển thị số lượng
                                  readOnly
                                  disabled
                                  className="mt-1 bg-gray-100"
                                />
                              </div>
                              <div className="flex items-end">
                                {part.newSerialNumber && (
                                  <Badge className="bg-green-100 text-green-700 border-green-300 h-9 px-3">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Đã nhập
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div>
                              <Label htmlFor={`notes-${index}`} className="text-xs">Ghi chú (tùy chọn)</Label>
                              <Textarea
                                id={`notes-${index}`}
                                placeholder="Nhập ghi chú cho phụ tùng này..."
                                value={part.notes}
                                onChange={(e) => {
                                  const newParts = [...partConfirmations];
                                  newParts[index].notes = e.target.value;
                                  setPartConfirmations(newParts);
                                }}
                                rows={2}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Hiển thị tổng số phụ tùng đã nhập serial */}
                    <div className="text-center text-sm">
                      <Badge variant="outline" className="text-blue-700">
                        Đã nhập serial: {partConfirmations.filter(p => p.newSerialNumber.trim()).length}/{partConfirmations.length}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  // ==========================================
                  // GIAO DIỆN 2: BÁO CÁO THIẾU HÀNG
                  // ==========================================
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                      <p className="text-sm font-semibold text-red-800 mb-2">
                        ⚠️ Chọn phụ tùng và nhập số lượng bị thiếu:
                      </p>

                      {missingParts.map((part) => (
                        <div key={part.claimPartID} className="mb-2 p-3 bg-white rounded-lg border border-red-200 shadow-sm">
                          <p className="text-sm font-semibold">{part.partTypeName}</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            (Yêu cầu: {part.quantityRequested})
                          </p>
                          <Label htmlFor={`missing-${part.claimPartID}`} className="text-xs font-medium">
                            Số lượng thiếu *
                          </Label>
                          <Input
                            id={`missing-${part.claimPartID}`}
                            type="number"
                            min="0"
                            max={part.quantityRequested} // Không cho nhập lố
                            value={part.missingQuantity}
                            onChange={(e) =>
                              handleMissingQuantityChange(part.claimPartID, e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                      ))}

                      <div className="mt-4">
                        <Label htmlFor="discrepancy-desc" className="text-sm">
                          Ghi chú chung (lý do)
                        </Label>
                        <Textarea
                          id="discrepancy-desc"
                          placeholder="Mô tả thêm về lý do thiếu hàng..."
                          value={discrepancyNote}
                          onChange={(e) => setDiscrepancyNote(e.target.value)}
                          rows={3}
                          className="mt-1 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Nút actions (đã sửa) */}
                <div className="flex space-x-2 pt-4">
                  {!isDiscrepancy ? (
                    // Nút cho Giao diện 1
                    <>
                      <Button
                        onClick={handleConfirmParts}
                        className="flex-1"
                        disabled={partConfirmations.some(p => !p.newSerialNumber.trim()) || isLoading}
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        {isLoading ? "Đang xử lý..." : `Xác nhận đủ ${partConfirmations.length} phụ tùng`}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setIsDiscrepancy(true)}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Báo cáo thiếu hàng
                      </Button>
                    </>
                  ) : (
                    // Nút cho Giao diện 2
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsDiscrepancy(false)}
                        disabled={isLoading}
                      >
                        Quay lại
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReportDiscrepancy} // ⬅️ Gọi hàm đã sửa
                        disabled={missingParts.every(p => p.missingQuantity === 0) || isLoading}
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Gửi báo cáo thiếu hàng
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog thông báo (thay cho toast) */}
        <Dialog
          open={!!dialogMessage}
          onOpenChange={() => setDialogMessage(null)}
        >
          <DialogContent className="max-w-sm text-center">
            <DialogHeader>
              <DialogTitle>Thông báo</DialogTitle>
            </DialogHeader>
            <p className="text-gray-700">{dialogMessage}</p>
            <DialogFooter>
              <Button onClick={() => setDialogMessage(null)}>Đóng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </div>
  );
}
