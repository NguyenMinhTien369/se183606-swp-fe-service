import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { inventoryAPI } from "@/utility";
import type { PartInventoryRequestCenter } from "../../types/PartDistribution";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AddPartsFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    serviceCenterID: number;
}

const AddPartsForm: React.FC<AddPartsFormProps> = ({
    isOpen,
    onClose,
    onSuccess,
    serviceCenterID,
}) => {
    const formik = useFormik({
        initialValues: {
            partSerialNumber: "",
            quantity: 1,
            location: "",
        },
        validationSchema: Yup.object({
            partSerialNumber: Yup.string()
                .required("Vui lòng nhập mã serial")
                .trim(),
            quantity: Yup.number()
                .min(0, "Số lượng không được âm")
                .required("Vui lòng nhập số lượng"),
            location: Yup.string().required("Vui lòng nhập vị trí kho"),
        }),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                // Ép kiểu chính xác theo PartInventoryRequestCenter
                const payload: PartInventoryRequestCenter = {
                    partSerialNumber: values.partSerialNumber,
                    quantity: Number(values.quantity),
                    location: values.location,
                    serviceCenterID: serviceCenterID,
                };

                await inventoryAPI.createInventoryCenter(payload);

                alert("✅ Thêm phụ tùng thành công!"); // Dùng alert cho đơn giản
                resetForm();
                onSuccess();
                onClose();
            } catch (error: any) {
                const msg = error.response?.data?.message || "Lỗi khi thêm phụ tùng";
                alert(`❌ ${msg}`);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nhập kho phụ tùng mới</DialogTitle>
                </DialogHeader>

                <form onSubmit={formik.handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="partSerialNumber">Mã Serial <span className="text-red-500">*</span></Label>
                        <Input
                            id="partSerialNumber"
                            {...formik.getFieldProps("partSerialNumber")}
                            placeholder="VD: SN-123456"
                        />
                        {formik.touched.partSerialNumber && formik.errors.partSerialNumber && (
                            <div className="text-red-500 text-sm">{formik.errors.partSerialNumber}</div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity">Số lượng <span className="text-red-500">*</span></Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="0"
                            {...formik.getFieldProps("quantity")}
                        />
                        {formik.touched.quantity && formik.errors.quantity && (
                            <div className="text-red-500 text-sm">{formik.errors.quantity}</div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Vị trí <span className="text-red-500">*</span></Label>
                        <Input
                            id="location"
                            {...formik.getFieldProps("location")}
                            placeholder="VD: Kệ A1"
                        />
                        {formik.touched.location && formik.errors.location && (
                            <div className="text-red-500 text-sm">{formik.errors.location}</div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                        <Button type="submit" disabled={formik.isSubmitting}>
                            {formik.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Thêm mới
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddPartsForm;