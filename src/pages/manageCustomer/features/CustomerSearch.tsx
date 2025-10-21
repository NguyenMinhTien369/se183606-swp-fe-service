import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";

export default function CustomerSearch() {
  const navigate = useNavigate();
  return (
    <div>
      <Button
        onClick={() => navigate(-1)} // 👈 quay lại trang trước
        variant="outline"
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
      >
        <ArrowLeft className="w-4 h-4" />
      </Button>
      <h1>Customer Search Feature Coming Soon!</h1>
    </div>
  );
}
