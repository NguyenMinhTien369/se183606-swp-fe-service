"use client";

import { useState } from "react";
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
import { mockTechnicians } from "../lib/mock-data";
import { Info } from "lucide-react";

export function PerformanceDashboard() {
  const [timePeriod, setTimePeriod] = useState("month");
  const technicians = mockTechnicians;

  // Tính hiệu suất từng kỹ thuật viên
  const technicianData = technicians.map((tech) => ({
    ...tech,
    performance: Math.round(
      (tech.completedOnTime / tech.requestsHandled) * 100
    ),
  }));

  // Dữ liệu trạng thái cho biểu đồ tròn
  const statusData = [
    { name: "Hoàn thành đúng hạn", value: 45, color: "#22c55e" },
    { name: "Hoàn thành trễ", value: 15, color: "#f59e0b" },
    { name: "Đang xử lý", value: 20, color: "#3b82f6" },
    { name: "Bị từ chối", value: 8, color: "#ef4444" },
    { name: "Chờ phụ tùng", value: 12, color: "#a855f7" },
  ];

  // Dữ liệu so sánh hiệu suất cho biểu đồ cột
  const performanceData = technicianData.map((tech) => ({
    name: tech.name.split(" ").slice(-2).join(" "), // lấy 2 từ cuối
    "Số yêu cầu": tech.requestsHandled,
    "Hoàn thành": tech.completedOnTime,
    "Bị từ chối": tech.rejected,
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
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Số yêu cầu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Hoàn thành" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Bị từ chối" fill="#ef4444" radius={[4, 4, 0, 0]} />
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
                <TableHead className="text-center">Yêu cầu xử lý</TableHead>
                <TableHead className="text-center">Hoàn thành</TableHead>
                <TableHead className="text-center">Bị từ chối</TableHead>
                <TableHead className="text-center">Hiệu suất</TableHead>
                <TableHead className="text-center">⏱️ Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicianData.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell className="font-medium">{tech.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-md">
                      {tech.specialty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {tech.requestsHandled}
                  </TableCell>
                  <TableCell className="text-center text-green-600 font-semibold">
                    {tech.completedOnTime}
                  </TableCell>
                  <TableCell className="text-center text-red-600 font-semibold">
                    {tech.rejected}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={`px-3 py-1 rounded-md text-sm font-semibold ${
                        tech.performance >= 80
                          ? "bg-green-100 text-green-800"
                          : tech.performance >= 60
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tech.performance}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {tech.totalHours}h
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border rounded-xl shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Tổng yêu cầu</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold">51</span>
            <span className="text-green-600 text-sm mb-1 font-medium">
              +12%
            </span>
          </div>
        </Card>

        <Card className="p-5 border rounded-xl shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">
            Hoàn thành đúng hạn
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold">45</span>
            <span className="text-green-600 text-sm mb-1 font-medium">88%</span>
          </div>
        </Card>

        <Card className="p-5 border rounded-xl shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Bị từ chối</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold">6</span>
            <span className="text-red-600 text-sm mb-1 font-medium">12%</span>
          </div>
        </Card>

        <Card className="p-5 border rounded-xl shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Thời gian TB</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold">40.6h</span>
            <span className="text-blue-600 text-sm mb-1 font-medium">
              ~2 ngày
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
