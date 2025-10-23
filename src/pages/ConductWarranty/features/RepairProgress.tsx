"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Settings, Clock } from "lucide-react";

// Mock data
const availableRequests = [
  {
    id: "CLM-2025-031",
    vin: "XCF12345",
    model: "Ranger XLS",
    parts: "Turbo Kit",
    partCode: "8G1A-6K682",
    status: "received",
    receivedDate: "05/10/2025",
  },
  {
    id: "CLM-2025-032",
    vin: "XCF12346",
    model: "Everest Titanium",
    parts: "Brake Pad Set",
    partCode: "7D0-698-151",
    status: "received",
    receivedDate: "06/10/2025",
  },
  {
    id: "CLM-2025-033",
    vin: "XCF12347",
    model: "Territory Trend",
    parts: "Air Filter",
    partCode: "9C1A-9601-AA",
    status: "received",
    receivedDate: "07/10/2025",
  },
  {
    id: "CLM-2025-034",
    vin: "XCF12348",
    model: "Focus ST",
    parts: "Engine Mount",
    partCode: "CM5Z-6038-A",
    status: "in-progress",
    receivedDate: "04/10/2025",
  },
];

export function RepairProgress({
  selectedRequest,
  onSelectRequest,
  onNextStep,
}) {
  const [currentWorkingRequest, setCurrentWorkingRequest] =
    useState(selectedRequest);
  const [dialog, setDialog] = useState({ open: false, title: "", message: "" });

  const [workStatus, setWorkStatus] = useState({
    startTime: "",
    expectedCompletion: "",
    status: currentWorkingRequest?.status || "received",
  });

  const [partInfo, setPartInfo] = useState({
    oldPartCode: currentWorkingRequest?.partCode + "-OLD" || "",
    newPartSerial: "",
    notes: "Phụ tùng mới đã được kiểm tra và lắp đặt đúng quy trình",
  });

  const showDialog = (title: string, message: string) => {
    setDialog({ open: true, title, message });
  };

  const handleSelectRequest = (requestId: string) => {
    const request = availableRequests.find((req) => req.id === requestId);
    if (request) {
      setCurrentWorkingRequest(request);
      onSelectRequest(request);
      setPartInfo((prev) => ({
        ...prev,
        oldPartCode: request.partCode + "-OLD",
      }));
      setWorkStatus((prev) => ({
        ...prev,
        status: request.status,
      }));
    }
  };

  const handleStartWork = () => {
    if (!currentWorkingRequest) {
      showDialog("Lỗi", "Vui lòng chọn yêu cầu bảo hành để bắt đầu.");
      return;
    }

    setWorkStatus((prev) => ({
      ...prev,
      status: "in-progress",
      startTime: new Date().toISOString(),
    }));

    setCurrentWorkingRequest((prev) => ({ ...prev, status: "in-progress" }));

    showDialog("Thành công", "Đã bắt đầu thực hiện sửa chữa.");
  };

  const handleUpdatePartInfo = () => {
    if (!partInfo.newPartSerial.trim()) {
      showDialog("Lỗi", "Vui lòng nhập số seri phụ tùng mới.");
      return;
    }

    showDialog("Cập nhật thành công", "Đã cập nhật thông tin phụ tùng.");
  };

  const handleCompleteWork = () => {
    if (!partInfo.newPartSerial.trim()) {
      showDialog(
        "Lỗi",
        "Vui lòng nhập số seri phụ tùng mới trước khi hoàn thành."
      );
      return;
    }

    setWorkStatus((prev) => ({ ...prev, status: "completed" }));
    setCurrentWorkingRequest((prev) => ({ ...prev, status: "completed" }));

    showDialog("Hoàn tất", "Đã hoàn thành sửa chữa.");

    setTimeout(() => {
      onNextStep();
    }, 1200);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Bảng chọn yêu cầu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Chọn yêu cầu bảo hành để sửa chữa</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã yêu cầu</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Phụ tùng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày nhận</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableRequests.map((request) => (
                <TableRow
                  key={request.id}
                  className={`cursor-pointer transition-all hover:bg-muted/50 ${
                    currentWorkingRequest?.id === request.id
                      ? "bg-blue-50 border-blue-200"
                      : ""
                  }`}
                  onClick={() => handleSelectRequest(request.id)}
                >
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.vin}</TableCell>
                  <TableCell>{request.model}</TableCell>
                  <TableCell>{request.parts}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        request.status === "received"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : request.status === "in-progress"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                          : "bg-blue-100 text-blue-800 border-blue-300"
                      }
                    >
                      {request.status === "received" && "📦 Đã nhận"}
                      {request.status === "in-progress" && "🔧 Đang sửa"}
                      {request.status === "completed" && "✅ Hoàn tất"}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.receivedDate}</TableCell>
                  <TableCell>
                    <Button
                      variant={
                        currentWorkingRequest?.id === request.id
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRequest(request.id);
                      }}
                    >
                      {currentWorkingRequest?.id === request.id
                        ? "Đã chọn"
                        : "Chọn"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Chi tiết yêu cầu */}
      {currentWorkingRequest && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết yêu cầu đang thực hiện</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Mã yêu cầu</Label>
                  <p className="font-medium">{currentWorkingRequest.id}</p>
                </div>
                <div>
                  <Label>VIN</Label>
                  <p className="font-medium">{currentWorkingRequest.vin}</p>
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <Badge
                    className={
                      workStatus.status === "received"
                        ? "bg-green-100 text-green-800"
                        : workStatus.status === "in-progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {workStatus.status === "received" && "📦 Sẵn sàng"}
                    {workStatus.status === "in-progress" && "🔧 Đang sửa"}
                    {workStatus.status === "completed" && "✅ Hoàn tất"}
                  </Badge>
                </div>
                <div>
                  <Label>Phụ tùng</Label>
                  <p className="font-medium">{currentWorkingRequest.parts}</p>
                </div>
                <div>
                  <Label>Thời gian bắt đầu</Label>
                  <Input
                    type="datetime-local"
                    value={workStatus.startTime}
                    onChange={(e) =>
                      setWorkStatus((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    disabled={workStatus.status === "received"}
                  />
                </div>
                <div>
                  <Label>Dự kiến hoàn thành</Label>
                  <Input
                    type="datetime-local"
                    value={workStatus.expectedCompletion}
                    onChange={(e) =>
                      setWorkStatus((prev) => ({
                        ...prev,
                        expectedCompletion: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                {workStatus.status === "received" && (
                  <Button onClick={handleStartWork}>
                    <Clock className="w-4 h-4 mr-2" />
                    Bắt đầu thực hiện
                  </Button>
                )}
                {workStatus.status === "in-progress" && (
                  <Button
                    onClick={handleCompleteWork}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Hoàn thành sửa chữa
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thông tin phụ tùng */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>🧰 Phụ tùng & thông số</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Mã phụ tùng cũ</Label>
                  <Input
                    value={partInfo.oldPartCode}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Số seri phụ tùng mới *</Label>
                  <Input
                    placeholder="Nhập số seri phụ tùng mới..."
                    value={partInfo.newPartSerial}
                    onChange={(e) =>
                      setPartInfo((prev) => ({
                        ...prev,
                        newPartSerial: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Ghi chú kỹ thuật</Label>
                <Textarea
                  placeholder="Nhập ghi chú về quá trình thay thế phụ tùng..."
                  value={partInfo.notes}
                  onChange={(e) =>
                    setPartInfo((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleUpdatePartInfo} variant="outline">
                  Cập nhật thông tin
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Thông tin phụ tùng sẽ được gắn với hồ
                  sơ xe và đồng bộ với hệ thống quản lý.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Nút hành động */}
      {currentWorkingRequest && workStatus.status === "completed" && (
        <div className="flex justify-end">
          <Button onClick={onNextStep} size="lg">
            Tiến tới bước tiếp theo
          </Button>
        </div>
      )}

      {/* Dialog thông báo */}
      <Dialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ ...dialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.title}</DialogTitle>
            <DialogDescription>{dialog.message}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setDialog({ ...dialog, open: false })}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
