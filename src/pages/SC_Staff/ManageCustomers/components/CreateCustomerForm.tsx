import { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, X, CheckCircle, Loader2, Search } from "lucide-react";
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

// Types
interface UnassignedVehicle {
  vin: string;
  customerName?: string;
  modelName: string;
  color?: string;
  productionYear?: number;
  licensePlate?: string;
  batteryCapacity?: number;
  image?: string;
  registrationDate?: string;
}

interface CustomerRequest {
  fullName: string;
  phone: string;
  email: string;
  cmnd: string;
  address: string;
  vin: string;
  modelName: string;
  color: string;
  productionYear: number;
  licensePlate?: string;
  batteryCapacity?: number;
  image?: string;
  registrationDate: string;
  internalNotes?: string;
}

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

// BỎ VALIDATION CHO XE - API sẽ xử lý

export default function VehicleRegistrationForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vinSuggestions, setVinSuggestions] = useState<UnassignedVehicle[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingVin, setLoadingVin] = useState(false);
  const [selectedVehicle, setSelectedVehicle] =
    useState<UnassignedVehicle | null>(null);
  const vinInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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
    onSubmit: () => {},
  });

  // Formik cho Vehicle - KHÔNG CÓ VALIDATION
  const vehicleFormik = useFormik({
    initialValues: {
      modelName: "",
      color: "",
      productionYear: "",
      licensePlate: "",
      batteryCapacity: "",
      image: "",
      registrationDate: "",
      internalNotes: "",
    },
    // Không có validationSchema
    onSubmit: () => {},
  });

  // Mock API calls (thay bằng API thực của bạn)
  const mockVehicleAPI = {
    searchUnassignedVehicles: async (keyword: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        data: {
          result: [
            {
              vin: "1HGBH41JXMN109186",
              modelName: "VinFast VF8",
              color: "Xanh Ocean",
              productionYear: 2024,
              batteryCapacity: 87.7,
            },
            {
              vin: "1HGBH41JXMN109187",
              modelName: "VinFast VF9",
              color: "Đỏ Ruby",
              productionYear: 2024,
              batteryCapacity: 123,
            },
          ].filter((v) => v.vin.toLowerCase().includes(keyword.toLowerCase())),
        },
      };
    },
    getUnassignedVehicles: async (vin: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        data: {
          result: {
            vin,
            modelName: "VinFast VF8 Plus",
            color: "Xanh Ocean",
            productionYear: 2024,
            batteryCapacity: 87.7,
            licensePlate: "",
            image: "https://example.com/vf8.jpg",
            internalNotes: "Xe mới, chưa đăng ký",
          },
        },
      };
    },
  };

  const mockCustomerAPI = {
    createCustomer: async (data: CustomerRequest) => {
      console.log("Creating customer:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { data: { success: true, message: "Đăng ký thành công!" } };
    },
  };

  // Debounce search VIN
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const vinValue = customerFormik.values.vin.trim();
      if (vinValue.length >= 3) {
        searchVIN(vinValue);
      } else {
        setVinSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [customerFormik.values.vin]);

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

  const searchVIN = async (keyword: string) => {
    try {
      setLoadingVin(true);
      const response = await mockVehicleAPI.searchUnassignedVehicles(keyword);
      const vehicles = response.data.result || [];
      setVinSuggestions(vehicles);
      setShowSuggestions(vehicles.length > 0);
    } catch (error) {
      console.error("Error searching VIN:", error);
      setVinSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingVin(false);
    }
  };

  const handleVinSelect = async (vehicle: UnassignedVehicle) => {
    try {
      customerFormik.setFieldValue("vin", vehicle.vin);
      setSelectedVehicle(vehicle);
      setShowSuggestions(false);

      const response = await mockVehicleAPI.getUnassignedVehicles(vehicle.vin);
      const vehicleDetails = response.data.result;

      // Auto-fill vehicle form - KHÔNG CẦN VALIDATE
      vehicleFormik.setValues({
        modelName: vehicleDetails.modelName || "",
        color: vehicleDetails.color || "",
        productionYear: String(vehicleDetails.productionYear) || "",
        licensePlate: vehicleDetails.licensePlate || "",
        batteryCapacity: String(vehicleDetails.batteryCapacity) || "",
        image: vehicleDetails.image || "",
        registrationDate: vehicleFormik.values.registrationDate,
        internalNotes: vehicleDetails.internalNotes || "",
      });
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      alert("Không thể tải thông tin xe. Vui lòng thử lại!");
    }
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

    // Check chỉ có lỗi của customer
    if (Object.keys(customerErrors).length > 0) {
      alert("Vui lòng điền đầy đủ thông tin khách hàng!");
      return;
    }

    // Check xem đã chọn VIN chưa
    if (!selectedVehicle) {
      alert("Vui lòng chọn xe từ danh sách VIN!");
      return;
    }

    // Prepare data - API sẽ validate phần xe
    const customerData: CustomerRequest = {
      fullName: customerFormik.values.fullName,
      phone: customerFormik.values.phone,
      email: customerFormik.values.email,
      cmnd: customerFormik.values.cmnd,
      address: customerFormik.values.address,
      vin: customerFormik.values.vin,
      modelName: vehicleFormik.values.modelName,
      color: vehicleFormik.values.color,
      productionYear: Number(vehicleFormik.values.productionYear),
      licensePlate: vehicleFormik.values.licensePlate,
      batteryCapacity: vehicleFormik.values.batteryCapacity
        ? Number(vehicleFormik.values.batteryCapacity)
        : undefined,
      image: vehicleFormik.values.image,
      registrationDate: vehicleFormik.values.registrationDate,
      internalNotes: vehicleFormik.values.internalNotes,
    };

    try {
      setIsSubmitting(true);
      const response = await mockCustomerAPI.createCustomer(customerData);
      console.log("Customer created successfully:", response.data);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Reset forms
        customerFormik.resetForm();
        vehicleFormik.resetForm();
        setSelectedVehicle(null);
      }, 2000);
    } catch (error: any) {
      console.error("Error creating customer:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi đăng ký khách hàng!";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 rounded-2xl to-indigo-100 p-4 md:p-6 lg:p-8">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle size={24} />
            <span className="font-semibold">Đăng ký thành công!</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Đăng Ký Khách Hàng
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Khách Hàng */}
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
                    {vinSuggestions.map((vehicle, index) => (
                      <div
                        key={index}
                        onClick={() => handleVinSelect(vehicle)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-mono font-semibold text-sm text-gray-900">
                              {vehicle.vin}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {vehicle.modelName} • {vehicle.color} •{" "}
                              {vehicle.productionYear}
                            </p>
                          </div>
                          <Search className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                        </div>
                      </div>
                    ))}
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

          {/* Card Thông Tin Xe */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Thông Tin Xe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="modelName">Tên Model</Label>
                <Input
                  id="modelName"
                  placeholder="VinFast VF8"
                  {...vehicleFormik.getFieldProps("modelName")}
                  disabled={!selectedVehicle}
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Màu Xe</Label>
                <Input
                  id="color"
                  placeholder="Xanh Ocean"
                  {...vehicleFormik.getFieldProps("color")}
                  disabled={!selectedVehicle}
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productionYear">Năm Sản Xuất</Label>
                <Input
                  id="productionYear"
                  type="number"
                  placeholder="2024"
                  {...vehicleFormik.getFieldProps("productionYear")}
                  disabled={!selectedVehicle}
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licensePlate">Biển Số Xe</Label>
                <Input
                  id="licensePlate"
                  placeholder="29A-12345"
                  {...vehicleFormik.getFieldProps("licensePlate")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batteryCapacity">Dung Lượng Pin (kWh)</Label>
                <Input
                  id="batteryCapacity"
                  type="number"
                  step="0.1"
                  placeholder="87.7"
                  {...vehicleFormik.getFieldProps("batteryCapacity")}
                  disabled={!selectedVehicle}
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationDate">Ngày Đăng Ký</Label>
                <Input
                  id="registrationDate"
                  type="date"
                  {...vehicleFormik.getFieldProps("registrationDate")}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => {
              customerFormik.resetForm();
              vehicleFormik.resetForm();
              setSelectedVehicle(null);
            }}
            className="gap-2"
            disabled={isSubmitting}
          >
            <X size={20} />
            Reset
          </Button>
          <Button
            onClick={handleSubmit}
            className="gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
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
