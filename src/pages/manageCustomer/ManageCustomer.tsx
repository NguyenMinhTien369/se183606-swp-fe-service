"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import type { Customer } from "./types/index";
import { Screen1CustomerSearch } from "@/pages/manageCustomer/features/CustomerSearch";
import { Screen2VehicleInfo } from "@/pages/manageCustomer/features/VehicleInfomation";
import { Screen21PartsManagement } from "@/pages/manageCustomer/features/PartsManagement";
import { Screen22ServiceHistory } from "@/pages/manageCustomer/features/ServiceHistory";

export default function App() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("info");
  const [showDialog, setShowDialog] = useState(false);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setActiveTab("info");
    setShowDialog(true);
  };

  const handleBackToSearch = () => {
    setSelectedCustomer(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedCustomer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSearch}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            )}
            <div>
              <h1 className="text-xl font-semibold">
                Hệ thống quản lý khách hàng & xe
              </h1>
              {selectedCustomer && (
                <p className="text-sm text-muted-foreground mt-1">
                  Đang xem hồ sơ:{" "}
                  <span className="font-medium text-foreground">
                    {selectedCustomer.name}
                  </span>{" "}
                  - {selectedCustomer.vin}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="py-8">
        {!selectedCustomer ? (
          <div className="max-w-5xl mx-auto px-4">
            <Screen1CustomerSearch onSelectCustomer={handleSelectCustomer} />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-card shadow-md rounded-2xl p-6 border space-y-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto bg-muted/40 p-1 rounded-xl">
                  <TabsTrigger
                    value="info"
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition"
                  >
                    🚗 Thông tin xe
                  </TabsTrigger>
                  <TabsTrigger
                    value="parts"
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition"
                  >
                    ⚙️ Quản lý phụ tùng
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition"
                  >
                    🧰 Lịch sử dịch vụ
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="pt-4">
                  <Screen2VehicleInfo customer={selectedCustomer} />
                </TabsContent>

                <TabsContent value="parts" className="pt-4">
                  <Screen21PartsManagement customer={selectedCustomer} />
                </TabsContent>

                <TabsContent value="history" className="pt-4">
                  <Screen22ServiceHistory customer={selectedCustomer} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>

      {/* Dialog thay thế Toaster */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Khách hàng đã được chọn</DialogTitle>
            <DialogDescription>
              Bạn đang xem thông tin của{" "}
              <span className="font-semibold text-foreground">
                {selectedCustomer?.name}
              </span>
              . Chọn tab để xem chi tiết.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
