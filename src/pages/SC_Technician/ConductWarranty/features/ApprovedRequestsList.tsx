"use client";

import { useState, useEffect } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { claimAssignmentAPI, warrantyClaimAPI, partAPI } from "@/utility/index";
import { useAuth } from "@/pages/Login/feature/AuthContext";
import type {
  AssignmentProgressResponse, WarrantyClaimResponse,

} from "../types";

interface ApprovedRequestsListProps {
  onSelectRequest?: (request: any) => void;
  onNextStep?: () => void;
}

interface ClaimDetailsWithAssignment extends AssignmentProgressResponse {
  claimDetails?: WarrantyClaimResponse;
}

export function ApprovedRequestsList({
  onSelectRequest,
  onNextStep,
}: ApprovedRequestsListProps) {
  const { user } = useAuth();
  const TECHNICIAN_ID = user?.userId;

  const [assignments, setAssignments] = useState<AssignmentProgressResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClaimDetails, setIsLoadingClaimDetails] = useState(false);
  const [selectedRequestData, setSelectedRequestData] =
    useState<ClaimDetailsWithAssignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    vin: "",
    requestCode: "",
    approvalDate: "",
    parts: "",
  });

  interface PartConfirmation {
    claimPartID: number | null;
    partTypeName: string;
    partTypeDescription: string;
    originalSerial: string;
    newSerialNumber: string;
    quantity: number;
    notes: string;
    confirmed: boolean;
  }

  const [partConfirmations, setPartConfirmations] = useState<PartConfirmation[]>([]);
  const [isDiscrepancy, setIsDiscrepancy] = useState(false);
  const [discrepancyInfo, setDiscrepancyInfo] = useState({
    discrepancyType: "",
    discrepancyDescription: "",
  });

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    if (!TECHNICIAN_ID) {
      console.error("Technician ID not found");
      setDialogMessage(
        "❌ Không tìm thấy thông tin kỹ thuật viên. Vui lòng đăng nhập lại."
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await claimAssignmentAPI.getAssignmentsByTechnician(
        TECHNICIAN_ID
      );
      const assignedClaims = response.data.result.filter(
        (assignment: AssignmentProgressResponse) =>
          assignment.status === "Đã phân công"
      );
      setAssignments(assignedClaims);
    } catch (error) {
      console.error("Error loading assignments:", error);
      setDialogMessage("❌ Lỗi khi tải danh sách yêu cầu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = assignments.filter((assignment) => {
    return (
      (filters.vin === "" ||
        assignment.vin.toLowerCase().includes(filters.vin.toLowerCase())) &&
      (filters.requestCode === "" ||
        assignment.claimCode.toString().includes(filters.requestCode))
    );
  });

  const handleViewDetails = async (assignment: AssignmentProgressResponse) => {
    setIsLoadingClaimDetails(true);
    try {
      const response = await warrantyClaimAPI.getClaimById(assignment.claimCode);
      const claimDetails: WarrantyClaimResponse = response.data.result;
      const combinedData: ClaimDetailsWithAssignment = {
        ...assignment,
        claimDetails
      };

      setSelectedRequestData(combinedData);

      // Initialize part confirmations for all affected parts
      if (claimDetails.affectedParts && claimDetails.affectedParts.length > 0) {
        const initialParts: PartConfirmation[] = claimDetails.affectedParts.map(part => ({
          claimPartID: part.claimPartID || null,
          partTypeName: part.partTypeName,
          partTypeDescription: part.partTypeDescription,
          originalSerial: part.partSerialNumber,
          newSerialNumber: "",
          quantity: 1,
          notes: "",
          confirmed: false,
        }));
        setPartConfirmations(initialParts);
      }

      // Reset discrepancy state
      setIsDiscrepancy(false);
      setDiscrepancyInfo({
        discrepancyType: "",
        discrepancyDescription: "",
      });

      setIsModalOpen(true);
    } catch (error) {
      console.error("Error loading claim details:", error);
      setDialogMessage("❌ Lỗi khi tải thông tin chi tiết đơn bảo hành.");
    } finally {
      setIsLoadingClaimDetails(false);
    }
  };

  const handleConfirmParts = async () => {
    // Validate that all parts have new serial numbers
    const unconfirmedParts = partConfirmations.filter(p => !p.newSerialNumber.trim());
    if (unconfirmedParts.length > 0) {
      setDialogMessage(`⚠️ Vui lòng nhập số seri cho tất cả ${partConfirmations.length} phụ tùng.\n` +
        `Còn ${unconfirmedParts.length} phụ tùng chưa nhập serial.`);
      return;
    }

    if (!selectedRequestData) {
      setDialogMessage("⚠️ Không tìm thấy thông tin yêu cầu.");
      return;
    }

    console.log("🔍 [Technician] Confirming parts receipt...");
    console.log("  Assignment ID:", selectedRequestData.assignmentID);
    console.log("  Claim Code:", selectedRequestData.claimCode);
    console.log("  Claim ID:", selectedRequestData.claimDetails?.claimID);
    console.log("  Total parts:", partConfirmations.length);

    try {
      // Build confirmation note for all parts
      const partsDetails = partConfirmations.map((part, idx) =>
        `${idx + 1}. ${part.partTypeName}\n` +
        `   Serial cũ: ${part.originalSerial}\n` +
        `   Serial mới: ${part.newSerialNumber}\n` +
        `   Số lượng: ${part.quantity}\n` +
        `   ${part.notes ? `Ghi chú: ${part.notes}` : ""}`
      ).join("\n\n");

      const confirmationNote =
        `✅ Đã xác nhận đủ ${partConfirmations.length} phụ tùng.\n\n` +
        partsDetails +
        `\n\nPhụ tùng đã được kiểm tra và xác nhận đầy đủ.`;

      // Build part replacements array for all parts
      const partReplacements = partConfirmations
        .filter(p => p.claimPartID)
        .map(p => ({
          claimPartID: p.claimPartID!,
          newPartSerialNumber: p.newSerialNumber
        }));

      console.log("  Part replacements:", partReplacements);
      console.log("  Parts without claimPartID:", partConfirmations.filter(p => !p.claimPartID).length);

      if (partReplacements.length === 0) {
        console.warn("⚠️ [Technician] No valid claimPartID found in parts!");
        setDialogMessage("⚠️ Không tìm thấy ID phụ tùng hợp lệ. Vui lòng thử lại hoặc liên hệ quản trị viên.");
        return;
      }

      const requestData = {
        partReplacements,
        internalNotes: confirmationNote
      };

      console.log("  Request data:", JSON.stringify(requestData, null, 2));

      // IMPORTANT: Register new parts in database first to avoid 404 errors
      console.log("  📝 Registering new parts in database...");
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      const warrantyEndDate = oneYearLater.toISOString().split('T')[0];

      let allPartsRegistered = true;
      for (const part of partConfirmations) {
        const cleanSerial = part.newSerialNumber.trim().replace(/\s+/g, ' ');
        try {
          // Try to get existing part first
          try {
            await partAPI.getPartBySerialNumber(cleanSerial);
            console.log("    ✅ Part already exists:", cleanSerial);
          } catch (getError: any) {
            // Part doesn't exist, create it
            if (getError.response?.status === 404) {
              await partAPI.createPart({
                partSerialNumber: cleanSerial,
                partTypeID: 1, // Default part type
                productionDate: today,
                warrantyPeriod: warrantyEndDate
              });
              console.log("    ✅ Registered new part:", cleanSerial);
            } else {
              throw getError;
            }
          }
        } catch (partError: any) {
          console.error("    ❌ Failed to register part:", cleanSerial, partError.response?.data);
          allPartsRegistered = false;
        }
      }

      if (!allPartsRegistered) {
        console.warn("  ⚠️ Some parts failed to register, will use fallback API");
      }

      // Try confirmPartsReceipt first, fallback to updateAssignmentProgress if it fails
      let response;
      try {
        console.log("  Calling API: PUT /claim-assignments/" + selectedRequestData.assignmentID + "/confirm-parts");
        response = await claimAssignmentAPI.confirmPartsReceipt(
          selectedRequestData.assignmentID,
          requestData
        );
        console.log("  ✅ Used confirmPartsReceipt API");
      } catch (confirmError: any) {
        if (confirmError.response?.status === 400 || confirmError.response?.status === 404) {
          console.log("  ⚠️ confirmPartsReceipt failed (status: " + confirmError.response?.status + ")");
          console.log("  Error message:", confirmError.response?.data?.message || confirmError.message);
          console.log("  Trying updateAssignmentProgress instead...");

          // Fallback: Use updateAssignmentProgress with FormData
          const formData = new FormData();

          // Add part serial numbers to notes for tracking
          const partsSerialInfo = partConfirmations.map(p =>
            `${p.partTypeName}: ${p.originalSerial} -> ${p.newSerialNumber}`
          ).join("; ");

          const fullNote = confirmationNote + "\n\nSerial numbers: " + partsSerialInfo;

          formData.append("status", "Nhận phụ tùng"); // Update status to "Received parts"
          formData.append("internalNotes", fullNote);

          console.log("  Fallback request:");
          console.log("    Status:", "Nhận phụ tùng");
          console.log("    Notes length:", fullNote.length);
          console.log("  Calling API: PUT /claim-assignments/" + selectedRequestData.assignmentID + "/progress");

          response = await claimAssignmentAPI.updateAssignmentProgress(
            selectedRequestData.assignmentID,
            formData
          );
          console.log("  ✅ Used updateAssignmentProgress API as fallback");

          // IMPORTANT: updateAssignmentProgress doesn't update claim status, so we need to manually sync it
          console.log("  🔄 Syncing warranty claim status to 'Đã nhận'...");
          try {
            let claimID = selectedRequestData.claimDetails?.claimID;

            // If claimID not found, extract from claimCode (format: "CLM-123" -> 123)
            if (!claimID && selectedRequestData.claimCode) {
              const codeStr = String(selectedRequestData.claimCode);
              const match = codeStr.match(/CLM-(\d+)/) || codeStr.match(/(\d+)/);
              if (match) {
                claimID = parseInt(match[1]);
                console.log("  📝 Extracted claimID from claimCode:", claimID);
              }
            }

            if (claimID) {
              await warrantyClaimAPI.syncStatusFromManufacturer(claimID, "Đã nhận");
              console.log("  ✅ Claim status synced successfully to 'Đã nhận'");
            } else {
              console.warn("  ⚠️ No claimID found, skipping status sync");
            }
          } catch (syncError: any) {
            console.error("  ⚠️ Failed to sync claim status:", syncError);
            // Don't throw - assignment update was successful
          }
        } else {
          throw confirmError;
        }
      }

      console.log("✅ [Technician] Parts confirmed successfully");
      console.log("  Response:", response.data);

      const serialsList = partConfirmations.map(p => `${p.partTypeName}: ${p.newSerialNumber}`).join(", ");
      setDialogMessage(`✅ Đã xác nhận đủ ${partConfirmations.length} phụ tùng thành công.\n${serialsList}\nCó thể chuyển sang bước sửa chữa.`);
      setIsModalOpen(false);
      onSelectRequest?.(selectedRequestData);

      // Reload assignments to reflect new status
      loadAssignments();

      // Automatically move to next step after confirmation
      setTimeout(() => {
        onNextStep?.();
      }, 2000);

      // Reset form
      setPartConfirmations([]);
    } catch (error: any) {
      console.error("❌ [Technician] Error confirming parts:", error);
      console.error("  Error response:", error.response);
      console.error("  Error data:", error.response?.data);
      console.error("  Status code:", error.response?.status);
      console.error("  Request URL:", error.config?.url);
      console.error("  Request data:", error.config?.data);

      // Extract detailed error message from response
      let errorMessage = "Lỗi khi xác nhận phụ tùng!\n\n";
      setDialogMessage(errorMessage);
    }
  };

  const handleReportDiscrepancy = async () => {
    if (
      !discrepancyInfo.discrepancyType ||
      !discrepancyInfo.discrepancyDescription
    ) {
      setDialogMessage("Vui lòng điền đầy đủ thông tin sai lệch.");
      return;
    }

    if (!selectedRequestData) return;

    try {
      // Step 7.1: Report discrepancy → Update to "Bị từ chối" status
      // This is the only valid transition from "Đã phân công" for reporting issues
      const formData = new FormData();
      formData.append("status", "Bị từ chối"); // Valid transition for reporting parts discrepancy
      // Note: completionPercentage is commented out in backend DTO, don't send it

      const discrepancyTypes: Record<string, string> = {
        missing: "Thiếu phụ tùng",
        "wrong-code": "Sai mã phụ tùng",
        damaged: "Phụ tùng bị hỏng",
        other: "Vấn đề khác"
      };

      // Build report for all parts
      const partsReport = partConfirmations.map((part, idx) =>
        `${idx + 1}. ${part.partTypeName}\n` +
        `   Serial cũ: ${part.originalSerial}\n` +
        `   Serial mới đã kiểm tra: ${part.newSerialNumber || "N/A"}\n` +
        `   Số lượng: ${part.quantity}`
      ).join("\n\n");

      const reportMessage =
        `❌ BÁO CÁO THIẾU HÀNG\n` +
        `Tổng số phụ tùng: ${partConfirmations.length}\n\n` +
        `Danh sách phụ tùng:\n${partsReport}\n\n` +
        `Loại vấn đề: ${discrepancyTypes[discrepancyInfo.discrepancyType] || discrepancyInfo.discrepancyType}\n` +
        `Chi tiết: ${discrepancyInfo.discrepancyDescription}\n` +
        `Thời gian báo cáo: ${new Date().toLocaleString("vi-VN")}`;

      formData.append("internalNotes", reportMessage);

      console.log("Sending discrepancy report...");
      console.log("Assignment ID:", selectedRequestData.assignmentID);
      console.log("Report message:", reportMessage);

      await claimAssignmentAPI.updateAssignmentProgress(
        selectedRequestData.assignmentID,
        formData
      );

      console.log("Discrepancy report sent successfully");

      setDialogMessage(
        "📨 Đã gửi báo cáo sai lệch thành công.\n\n" +
        "EVM Staff sẽ nhận được thông báo và xử lý yêu cầu.\n" +
        "Bạn có thể tiếp tục theo dõi tại danh sách phân công."
      );
      setIsModalOpen(false);

      // Reload assignments
      loadAssignments();

      // Reset form
      setPartConfirmations([]);
      setIsDiscrepancy(false);
      setDiscrepancyInfo({
        discrepancyType: "",
        discrepancyDescription: "",
      });
    } catch (error: any) {
      console.error("Error reporting discrepancy:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "❌ Lỗi khi gửi báo cáo sai lệch.\n\n";
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Vui lòng thử lại sau.";
      }

      setDialogMessage(errorMessage);
    }
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
          <div>
            <Label htmlFor="date-filter">Ngày duyệt</Label>
            <Input
              id="date-filter"
              type="date"
              value={filters.approvalDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  approvalDate: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="parts-filter">Phụ tùng</Label>
            <Input
              id="parts-filter"
              placeholder="Nhập tên phụ tùng..."
              value={filters.parts}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, parts: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Bảng */}
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
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
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
                Xác nhận nhận phụ tùng
              </DialogTitle>
            </DialogHeader>

            {isLoadingClaimDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="ml-3 text-muted-foreground">Đang tải thông tin...</span>
              </div>
            ) : selectedRequestData && (
              <div className="space-y-3">
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

                {/* Danh sách phụ tùng cần xác nhận */}
                {partConfirmations.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                      <p className="text-sm font-semibold text-blue-800 mb-2">
                        🔧 Danh sách {partConfirmations.length} phụ tùng cần xác nhận:
                      </p>

                      {partConfirmations.map((part, index) => (
                        <div key={index} className="mb-4 last:mb-0 bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
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
                                Số serial mới thay thế *
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
                                <Label htmlFor={`quantity-${index}`} className="text-xs">Số lượng</Label>
                                <Input
                                  id={`quantity-${index}`}
                                  type="number"
                                  min="0"
                                  value={part.quantity}
                                  onChange={(e) => {
                                    const newParts = [...partConfirmations];
                                    newParts[index].quantity = parseInt(e.target.value) || 0;
                                    setPartConfirmations(newParts);
                                  }}
                                  className="mt-1"
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
                )}

                {isDiscrepancy && (
                  <div className="space-y-2.5 p-3 bg-red-50 rounded-lg border-2 border-red-300">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-800">Báo cáo thiếu hàng</p>
                        <p className="text-xs text-red-700 mt-0.5">
                          Thông tin này sẽ được gửi cho EVM Staff để tạo lại yêu cầu cấp phụ tùng
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="discrepancy-type" className="text-sm">Loại vấn đề *</Label>
                      <Select
                        value={discrepancyInfo.discrepancyType}
                        onValueChange={(value) =>
                          setDiscrepancyInfo((prev) => ({
                            ...prev,
                            discrepancyType: value,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Chọn loại vấn đề" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="missing">Thiếu phụ tùng</SelectItem>
                          <SelectItem value="wrong-code">Sai mã phụ tùng</SelectItem>
                          <SelectItem value="damaged">Phụ tùng bị hỏng</SelectItem>
                          <SelectItem value="other">Vấn đề khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="discrepancy-desc" className="text-sm">Mô tả chi tiết vấn đề *</Label>
                      <Textarea
                        id="discrepancy-desc"
                        placeholder="Mô tả chi tiết vấn đề phát hiện..."
                        value={discrepancyInfo.discrepancyDescription}
                        onChange={(e) =>
                          setDiscrepancyInfo((prev) => ({
                            ...prev,
                            discrepancyDescription: e.target.value,
                          }))
                        }
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-4">
                  {!isDiscrepancy ? (
                    <>
                      <Button
                        onClick={handleConfirmParts}
                        className="flex-1"
                        disabled={partConfirmations.filter(p => p.newSerialNumber.trim()).length === 0}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Xác nhận đủ {partConfirmations.length} phụ tùng
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setIsDiscrepancy(true)}
                        className="flex-1"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Báo cáo sai lệch
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsDiscrepancy(false)}
                      >
                        Quay lại
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReportDiscrepancy}
                      >
                        Gửi báo cáo
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
