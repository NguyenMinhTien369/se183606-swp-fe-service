"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Filter, AlertTriangle, CheckCircle } from "lucide-react";
import { claimAssignmentAPI } from "@/utility/index";
import type { AssignmentProgressResponse } from "../types";

interface ApprovedRequestsListProps {
  onSelectRequest?: (request: any) => void;
  onNextStep?: () => void;
}

export function ApprovedRequestsList({
  onSelectRequest,
  onNextStep,
}: ApprovedRequestsListProps) {
  // Get technician ID from auth context (hardcoded for now)
  const TECHNICIAN_ID = 1; // TODO: Get from AuthContext

  const [assignments, setAssignments] = useState<AssignmentProgressResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequestData, setSelectedRequestData] =
    useState<AssignmentProgressResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    vin: "",
    requestCode: "",
    approvalDate: "",
    parts: "",
  });
  const [partConfirmation, setPartConfirmation] = useState({
    serialNumber: "",
    quantity: 1,
    notes: "",
    isDiscrepancy: false,
    discrepancyType: "",
    discrepancyDescription: "",
  });

  // Load assignments on mount
  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await claimAssignmentAPI.getAssignmentsByTechnician(
        TECHNICIAN_ID
      );
      // Filter only ASSIGNED status (ready to start repair)
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

  const handleViewDetails = (assignment: AssignmentProgressResponse) => {
    setSelectedRequestData(assignment);
    setIsModalOpen(true);
  };

  const handleConfirmParts = async () => {
    if (!partConfirmation.serialNumber) {
      setDialogMessage("⚠️ Vui lòng nhập số seri phụ tùng.");
      return;
    }

    if (!selectedRequestData) return;

    try {
      // Update assignment to IN_PROGRESS status
      const formData = new FormData();
      formData.append("status", "Đang thay thế");
      formData.append("completionPercentage", "10");
      formData.append(
        "internalNotes",
        `Đã nhận phụ tùng. Serial: ${partConfirmation.serialNumber}. ${partConfirmation.notes}`
      );

      await claimAssignmentAPI.updateAssignmentProgress(
        selectedRequestData.assignmentID,
        formData
      );

      setDialogMessage("✅ Đã xác nhận nhận phụ tùng thành công.");
      setIsModalOpen(false);
      onSelectRequest?.(selectedRequestData);

      // Reload assignments
      loadAssignments();

      setPartConfirmation({
        serialNumber: "",
        quantity: 1,
        notes: "",
        isDiscrepancy: false,
        discrepancyType: "",
        discrepancyDescription: "",
      });
    } catch (error) {
      console.error("Error confirming parts:", error);
      setDialogMessage("❌ Lỗi khi xác nhận phụ tùng. Vui lòng thử lại.");
    }
  };

  const handleReportDiscrepancy = async () => {
    if (
      !partConfirmation.discrepancyType ||
      !partConfirmation.discrepancyDescription
    ) {
      setDialogMessage("⚠️ Vui lòng điền đầy đủ thông tin sai lệch.");
      return;
    }

    if (!selectedRequestData) return;

    try {
      // Update assignment with discrepancy note to AWAITING_PARTS status
      const formData = new FormData();
      formData.append("status", "AWAITING_PARTS");
      formData.append(
        "internalNotes",
        `BÁO CÁO SAI LỆCH - Loại: ${partConfirmation.discrepancyType}, Chi tiết: ${partConfirmation.discrepancyDescription}`
      );

      await claimAssignmentAPI.updateAssignmentProgress(
        selectedRequestData.assignmentID,
        formData
      );

      setDialogMessage("📨 Đã gửi báo cáo sai lệch cho SC Staff.");
      setIsModalOpen(false);

      // Reload assignments
      loadAssignments();

      setPartConfirmation({
        serialNumber: "",
        quantity: 1,
        notes: "",
        isDiscrepancy: false,
        discrepancyType: "",
        discrepancyDescription: "",
      });
    } catch (error) {
      console.error("Error reporting discrepancy:", error);
      setDialogMessage("❌ Lỗi khi gửi báo cáo sai lệch. Vui lòng thử lại.");
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
                  <TableCell>-</TableCell>{" "}
                  {/* Model not in AssignmentProgressResponse */}
                  <TableCell>-</TableCell>{" "}
                  {/* Parts not in AssignmentProgressResponse */}
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      � Đã phân công
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.assignedDate).toLocaleDateString(
                      "vi-VN"
                    )}
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Xác nhận nhận phụ tùng
              </DialogTitle>
            </DialogHeader>

            {selectedRequestData && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <p>
                    <strong>Mã yêu cầu:</strong> #
                    {selectedRequestData.claimCode}
                  </p>
                  <p>
                    <strong>VIN:</strong> {selectedRequestData.vin}
                  </p>
                  <p>
                    <strong>Kỹ thuật viên:</strong>{" "}
                    {selectedRequestData.technicianName}
                  </p>
                </div>

                <div>
                  <Label htmlFor="serial">Số seri</Label>
                  <Input
                    id="serial"
                    placeholder="Nhập số seri..."
                    value={partConfirmation.serialNumber}
                    onChange={(e) =>
                      setPartConfirmation((prev) => ({
                        ...prev,
                        serialNumber: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Số lượng</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={partConfirmation.quantity}
                    onChange={(e) =>
                      setPartConfirmation((prev) => ({
                        ...prev,
                        quantity: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    placeholder="Nhập ghi chú..."
                    value={partConfirmation.notes}
                    onChange={(e) =>
                      setPartConfirmation((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>

                {partConfirmation.isDiscrepancy && (
                  <div className="space-y-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <Label htmlFor="discrepancy-type">Loại sai lệch</Label>
                      <Select
                        value={partConfirmation.discrepancyType}
                        onValueChange={(value) =>
                          setPartConfirmation((prev) => ({
                            ...prev,
                            discrepancyType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại sai lệch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="missing">Thiếu</SelectItem>
                          <SelectItem value="wrong-code">Sai mã</SelectItem>
                          <SelectItem value="damaged">Hỏng</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="discrepancy-desc">Mô tả chi tiết</Label>
                      <Textarea
                        id="discrepancy-desc"
                        placeholder="Mô tả chi tiết sai lệch..."
                        value={partConfirmation.discrepancyDescription}
                        onChange={(e) =>
                          setPartConfirmation((prev) => ({
                            ...prev,
                            discrepancyDescription: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-4">
                  {!partConfirmation.isDiscrepancy ? (
                    <>
                      <Button onClick={handleConfirmParts} className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Xác nhận đủ
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          setPartConfirmation((prev) => ({
                            ...prev,
                            isDiscrepancy: true,
                          }))
                        }
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
                        onClick={() =>
                          setPartConfirmation((prev) => ({
                            ...prev,
                            isDiscrepancy: false,
                          }))
                        }
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
