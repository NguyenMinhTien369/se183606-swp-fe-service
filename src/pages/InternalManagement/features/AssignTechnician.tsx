"use client";

import { useState } from "react";
import {
  UserPlus,
  Plus,
  X,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockWarrantyRequests, mockTechnicians } from "../lib/mock-data";
import { getStatusLabel, getStatusColor } from "../lib/utils-warranty";

type AssistantTechnician = {
  id: string;
  name: string;
  specialty: string;
};

export function AssignTechnician() {
  const [requests, setRequests] = useState(
    mockWarrantyRequests.filter((r) => r.status === "pending")
  );
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainTechnician, setMainTechnician] = useState("");
  const [assistants, setAssistants] = useState<AssistantTechnician[]>([]);
  const [notes, setNotes] = useState("");
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: "success" | "error";
  }>({ open: false, title: "", description: "", type: "success" });

  const activeTechnicians = mockTechnicians.filter(
    (t) => t.status === "active"
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(requests.map((r) => r.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests([...selectedRequests, requestId]);
    } else {
      setSelectedRequests(selectedRequests.filter((id) => id !== requestId));
    }
  };

  const handleOpenAssignModal = () => {
    if (selectedRequests.length === 0) {
      setAlertDialog({
        open: true,
        title: "Chưa chọn yêu cầu",
        description: "Vui lòng chọn ít nhất một yêu cầu trước khi phân công.",
        type: "error",
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handleAddAssistant = () => {
    setAssistants([...assistants, { id: "", name: "", specialty: "" }]);
  };

  const handleRemoveAssistant = (index: number) => {
    setAssistants(assistants.filter((_, i) => i !== index));
  };

  const handleAssistantChange = (index: number, techId: string) => {
    const tech = activeTechnicians.find((t) => t.id === techId);
    if (tech) {
      const newAssistants = [...assistants];
      newAssistants[index] = {
        id: tech.id,
        name: tech.name,
        specialty: tech.specialty,
      };
      setAssistants(newAssistants);
    }
  };

  const handleConfirmAssign = () => {
    if (!mainTechnician) {
      setAlertDialog({
        open: true,
        title: "Thiếu kỹ thuật viên chính",
        description: "Vui lòng chọn kỹ thuật viên chính trước khi xác nhận.",
        type: "error",
      });
      return;
    }

    const tech = activeTechnicians.find((t) => t.id === mainTechnician);

    const updatedRequests = requests.map((req) => {
      if (selectedRequests.includes(req.id)) {
        return {
          ...req,
          status: "assigned" as const,
          assignedTo: tech?.name,
          assignedDate: new Date().toISOString().split("T")[0],
        };
      }
      return req;
    });

    setRequests(updatedRequests);

    setAlertDialog({
      open: true,
      title: "Phân công thành công",
      description: `Đã phân công ${tech?.name} xử lý ${selectedRequests.length} yêu cầu.`,
      type: "success",
    });

    setIsModalOpen(false);
    setSelectedRequests([]);
    setMainTechnician("");
    setAssistants([]);
    setNotes("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Phân công kỹ thuật viên
          </h2>
          <p className="text-sm text-muted-foreground">
            Gán kỹ thuật viên cho yêu cầu bảo hành
          </p>
        </div>
        <Button
          onClick={handleOpenAssignModal}
          disabled={selectedRequests.length === 0}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Phân công ({selectedRequests.length})
        </Button>
      </div>

      <Card className="border rounded-xl shadow-sm">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedRequests.length === requests.length &&
                      requests.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Mã yêu cầu</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead>Kỹ thuật viên tạo</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Mô tả sự cố</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRequests.includes(request.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRequest(request.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{request.vin}</TableCell>
                  <TableCell>{request.technicianName}</TableCell>
                  <TableCell>
                    {new Date(request.createdDate).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {request.issueDescription}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Assign Technician Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Phân công kỹ thuật viên
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Selected Requests */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Yêu cầu được chọn
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedRequests.map((id) => (
                  <Badge key={id} variant="secondary" className="rounded-md">
                    {id}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Main Technician */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Kỹ thuật viên chính *
              </label>
              <Select value={mainTechnician} onValueChange={setMainTechnician}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kỹ thuật viên..." />
                </SelectTrigger>
                <SelectContent>
                  {activeTechnicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name} — {tech.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assistant Technicians */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Kỹ thuật viên phụ</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddAssistant}
                >
                  <Plus className="w-4 h-4 mr-1" /> Thêm dòng
                </Button>
              </div>
              <div className="space-y-3">
                {assistants.map((assistant, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Select
                      value={assistant.id}
                      onValueChange={(value) =>
                        handleAssistantChange(index, value)
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Chọn kỹ thuật viên phụ..." />
                      </SelectTrigger>
                      <SelectContent>
                        {activeTechnicians
                          .filter((t) => t.id !== mainTechnician)
                          .map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                              {tech.name} — {tech.specialty}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAssistant(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment Date */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Ngày phân công
              </label>
              <div className="p-3 bg-muted rounded-lg text-sm">
                {new Date().toLocaleDateString("vi-VN")}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium">Ghi chú</label>
              <Textarea
                placeholder="Nhập ghi chú cho kỹ thuật viên..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button onClick={handleConfirmAssign}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog (replaces toast) */}
      <Dialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
      >
        <DialogContent className="sm:max-w-md rounded-xl text-center space-y-4">
          <div className="flex flex-col items-center justify-center space-y-3">
            {alertDialog.type === "success" ? (
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            ) : (
              <AlertCircle className="w-12 h-12 text-red-500" />
            )}
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {alertDialog.title}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {alertDialog.description}
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setAlertDialog({ ...alertDialog, open: false })}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
