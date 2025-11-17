import { customerAPI } from "@/utility";
import type { CustomerRequest } from "@/pages/SC_Staff/ManageCustomers/types";
import { useState } from "react";

export function useCreateCustomer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const createCustomer = async (customerData: CustomerRequest) => {
    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const response = await customerAPI.createCustomer(customerData);
      console.log(response.data.message);

      setSuccess(true);
      return response.data; // Trả về data để component xử lý
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Có lỗi xảy ra khi tạo khách hàng";
      setError(errorMessage);
      throw err; // Throw error để component có thể catch
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setError("");
    setSuccess(false);
  };

  return { createCustomer, loading, error, success, resetState };
}
