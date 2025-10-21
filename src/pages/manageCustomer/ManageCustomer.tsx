import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ManageCustomer() {
  return (
    <div className="font-semibold p-8 space-y-6 border rounded-lg shadow-sm bg-white">
      <h1 className="text-2xl font-bold text-gray-800">
        Tra Cứu Thông Tin Khách Hàng
      </h1>

      {/* Ô tìm kiếm cải tiến */}
      <form className="flex w-full max-w-md items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-2 shadow-sm hover:shadow-md transition-all">
        <Search className="h-5 w-5 text-gray-500 ml-1" />
        <Input
          type="text"
          placeholder="Nhập số VIN khách hàng..."
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 text-gray-700 placeholder:text-gray-400"
        />
        <Button
          type="submit"
          className="rounded-full ml-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          Tìm kiếm
        </Button>
      </form>

      {/* Bảng dữ liệu */}
      <Table className="min-w-full border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm">
        <TableCaption className="text-gray-500 py-3">
          Danh sách khách hàng gần đây.
        </TableCaption>

        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[100px] font-semibold text-gray-700 uppercase tracking-wider">
              Họ Tên
            </TableHead>
            <TableHead className="font-semibold text-gray-700 uppercase tracking-wider">
              Số Điện Thoại
            </TableHead>
            <TableHead className="font-semibold text-gray-700 uppercase tracking-wider">
              Địa Chỉ
            </TableHead>
            <TableHead className="text-right font-semibold text-gray-700 uppercase tracking-wider">
              Số VIN
            </TableHead>
            <TableHead className="text-right font-semibold text-gray-700 uppercase tracking-wider">
              Model
            </TableHead>
            <TableHead className="text-right font-semibold text-gray-700 uppercase tracking-wider">
              Năm SX
            </TableHead>
            <TableHead className="text-right font-semibold text-gray-700 uppercase tracking-wider">
              Chi Tiết
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow className="hover:bg-gray-50 transition-colors">
            <TableCell className="font-medium text-gray-800">
              Nguyễn Văn A
            </TableCell>
            <TableCell>0901234567</TableCell>
            <TableCell className="text-gray-600">Hà Nội</TableCell>
            <TableCell className="text-right font-semibold text-gray-800">
              VIN12345
            </TableCell>
            <TableCell className="text-right text-gray-600">CR-V</TableCell>
            <TableCell className="text-right text-gray-600">2022</TableCell>
            <TableCell className="text-right text-blue-600 hover:underline cursor-pointer">
              <Button
                type="submit"
                className="rounded-full ml-2 px-4 bg-blue-600 hover:bg-blue-800 text-white font-medium"
              >
                xem
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
