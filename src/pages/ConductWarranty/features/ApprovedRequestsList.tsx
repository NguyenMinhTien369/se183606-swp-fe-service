"use client";

import React, { useState } from "react";
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

const mockRequests = [
  {
    id: "CLM-2025-031",
    vin: "XCF12345",
    model: "Ranger XLS",
    parts: "Turbo Kit",
    partCode: "8G1A-6K682",
    status: "approved",
    approvalDate: "03/10/2025",
    quantity: 1,
  },
  {
    id: "CLM-2025-032",
    vin: "XCF12346",
    model: "Everest Titanium",
    parts: "Brake Pad Set",
    partCode: "7D0-698-151",
    status: "approved",
    approvalDate: "04/10/2025",
    quantity: 4,
  },
  {
    id: "CLM-2025-033",
    vin: "XCF12347",
    model: "Territory Trend",
    parts: "Air Filter",
    partCode: "9C1A-9601-AA",
    status: "approved",
    approvalDate: "05/10/2025",
    quantity: 1,
  },
];

interface ApprovedRequestsListProps {
  onSelectRequest?: (request: any) => void;
  onNextStep?: () => void;
}

export function ApprovedRequestsList({
  onSelectRequest,
  onNextStep,
}: ApprovedRequestsListProps) {
  const [requests, setRequests] = useState(mockRequests);
  const [selectedRequestData, setSelectedRequestData] = useState<any>(null);
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

  const filteredRequests = requests.filter((request) => {
    return (
      (filters.vin === "" ||
        request.vin.toLowerCase().includes(filters.vin.toLowerCase())) &&
      (filters.requestCode === "" ||
        request.id.toLowerCase().includes(filters.requestCode.toLowerCase())) &&
      (filters.parts === "" ||
        request.parts.toLowerCase().includes(filters.parts.toLowerCase()))
    );
  });

  const handleViewDetails = (request: any) => {
    setSelectedRequestData(request);
    setPartConfirmation((prev) => ({ ...prev, quantity: request.quantity }));
    setIsModalOpen(true);
  };

  const handleConfirmParts = () => {
    if (!partConfirmation.serialNumber) {
      setDialogMessage("⚠️ Vui lòng nhập số seri phụ tùng.");
      return;
    }

    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequestData.id
          ? { ...req, status: "received", receivedAt: new Date().toISOString() }
          : req
      )
    );

    setDialogMessage("✅ Đã xác nhận nhận phụ tùng thành công.");
    setIsModalOpen(false);
    onSelectRequest?.(selectedRequestData);
    setPartConfirmation({
      serialNumber: "",
      quantity: 1,
      notes: "",
      isDiscrepancy: false,
      discrepancyType: "",
      discrepancyDescription: "",
    });
  };

  const handleReportDiscrepancy = () => {
    if (
      !partConfirmation.discrepancyType ||
      !partConfirmation.discrepancyDescription
    ) {
      setDialogMessage("⚠️ Vui lòng điền đầy đủ thông tin sai lệch.");
      return;
    }

    setDialogMessage("📨 Đã gửi báo cáo sai lệch cho SC Staff.");
    setIsModalOpen(false);
    setPartConfirmation({
      serialNumber: "",
      quantity: 1,
      notes: "",
      isDiscrepancy: false,
      discrepancyType: "",
      discrepancyDescription: "",
    });
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
            {filteredRequests.map((request) => (
              <TableRow
                key={request.id}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <TableCell className="font-medium">{request.id}</TableCell>
                <TableCell>{request.vin}</TableCell>
                <TableCell>{request.model}</TableCell>
                <TableCell>{request.parts}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      request.status === "approved" ? "default" : "secondary"
                    }
                    className={`${
                      request.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {request.status === "approved"
                      ? "🟢 Được chấp thuận"
                      : "📦 Đã nhận phụ tùng"}
                  </Badge>
                </TableCell>
                <TableCell>{request.approvalDate}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(request)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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
                    <strong>Phụ tùng:</strong> {selectedRequestData.parts}
                  </p>
                  <p>
                    <strong>Mã:</strong> {selectedRequestData.partCode}
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
