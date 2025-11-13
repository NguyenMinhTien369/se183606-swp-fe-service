// hooks/useCustomers.ts
import { useState, useEffect } from "react";
import type {
  Customer,
  CustomerResponse,
} from "../../pages/SC_Staff/ManageCustomers/types";
import { flattenCustomerData } from "../../pages/SC_Staff/ManageCustomers/types";
import { customerAPI } from "@/utility";

export function useGetCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const loadAllCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await customerAPI.getCustomers();
      // Backend trả về CustomerResponse[] với nested vehicles
      const backendCustomers: CustomerResponse[] = response.data.result || [];

      // Flatten: 1 customer có nhiều vehicle → tạo nhiều rows
      const flattenedCustomers: Customer[] = backendCustomers.flatMap(
        (backendCustomer) => flattenCustomerData(backendCustomer)
      );

      setCustomers(flattenedCustomers);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Không thể tải danh sách khách hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCustomers();
  }, []);

  return { customers, loading, error, reload: loadAllCustomers };
}
