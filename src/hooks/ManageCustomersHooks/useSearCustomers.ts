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
  const [showNotFoundDialog, setShowNotFoundDialog] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredCustomers([]);
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError("");
      setShowNotFoundDialog(false);

      // Xác định loại search term
      const isPhone = /^0\d{9}$/.test(searchTerm);
      const isVIN =
        searchTerm.length >= 10 && /^[A-Z0-9]+$/.test(searchTerm.toUpperCase());

      const searchParams = isPhone
        ? { phone: searchTerm }
        : isVIN
        ? { vin: searchTerm }
        : { name: searchTerm };

      // Tìm customer
      const response = await customerAPI.searchCustomers(searchParams);
      const backendResults: CustomerResponse[] = response.data.result || [];

      if (backendResults.length > 0) {
        // ✅ Tìm thấy → Hiển thị
        const flattenedResults = backendResults.flatMap((customer) =>
          flattenCustomerData(customer)
        );
        setFilteredCustomers(flattenedResults);
      } else {
        setFilteredCustomers([]);
        setShowNotFoundDialog(true);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Có lỗi xảy ra khi tìm kiếm";
      setSearchError(errorMessage);
      setFilteredCustomers([]);
      setShowNotFoundDialog(true);
    } finally {
      setSearchLoading(false);
    }
  };

  const setInitialCustomers = (customers: Customer[]) => {
    setFilteredCustomers(customers);
  };

  const clearSearchTerm = () => {
    setSearchTerm("");
    setSearchError("");
    setShowNotFoundDialog(false);
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
    showNotFoundDialog,
    setShowNotFoundDialog,
  };
}
