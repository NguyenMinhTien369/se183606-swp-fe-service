import { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { X, CheckCircle, Loader2, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CustomerRequest, UnassignedVehicle } from "../types";
import { useCreateCustomer } from "@/hooks/ManageCustomersHooks/Create/useCreateCustomer";
import { useSearchUnassignedVin } from "@/hooks/ManageCustomersHooks/Create/useSearchUnassignedVin";
import SuccessAlert from "./SuccessAlert";
import { useGetVehicleDetails } from "@/hooks/ManageCustomersHooks/Create/useGetUnassignedVeByVin";
import { NavLink } from "react-router";
import ROUTERS_PATH from "@/constants/routers";
import { ArrowLeft } from "lucide-react";

// CHỈ VALIDATE THÔNG TIN KHÁCH HÀNG
const customerValidationSchema = Yup.object({
  fullName: Yup.string()
    .min(1, "Họ tên phải có ít nhất 1 ký tự")
    .max(50, "Họ tên không được quá 50 ký tự")
    .required("Họ tên không được để trống"),
  phone: Yup.string()
    .matches(/^[0-9]{10,11}$/, "Số điện thoại phải là 10 hoặc 11 chữ số")
    .required("Số điện thoại không được để trống"),
  email: Yup.string()
    .email("Email không hợp lệ")
    .required("Email không được để trống"),
  cmnd: Yup.string().required("CMND/CCCD không được để trống"),
  address: Yup.string().required("Địa chỉ không được để trống"),
  vin: Yup.string().required("VIN không được để trống"),
});

export default function VehicleRegistrationForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedVehicle, setSelectedVehicle] =
    useState<UnassignedVehicle | null>(null);
  const vinInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // SỬ DỤNG CUSTOM HOOKS
  const { createCustomer, loading, error, success, resetState } =
    useCreateCustomer();
  const {
    vinSuggestions,
    loading: loadingVin,
    error: vinError,
    searchVin,
    clearSuggestions,
  } = useSearchUnassignedVin();

  const {
    vehicleDetails, // <-- Biến này sẽ chứa thông tin xe chi tiết đã được load
    loading: loadingVehicleDetails,
    error: vehicleDetailsError,
    getVehicleDetails, // <-- Hàm dùng để kích hoạt việc tải dữ liệu
    clearVehicleDetails,
  } = useGetVehicleDetails(); // Gọi hook không tham số

  // Formik cho Customer - CÓ VALIDATION
  const customerFormik = useFormik({
    initialValues: {
      fullName: "",
      phone: "",
      email: "",
      cmnd: "",
      address: "",
      vin: "",
    },
    validationSchema: customerValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: () => { },
  });

  // XỬ LÝ KHI SUCCESS THAY ĐỔI
  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);

  // HIỂN THỊ ERROR TỪ HOOK
  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  // HIỂN THỊ ERROR TỪ VIN SEARCH
  useEffect(() => {
    if (vinError) {
      alert(vinError);
    }
  }, [vinError]);

  // Debounce search VIN
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const vinValue = customerFormik.values.vin.trim();
      if (vinValue.length >= 3) {
        searchVin(vinValue);
      } else {
        clearSuggestions();
        setShowSuggestions(false);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [customerFormik.values.vin, searchVin, clearSuggestions]);

  // Show suggestions when data is available
  useEffect(() => {
    if (vinSuggestions.length > 0) {
      console.log("Dữ liệu API trả về:", vinSuggestions[0]);
      setShowSuggestions(true);
    }
  }, [vinSuggestions]);

  // Close suggestions when click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        vinInputRef.current &&
        !vinInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleVinSelect = async (vin: string) => {
    customerFormik.setFieldValue("vin", vin);

    setShowSuggestions(false);

    // GỌI HÀM MỚI để tải chi tiết xe (tự động cập nhật vehicleDetails)
    await getVehicleDetails(vin);
  };

  const handleSubmit = async () => {
    // CHỈ VALIDATE THÔNG TIN KHÁCH HÀNG
    const customerErrors = await customerFormik.validateForm();

    customerFormik.setTouched({
      fullName: true,
      phone: true,
      email: true,
      cmnd: true,
      address: true,
      vin: true,
    });

    // Prepare data
    const customerData: CustomerRequest = {
      fullName: customerFormik.values.fullName,
      phone: customerFormik.values.phone,
      email: customerFormik.values.email,
      cmnd: customerFormik.values.cmnd,
      address: customerFormik.values.address,
      vin: customerFormik.values.vin,
    };

    // GỌI CUSTOM HOOK ĐỂ TẠO CUSTOMER
    try {
      await createCustomer(customerData);
    } catch (err) {
      console.error("Error during customer creation:", err);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    customerFormik.resetForm();
    setSelectedVehicle(null);
    clearSuggestions();
    clearVehicleDetails();
    resetState(); // Reset state của hook createCustomer
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 rounded-2xl to-indigo-100 p-4 md:p-6 lg:p-8">
      <SuccessAlert open={showSuccess} onConfirm={handleCloseSuccess} />

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <NavLink
              to={ROUTERS_PATH.MANAGE_CUSTOMER}
              title="Quay về danh sách"
            >
              <ArrowLeft className="h-4 w-4" />
            </NavLink>
          </Button>

          <h1 className="text-3xl font-bold text-gray-800">
            Đăng Ký Khách Hàng
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Thông Tin Khách Hàng</CardTitle>
              <CardDescription>
                Điền đầy đủ thông tin khách hàng (bắt buộc)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Họ và Tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Nguyễn Văn A"
                  {...customerFormik.getFieldProps("fullName")}
                  className={
                    customerFormik.touched.fullName &&
                      customerFormik.errors.fullName
                      ? "border-red-500"
                      : ""
                  }
                />
                {customerFormik.touched.fullName &&
                  customerFormik.errors.fullName && (
                    <p className="text-red-500 text-sm">
                      {customerFormik.errors.fullName}
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Số Điện Thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0901234567"
                  {...customerFormik.getFieldProps("phone")}
                  className={
                    customerFormik.touched.phone && customerFormik.errors.phone
                      ? "border-red-500"
                      : ""
                  }
                />
                {customerFormik.touched.phone &&
                  customerFormik.errors.phone && (
                    <p className="text-red-500 text-sm">
                      {customerFormik.errors.phone}
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...customerFormik.getFieldProps("email")}
                  className={
                    customerFormik.touched.email && customerFormik.errors.email
                      ? "border-red-500"
                      : ""
                  }
                />
                {customerFormik.touched.email &&
                  customerFormik.errors.email && (
                    <p className="text-red-500 text-sm">
                      {customerFormik.errors.email}
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cmnd">
                  CMND/CCCD <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cmnd"
                  placeholder="001234567890"
                  {...customerFormik.getFieldProps("cmnd")}
                  className={
                    customerFormik.touched.cmnd && customerFormik.errors.cmnd
                      ? "border-red-500"
                      : ""
                  }
                />
                {customerFormik.touched.cmnd && customerFormik.errors.cmnd && (
                  <p className="text-red-500 text-sm">
                    {customerFormik.errors.cmnd}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Địa Chỉ <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
                  rows={3}
                  {...customerFormik.getFieldProps("address")}
                  className={
                    customerFormik.touched.address &&
                      customerFormik.errors.address
                      ? "border-red-500"
                      : ""
                  }
                />
                {customerFormik.touched.address &&
                  customerFormik.errors.address && (
                    <p className="text-red-500 text-sm">
                      {customerFormik.errors.address}
                    </p>
                  )}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="customerVin">
                  VIN (Mã số khung) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    ref={vinInputRef}
                    id="customerVin"
                    placeholder="Nhập VIN để tìm kiếm (ít nhất 3 ký tự)"
                    {...customerFormik.getFieldProps("vin")}
                    className={
                      customerFormik.touched.vin && customerFormik.errors.vin
                        ? "border-red-500"
                        : ""
                    }
                    onFocus={() => {
                      if (vinSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                  />
                  {loadingVin && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>

                {showSuggestions && vinSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {vinSuggestions?.map(
                      (
                        vinString,
                        index // "vinString" là chuỗi "VF10..."
                      ) => (
                        <div
                          key={index}
                          onClick={() => handleVinSelect(vinString)} // Truyền thẳng chuỗi VIN
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-mono font-semibold text-sm text-gray-900">
                                {vinString}
                              </p>
                              {/* Tạm thời bỏ dòng model/color vì API tìm kiếm chưa trả về thông tin này */}
                              <p className="text-xs text-gray-500 mt-1">
                                Click để chọn xe này
                              </p>
                            </div>
                            <Search className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {customerFormik.touched.vin && customerFormik.errors.vin && (
                  <p className="text-red-500 text-sm">
                    {customerFormik.errors.vin}
                  </p>
                )}

                {selectedVehicle && (
                  <p className="text-green-600 text-sm flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Đã chọn xe: {selectedVehicle.modelName}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Thông Tin Xe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {loadingVehicleDetails && (
                <p className="text-blue-500 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Đang tải thông
                  tin xe...
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="modelName">Tên Model</Label>
                <Input
                  id="modelName"
                  value={vehicleDetails?.modelName || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Màu Xe</Label>
                <Input
                  id="color"
                  type="text"
                  value={vehicleDetails?.color || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productionYear">Năm Sản Xuất</Label>
                <Input
                  id="productionYear"
                  type="number"
                  value={vehicleDetails?.productionYear || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licensePlate">Biển Số Xe</Label>
                <Input
                  id="licensePlate"
                  type="text"
                  disabled
                  value={vehicleDetails?.licensePlate || ""}
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batteryCapacity">Dung Lượng Pin (kWh)</Label>
                <Input
                  id="batteryCapacity"
                  type="number"
                  step="0.1"
                  value={vehicleDetails?.batteryCapacity || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationDate">Ngày Đăng Ký</Label>
                <Input
                  id="registrationDate"
                  type="text"
                  disabled
                  value={vehicleDetails?.registrationDate || ""}
                  className="bg-gray-50"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={handleCloseSuccess}
            className="gap-2"
            disabled={loading}
          >
            <X size={20} />
            Reset
          </Button>
          <Button onClick={handleSubmit} className="gap-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Đang đăng ký...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Đăng Ký
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
