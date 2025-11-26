import type { VehicleInfo, WarrantyClaimResponse } from "../types/warranty";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import StatusBadge from "@/components/StatusBadge";

interface VehicleDetailsProps {
  vehicleInfo: VehicleInfo;
  warrantyHistory: WarrantyClaimResponse[];
  onCreateWarranty: () => void;
}

export default function VehicleDetail({
  vehicleInfo,
  warrantyHistory,
  onCreateWarranty,
}: VehicleDetailsProps) {
  return (
    <div className="space-y-6">
      {/* --- Thông tin xe --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{vehicleInfo.modelName}</CardTitle>
              <CardDescription>VIN: {vehicleInfo.vin}</CardDescription>
            </div>
            <Button onClick={onCreateWarranty}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo yêu cầu bảo hành
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Biển số xe</p>
              <p className="font-medium">{vehicleInfo.licensePlate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Năm sản xuất</p>
              <p className="font-medium">{vehicleInfo.productionYear}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Màu sắc</p>
              <p className="font-medium">{vehicleInfo.color}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dung lượng pin</p>
              <p className="font-medium">{vehicleInfo.batteryCapacity} kWh</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày đăng ký</p>
              <p className="font-medium">
                {new Date(vehicleInfo.registrationDate).toLocaleDateString(
                  "vi-VN"
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Khách hàng</p>
              <p className="font-medium">{vehicleInfo.customerName}</p>
            </div>
          </div>

          {/* Thông tin khách hàng chi tiết */}
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Thông tin khách hàng</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Số điện thoại</p>
                <p className="font-medium">{vehicleInfo.customerPhone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{vehicleInfo.customerEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CMND/CCCD</p>
                <p className="font-medium">{vehicleInfo.customerCmnd}</p>
              </div>
              <div className="col-span-2 md:col-span-3">
                <p className="text-muted-foreground">Địa chỉ</p>
                <p className="font-medium">{vehicleInfo.customerAddress}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- Danh sách phụ tùng --- */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phụ tùng trên xe</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="parts-list">
            <AccordionItem value="parts-list">
              <AccordionTrigger>
                Xem danh sách phụ tùng ({vehicleInfo.installedParts.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Loại phụ tùng</TableHead>
                        <TableHead>Ngày gắn</TableHead>
                        <TableHead>Hạn bảo hành</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicleInfo.installedParts.map((part, index) => (
                        <TableRow key={`${part.partSerialNumber}-${index}`}>
                          <TableCell className="font-mono">
                            {part.partSerialNumber}
                          </TableCell>
                          <TableCell>{part.partTypeName}</TableCell>

                          <TableCell>
                            {new Date(part.installationDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(part.warrantyPeriod).toLocaleDateString(
                              "vi-VN"
                            )}
                          </TableCell>

                          <TableCell>
                            <StatusBadge
                              status={
                                part.isUnderWarranty
                                  ? "Bảo hành"
                                  : "Hết bảo hành"
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* --- Lịch sử bảo hành --- */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu bảo hành</CardTitle>
        </CardHeader>
        <CardContent>
          {warrantyHistory.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              Chưa có lịch sử yêu cầu bảo hành cho xe này
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã Claim</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Service Center</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warrantyHistory.map((history) => (
                    <TableRow key={history.claimID}>
                      <TableCell className="font-mono">
                        #{history.claimID}
                      </TableCell>
                      <TableCell>
                        {new Date(history.creationDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {history.description}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={history.status} />
                      </TableCell>

                      <TableCell>{history.serviceCenterName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
