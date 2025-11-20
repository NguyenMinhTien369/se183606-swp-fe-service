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
import type { CustomerRequest, UnassignedVehicle } from "../types";
import { useCreateCustomer } from "@/hooks/ManageCustomersHooks/Create/useCreateCustomer";
import { useSearchUnassignedVin } from "@/hooks/ManageCustomersHooks/Create/useSearchUnassignedVin";
import { vehicleAPI } from "@/utility";
import SuccessAlert from "./SuccessAlert";
import { useGetVehicleDetails } from "@/hooks/ManageCustomersHooks/Create/useGetVehicleDetails";

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
    vehicleDetails,
    loading: loadingVehicleDetails,
    error: vehicleDetailsError,
  } = useGetVehicleDetails(selectedVehicle?.vin || "");

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

  // XỬ LÝ KHI SUCCESS THAY ĐỔI
  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Reset forms
        customerFormik.resetForm();
        setSelectedVehicle(null);
        clearSuggestions();
        resetState();
      }, 2000);
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

  const handleVinSelect = async (vehicle: UnassignedVehicle) => {
    try {
      customerFormik.setFieldValue("vin", vehicle.vin);
      setSelectedVehicle(vehicle);
      setShowSuggestions(false);

      // Fetch full vehicle details if needed
      const response = await vehicleAPI.getUnassignedVehicles(vehicle.vin);
      // Handle response if needed
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

  const handleReset = () => {
    customerFormik.resetForm();
    setSelectedVehicle(null);
    clearSuggestions();
    setShowSuggestions(false);
    resetState();
  };