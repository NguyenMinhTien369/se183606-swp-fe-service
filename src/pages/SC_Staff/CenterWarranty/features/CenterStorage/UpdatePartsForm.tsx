import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { inventoryAPI } from "@/utility";
import type { PartInventoryResponseCenter, PartInventoryRequestCenter } from "../../types/PartDistribution";
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

interface UpdatePartsFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    item: PartInventoryResponseCenter | null; // Item có thể null
    serviceCenterID: number;
}

const UpdatePartsForm: React.FC<UpdatePartsFormProps> = ({
    isOpen,
    onClose,
    onSuccess,
    item,
    serviceCenterID,
}) => {
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            partSerialNumber: item?.partSerialNumber || "",
            quantity: item?.quantity || 0,
            location: item?.location || "",
        },
        validationSchema: Yup.object({
            quantity: Yup.number().min(0, "Số lượng không hợp lệ").required(),
            location: Yup.string().required("Vui lòng nhập vị trí"),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            if (!item) return; // Bảo vệ nếu item null

            try {
                // Chỉ lấy các trường cần thiết cho Request
                const payload: PartInventoryRequestCenter = {
                    partSerialNumber: values.partSerialNumber,
                    quantity: Number(values.quantity),
                    location: values.location,
                    serviceCenterID: serviceCenterID
                };

                await inventoryAPI.updateInventoryCenter(values.partSerialNumber, payload);

                alert("✅ Cập nhật thành công!");
                onSuccess();
                onClose();
            } catch (error: any) {
                const msg = error.response?.data?.message || "Lỗi cập nhật";
                alert(`❌ ${msg}`);
            } finally {
                setSubmitting(false);
            }
        },
    });

    if (!item) return null; // Không render nếu chưa chọn item

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cập nhật phụ tùng</DialogTitle>
                </DialogHeader>

                <form onSubmit={formik.handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Mã Serial (Không thể sửa)</Label>
                        <Input value={formik.values.partSerialNumber} disabled className="bg-gray-100" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Tên phụ tùng</Label>
                        <Input value={item.partTypeName} disabled className="bg-gray-100" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity">Số lượng tồn kho</Label>
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
                        <Label htmlFor="location">Vị trí</Label>
                        <Input
                            id="location"
                            {...formik.getFieldProps("location")}
                        />
                        {formik.touched.location && formik.errors.location && (
                            <div className="text-red-500 text-sm">{formik.errors.location}</div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                        <Button type="submit" disabled={formik.isSubmitting}>
                            {formik.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lưu thay đổi
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdatePartsForm;