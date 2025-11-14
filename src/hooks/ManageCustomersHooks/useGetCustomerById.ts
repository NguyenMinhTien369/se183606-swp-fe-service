import { useEffect, useState } from "react";
import { customerAPI } from "@/utility";
import { useParams } from "react-router";
import type {
  CustomerResponse,
  VehicleResponse,
} from "@/pages/SC_Staff/ManageCustomers/types";

export function useGetCustomerById() {
  const { customerId } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchCustomerData = async () => {
    if (!customerId) {
      setError("Không tìm thấy ID khách hàng");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await customerAPI.getCustomerById(Number(customerId));

      const customerData: CustomerResponse = response.data.result;

      setCustomer(customerData);

      // Lấy vehicle đầu tiên (nếu có nhiều xe thì có thể thêm logic chọn)
      if (customerData.vehicles && customerData.vehicles.length > 0) {
        setVehicle(customerData.vehicles[0]);
        console.log("Vehicle Data:", customerData.vehicles[0]);
      } else {
        console.log("Customer has no vehicles");
      }
    } catch (err: any) {
      console.error("Error response:", err.response);
      setError(
        err.response?.data?.message || "Không thể tải thông tin khách hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  return { customerId, customer, vehicle, loading, error };
}
