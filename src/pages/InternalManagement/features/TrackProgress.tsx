"use client";

import { useState } from "react";
import { Edit, Bell, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockWarrantyRequests } from "../lib/mock-data";
import { getStatusLabel, getStatusColor } from "../lib/utils-warranty";
import type { WarrantyRequest } from "../types/warranty";

export function TrackProgress() {
  const [requests, setRequests] = useState(
    mockWarrantyRequests.filter((r) =>
      ["assigned", "receiving_parts", "in_progress"].includes(r.status)
    )
  );

  const [selectedRequest, setSelectedRequest] =
    useState<WarrantyRequest | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
  }>({
    title: "",
    message: "",
    type: "success",
  });
  const [newNote, setNewNote] = useState("");

  const handleAddNote = (request: WarrantyRequest) => {
    setSelectedRequest(request);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = () => {
    if (!selectedRequest || !newNote.trim()) {
      setAlertMessage({
        title: "Thiếu thông tin",
        message: "Vui lòng nhập ghi chú trước khi lưu.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
      return;
    }

    const updatedRequests = requests.map((req) =>
      req.id === selectedRequest.id ? { ...req, notes: newNote } : req
    );

    setRequests(updatedRequests);

    setAlertMessage({
      title: "Thành công",
      message: `Đã thêm ghi chú cho yêu cầu ${selectedRequest.id}.`,
      type: "success",
    });
    setIsAlertDialogOpen(true);

    setIsNoteModalOpen(false);
    setNewNote("");
    setSelectedRequest(null);
  };

  const handleSendReminder = (request: WarrantyRequest) => {
    setAlertMessage({
      title: "Đã gửi nhắc nhở",
      message: `Nhắc nhở đã được gửi đến ${request.assignedTo} cho yêu cầu ${request.id}.`,
      type: "success",
    });
    setIsAlertDialogOpen(true);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Theo dõi tiến độ xử lý</h2>
        <p className="text-muted-foreground">
          Giúp SC Staff theo dõi tình trạng bảo hành và tiến độ thực hiện.
        </p>
      </div>

      {/* Bảng theo dõi tiến độ */}
      <Card className="shadow-sm border border-border/60">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã yêu cầu</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead>Kỹ thuật viên</TableHead>
                <TableHead>Ngày nhận</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>% hoàn thành</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.vin}</TableCell>
                  <TableCell>{request.assignedTo || "-"}</TableCell>
                  <TableCell>
                    {request.assignedDate
                      ? new Date(request.assignedDate).toLocaleDateString(
                          "vi-VN"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2 min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <span>{request.progress || 0}%</span>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Progress
                        value={request.progress || 0}
                        className="h-2 rounded-full"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {request.notes ? (
                      <span className="block text-sm">{request.notes}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddNote(request)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSendReminder(request)}
                      >
                        <Bell className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Ghi chú trạng thái */}
      <Card className="p-6 shadow-sm border border-border/60">
        <h4 className="font-semibold mb-4">Trạng thái hiển thị</h4>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-800">🟡</Badge>
            <span>Nhận phụ tùng</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-100 text-orange-800">🟠</Badge>
            <span>Đang thay thế</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">🟢</Badge>
            <span>Hoàn tất / Bàn giao xe</span>
          </div>
        </div>
      </Card>

      {/* Dialog: thêm ghi chú */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm ghi chú nội bộ</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Mã yêu cầu
                </label>
                <div className="p-3 bg-muted rounded-md font-medium">
                  {selectedRequest.id}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  VIN
                </label>
                <div className="p-3 bg-muted rounded-md font-medium">
                  {selectedRequest.vin}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Kỹ thuật viên
                </label>
                <div className="p-3 bg-muted rounded-md font-medium">
                  {selectedRequest.assignedTo}
                </div>
              </div>

              <div>
                <label className="text-sm mb-1 block font-medium">
                  Ghi chú *
                </label>
                <Textarea
                  placeholder="Nhập ghi chú nội bộ..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNoteModalOpen(false);
                setNewNote("");
                setSelectedRequest(null);
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveNote}>Lưu ghi chú</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: thông báo kết quả thao tác (thay cho toast) */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center gap-3 py-2">
            {alertMessage.type === "success" ? (
              <CheckCircle2 className="text-green-600 w-10 h-10" />
            ) : (
              <AlertTriangle className="text-red-600 w-10 h-10" />
            )}
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {alertMessage.title}
              </DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">{alertMessage.message}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAlertDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
