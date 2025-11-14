import { useState } from "react";
import { warrantyClaimAPI } from "@/utility";
import type { WarrantyClaimResponse } from "@/pages/SC_Staff/ManageTechnicians/types";

export function useSearchClaims() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClaims, setFilteredClaims] = useState<WarrantyClaimResponse[]>(
    []
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string>("");

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredClaims([]);
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError("");

      const response = await warrantyClaimAPI.getClaimById(Number(searchTerm));
      const claimData = response.data.result;

      setFilteredClaims([claimData]);
    } catch (err: any) {
      setSearchError(
        err.response?.data?.message ||
          `Không tìm thấy yêu cầu bảo hành với ID: ${searchTerm}`
      );
      console.error("Error searching claim:", err);
      setFilteredClaims([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Function để load dữ liệu ban đầu từ bên ngoài
  const setInitialClaims = (claims: WarrantyClaimResponse[]) => {
    setFilteredClaims(claims);
  };

  // Function để clear filter (chỉ clear term và error, không reset data)
  const clearSearchTerm = () => {
    setSearchTerm("");
    setSearchError("");
  };

  return {
    searchTerm,
    filteredClaims,
    searchLoading,
    searchError,
    handleSearch,
    setSearchTerm,
    setInitialClaims,
    clearSearchTerm,
  };
}
