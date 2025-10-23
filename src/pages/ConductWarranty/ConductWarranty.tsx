"use client";

import React, { useState } from "react";
import { Settings, Wrench, CheckCircle } from "lucide-react";
import { ApprovedRequestsList } from "../ConductWarranty/features/ApprovedRequestsList";
import { RepairProgress } from "../ConductWarranty/features/RepairProgress";
import { CompletionHandover } from "../ConductWarranty/features/CompletionHandover";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const steps = [
  {
    id: 1,
    title: "Nhận phụ tùng bảo hành",
    icon: Settings,
    component: ApprovedRequestsList,
  },
  {
    id: 2,
    title: "Thực hiện sửa chữa",
    icon: Wrench,
    component: RepairProgress,
  },
  {
    id: 3,
    title: "Hoàn tất & bàn giao",
    icon: CheckCircle,
    component: CompletionHandover,
  },
];

export default function WarrantyWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const CurrentComponent =
    steps.find((step) => step.id === currentStep)?.component ?? null;

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setDialogOpen(true);
    }
  };

  const confirmNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Hệ thống quản lý bảo hành
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý quy trình bảo hành phụ tùng ô tô
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 rounded-md font-medium"
          >
            Kỹ thuật viên
          </Badge>
        </div>
      </header>

      {/* Navigation Steps */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 sticky top-[76px] z-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <Button
                key={step.id}
                variant={isActive ? "default" : "outline"}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : isCompleted
                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.id}</span>
                {isCompleted && (
                  <CheckCircle className="w-4 h-4 text-green-600 ml-1" />
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Card className="bg-white shadow-md rounded-xl border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              {steps.find((s) => s.id === currentStep)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {CurrentComponent && (
              <CurrentComponent
                selectedRequest={selectedRequest}
                onSelectRequest={setSelectedRequest}
                onNextStep={handleNextStep}
              />
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialog instead of Toaster */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận tiến trình</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn chuyển sang bước tiếp theo trong quy trình bảo
              hành không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={confirmNextStep}
              className="bg-blue-600 text-white"
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
