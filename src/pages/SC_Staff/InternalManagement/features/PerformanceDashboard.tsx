"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Info } from "lucide-react";
import { claimAssignmentAPI } from "@/utility/index";
import type { TechnicianPerformance } from "../types";
import {
  getPerformanceColor,
  formatCompletionTime,
} from "../lib/utils-warranty";

interface PerformanceDashboardProps {
  serviceCenterID: number;
}

export function PerformanceDashboard({
  serviceCenterID,
}: PerformanceDashboardProps) {
  const [timePeriod, setTimePeriod] = useState("month");
  const [performanceData, setPerformanceData] = useState<
    TechnicianPerformance[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load performance data on mount
  useEffect(() => {
    loadPerformanceData();
  }, [serviceCenterID]);

  const loadPerformanceData = async () => {
    setIsLoading(true);
    try {
      const response = await claimAssignmentAPI.getTechnicianPerformance(
        serviceCenterID
      );
      setPerformanceData(response.data.result || []);
    } catch (error) {
      console.error("Error loading performance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate aggregated stats
  const totalAssigned = performanceData.reduce(
    (sum, t) => sum + t.totalAssignedClaims,
    0
  );
  const totalCompleted = performanceData.reduce(
    (sum, t) => sum + t.completedOnTime,
    0
  );
  const totalRejected = performanceData.reduce(
    (sum, t) => sum + t.manufacturerRejected,
    0
  );
  const avgCompletionTime =
    performanceData.length > 0
      ? Math.round(
        performanceData.reduce((sum, t) => sum + t.totalHours, 0) /
        performanceData.length
      )
      : 0;

  // Data for pie chart
  const statusData = [
    { name: "Hoàn thành đúng hạn", value: totalCompleted, color: "#22c55e" },
    { name: "Từ chối", value: totalRejected, color: "#ef4444" },
    {
      name: "Chưa hoàn thành",
      value: Math.max(0, totalAssigned - totalCompleted - totalRejected),
      color: "#f59e0b",
    },
  ];

  // Data for bar chart
  const chartData = performanceData.map((tech) => ({
    name: tech.fullName.split(" ").slice(-2).join(" "), // Get last 2 words
    "Tổng số": tech.totalAssignedClaims,
    "Hoàn thành": tech.completedOnTime,
    "Từ chối": tech.manufacturerRejected,
  }));

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Theo dõi hiệu suất kỹ thuật viên
          </h2>
          <p className="text-sm text-muted-foreground">
            Phân tích hiệu quả và năng suất xử lý bảo hành
          </p>
        </div>
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Tháng này</SelectItem>
            <SelectItem value="quarter">Quý này</SelectItem>
            <SelectItem value="year">Năm này</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Biểu đồ tổng quan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ tròn */}
        <Card className="p-6 border rounded-xl shadow-sm">
          <h3 className="text-lg font-medium mb-4">Phân bổ trạng thái</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-6 space-y-2">
            {statusData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-muted-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Biểu đồ cột */}
        <Card className="p-6 border rounded-xl shadow-sm">
          <h3 className="text-lg font-medium mb-4">
            So sánh hiệu suất kỹ thuật viên
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Tổng số" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Hoàn thành" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Đang xử lý" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bảng dữ liệu */}
      <Card className="border rounded-xl shadow-sm">
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Tên kỹ thuật viên</TableHead>
                <TableHead>Chuyên môn</TableHead>
                <TableHead className="text-center">Tổng phân công</TableHead>
                <TableHead className="text-center">
                  Hoàn thành đúng hạn
                </TableHead>
                <TableHead className="text-center">Bị từ chối</TableHead>
                <TableHead className="text-center">Tỷ lệ hoàn thành</TableHead>
                <TableHead className="text-center">⏱️ Tổng giờ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                  </TableCell>
                </TableRow>
              ) : performanceData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">
                      Chưa có dữ liệu hiệu suất
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                performanceData.map((tech) => {
                  const completionRate =
                    tech.totalAssignedClaims > 0
                      ? (tech.completedOnTime / tech.totalAssignedClaims) * 100
                      : 0;

                  return (
                    <TableRow key={tech.userID}>
                      <TableCell className="font-medium">
                        {tech.fullName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-md">
                          Kỹ thuật viên
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {tech.totalAssignedClaims}
                      </TableCell>
                      <TableCell className="text-center text-green-600 font-semibold">
                        {tech.completedOnTime}
                      </TableCell>
                      <TableCell className="text-center text-red-600 font-semibold">
                        {tech.manufacturerRejected}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`px-3 py-1 rounded-md text-sm font-semibold ${getPerformanceColor(
                            completionRate
                          )}`}
                        >
                          {completionRate.toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {formatCompletionTime(tech.totalHours)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border rounded-xl shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">
            Tổng phân công
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold">{totalAssigned}</span>
          </div>
        </Card>

        <Card className="p-5 border rounded-xl shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">
            Hoàn thành đúng hạn
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold">{totalCompleted}</span>
            <span className="text-green-600 text-sm mb-1 font-medium">
              {totalAssigned > 0
                ? Math.round((totalCompleted / totalAssigned) * 100)
                : 0}
              %
            </span>
          </div>
        </Card>

        <Card className="p-5 border rounded-xl shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Bị từ chối</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold">{totalRejected}</span>
            <span className="text-red-600 text-sm mb-1 font-medium">
              {totalAssigned > 0
                ? Math.round((totalRejected / totalAssigned) * 100)
                : 0}
              %
            </span>
          </div>
        </Card>

        <Card className="p-5 border rounded-xl shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">
            Tổng giờ trung bình
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold">{avgCompletionTime}</span>
            <span className="text-muted-foreground text-sm mb-1 font-medium">
              giờ
            </span>
          </div>
        </Card>
      </div>

      {/* Ghi chú */}
      <Card className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
        <div className="flex items-start gap-3 text-blue-800">
          <Info className="w-5 h-5 mt-0.5 text-blue-600" />
          <p className="text-sm leading-relaxed">
            <strong>Lưu ý:</strong> Hệ thống tự động tính hiệu suất dựa trên
            thời gian xử lý và số lượng yêu cầu. SC Staff không thể chỉnh sửa
            thủ công các chỉ số này.
          </p>
        </div>
      </Card>
    </div>
  );
}
