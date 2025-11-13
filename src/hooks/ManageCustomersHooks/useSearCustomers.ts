import { useState } from "react";
import { customerAPI } from "@/utility";
import type {
  Customer,
  CustomerResponse,
} from "../../pages/SC_Staff/ManageCustomers/types";
import { flattenCustomerData } from "../../pages/SC_Staff/ManageCustomers/types";

export function useGetCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string>("");

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredCustomers([]);
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError("");

      // API mới hỗ trợ search theo name, phone, hoặc vin
      // Kiểm tra xem searchTerm có phải là số điện thoại không (bắt đầu bằng 0 và có 10 số)
      const isPhone = /^0\d{9}$/.test(searchTerm);

      // Tạo params dựa trên loại search term
      const searchParams = isPhone
        ? { phone: searchTerm }
        : searchTerm.length >= 10 &&
          /^[A-Z0-9]+$/.test(searchTerm.toUpperCase())
        ? { vin: searchTerm } // VIN thường là chữ in hoa + số, dài
        : { name: searchTerm }; // Mặc định search theo tên

      const response = await customerAPI.searchCustomers(searchParams);
      const backendResults: CustomerResponse[] = response.data.result || [];

      // Nếu không tìm thấy kết quả, thử search vehicle
      if (backendResults.length === 0) {
        try {
          const vehicleResponse = await customerAPI.searchVehicle({
            vin: searchTerm,
            serialNumber: searchTerm,
          });

          // Backend có thể trả về Vehicle hoặc Customer
          const vehicleResult = vehicleResponse.data.result;
          if (vehicleResult) {
            // TODO: Cần xử lý response từ searchVehicle API
            console.log("🔍 Vehicle search result:", vehicleResult);
          }
          setFilteredCustomers([]);
        } catch {
          setFilteredCustomers([]);
        }
      } else {
        // Flatten backend results
        const flattenedResults = backendResults.flatMap((customer) =>
          flattenCustomerData(customer)
        );
        setFilteredCustomers(flattenedResults);
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.message || "Lỗi khi tìm kiếm");
      console.error("Error searching:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const setInitialCustomers = (customers: Customer[]) => {
    setFilteredCustomers(customers);
  };

  // Function để clear filter (chỉ clear term và error, không reset data)
  const clearSearchTerm = () => {
    setSearchTerm("");
    setSearchError("");
  };

  return {
    searchTerm,
    filteredCustomers,
    searchLoading,
    searchError,
    handleSearch,
    setSearchTerm,
    setInitialCustomers,
    clearSearchTerm,
  };
}
