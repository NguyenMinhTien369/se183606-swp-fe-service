"use client";

import { useState, useEffect } from "react";
import {
  ClipboardList,
  UserCog,
  TrendingUp,
  BarChart3,
  Archive,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { WarrantyRequestsList } from "../InternalManagement/features/WarrantyRequestsList";
import { AssignTechnician } from "../InternalManagement/features/AssignTechnician";
import { TrackProgress } from "../InternalManagement/features/TrackProgress";
import { PerformanceDashboard } from "../InternalManagement/features/PerformanceDashboard";
import { ArchiveReports } from "../InternalManagement/features/ArchiveReports";
import { warrantyClaimAPI } from "@/utility/index";
import type { WarrantyClaimResponse } from "../CreateWarranty/types/warranty";

export default function App() {
  const [activeTab, setActiveTab] = useState("requests");
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaimResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  // Hardcoded serviceCenterID - in production, get from auth context
  const SERVICE_CENTER_ID = 1;

  // Load warranty claims on mount
  useEffect(() => {
    loadWarrantyClaims();
  }, []);

  const loadWarrantyClaims = async () => {
    setIsLoading(true);
    try {
      const response = await warrantyClaimAPI.getClaimsByServiceCenter(
        SERVICE_CENTER_ID
      );
      setWarrantyClaims(response.data.result || []);
    } catch (error) {
      console.error("Error loading warranty claims:", error);
      alert("Không thể tải danh sách yêu cầu bảo hành");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Hệ thống quản lý bảo hành
              </h1>
              <p className="text-sm text-muted-foreground">
                Service Center Staff Portal
              </p>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">SC Staff</p>
                <p className="text-sm text-muted-foreground">Nguyễn Văn X</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-semibold text-primary-foreground shadow-sm">
                NX
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-6">
        <Card className="p-4 shadow-sm border border-border">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            {/* Tabs Header */}
            <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full bg-muted/40 rounded-xl p-1">
              <TabsTrigger
                value="requests"
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">Yêu cầu bảo hành</span>
              </TabsTrigger>
              <TabsTrigger
                value="assign"
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition"
              >
                <UserCog className="w-4 h-4" />
                <span className="hidden sm:inline">Phân công</span>
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Tiến độ</span>
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Hiệu suất</span>
              </TabsTrigger>
              <TabsTrigger
                value="archive"
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition"
              >
                <Archive className="w-4 h-4" />
                <span className="hidden sm:inline">Lưu trữ</span>
              </TabsTrigger>
            </TabsList>

            <Separator className="my-4" />

            {/* Tabs Content */}
            <TabsContent value="requests" className="space-y-4">
              <WarrantyRequestsList
                claims={warrantyClaims}
                isLoading={isLoading}
                onRefresh={loadWarrantyClaims}
              />
            </TabsContent>

            <TabsContent value="assign" className="space-y-4">
              <AssignTechnician
                claims={warrantyClaims}
                onAssignSuccess={loadWarrantyClaims}
              />
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <TrackProgress serviceCenterID={SERVICE_CENTER_ID} />
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <PerformanceDashboard serviceCenterID={SERVICE_CENTER_ID} />
            </TabsContent>

            <TabsContent value="archive" className="space-y-4">
              <ArchiveReports claims={warrantyClaims} />
            </TabsContent>
          </Tabs>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t py-3 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Service Center Warranty System
      </footer>
    </div>
  );
}
