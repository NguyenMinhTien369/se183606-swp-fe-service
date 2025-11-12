import { useState, useEffect } from 'react';
import { FaBoxOpen, FaPlus, FaEdit, FaTrash, FaSearch, FaCar, FaCog } from 'react-icons/fa';
import { vehicleAPI, partAPI } from '@/utility';
import type { Vehicle, Part, VehicleFormData, PartFormData, TabType, ModalMode } from './types';
import ConfirmModal from './ConfirmModal';
import styles from './ProductManagement.module.css';

const ProductManagement = () => {
    const [activeTab, setActiveTab] = useState<TabType>('vehicles');
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [parts, setParts] = useState<Part[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('add');
    const [selectedItem, setSelectedItem] = useState<Vehicle | Part | null>(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const [vehicleForm, setVehicleForm] = useState<VehicleFormData>({
        vin: '',
        customerID: 1,
        modelID: 1,
        licensePlate: '',
        batteryCapacity: 0,
        image: '',
        registrationDate: new Date().toISOString().split('T')[0],
    });

    const [partForm, setPartForm] = useState<PartFormData>({
        partSerialNumber: '',
        partTypeID: 1,
        productionDate: '',
        warrantyPeriod: ''
    });

    useEffect(() => {
        if (activeTab === 'vehicles') {
            fetchVehicles();
        } else {
            fetchParts();
        }
    }, [activeTab]);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const response = await vehicleAPI.getAllVehicles();

            const mappedVehicles = (response.data.result || []).map((vehicle: any) => ({
                vin: vehicle.vin,
                serialNumber: vehicle.licensePlate || 'N/A', // Dùng biển số xe làm serial
                productionDate: vehicle.productionYear ? `${vehicle.productionYear}-01-01` : 'N/A', // Convert year to date
                productModelID: 0, // Không có trong response
                productModelName: vehicle.modelName || 'N/A',
                customerID: 0, // Không có trong response
                customerName: vehicle.customerName || 'N/A',
                notes: vehicle.internalNotes || ''
            }));

            setVehicles(mappedVehicles);
        } catch (error) {
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchParts = async () => {
        try {
            setLoading(true);
            const response = await partAPI.searchPartsBySerialNumber('');

            const mappedParts = (response.data.result || []).map((part: any) => ({
                serialNumber: part.partSerialNumber,
                partName: part.partTypeName || 'N/A',
                category: part.partTypeName || 'N/A',
                manufactureDate: part.productionDate,
                warrantyPeriodMonths: part.warrantyPeriod || 0,
                warrantyExpiryDate: part.warrantyPeriod || '',
            }));

            setParts(mappedParts);
        } catch (error: any) {
            setParts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVehicle = () => {
        setModalMode('add');
        setVehicleForm({
            vin: '',
            customerID: 1,
            modelID: 1,
            licensePlate: '',
            batteryCapacity: 0,
            image: '',
            registrationDate: new Date().toISOString().split('T')[0],
        });
        setShowModal(true);
    };

    const handleEditVehicle = (vehicle: Vehicle) => {
        setModalMode('edit');
        setSelectedItem(vehicle);
        setVehicleForm({
            vin: vehicle.vin,
            customerID: vehicle.customerID,
            modelID: vehicle.productModelID || 1,
            licensePlate: vehicle.serialNumber || '',
            batteryCapacity: 0, // Not available in response
            image: '',
            registrationDate: vehicle.productionDate || new Date().toISOString().split('T')[0],
        });
        setShowModal(true);
    };

    const handleDeleteVehicle = (vehicle: Vehicle) => {
        setSelectedItem(vehicle);
        setShowConfirmDelete(true);
    };

    const handleAddPart = () => {
        setModalMode('add');
        setPartForm({
            partSerialNumber: '',
            partTypeID: 1,
            productionDate: '',
            warrantyPeriod: ''
        });
        setShowModal(true);
    };

    const handleEditPart = (part: Part) => {
        setModalMode('edit');
        setSelectedItem(part);
        setPartForm({
            partSerialNumber: part.serialNumber,
            partTypeID: 1,
            productionDate: part.manufactureDate || '',
            warrantyPeriod: part.warrantyExpiryDate || '',
        });
        setShowModal(true);
    };

    const handleDeletePart = (part: Part) => {
        setSelectedItem(part);
        setShowConfirmDelete(true);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            if (activeTab === 'vehicles') {
                // Prepare vehicle data - only include non-empty fields
                const vehicleData: any = {
                    vin: vehicleForm.vin.trim(),
                    modelID: vehicleForm.modelID,
                    batteryCapacity: vehicleForm.batteryCapacity,
                    registrationDate: vehicleForm.registrationDate
                };

                // Add optional fields only if they have values
                if (vehicleForm.customerID) {
                    vehicleData.customerID = vehicleForm.customerID;
                }
                if (vehicleForm.licensePlate?.trim()) {
                    vehicleData.licensePlate = vehicleForm.licensePlate.trim();
                }
                if (vehicleForm.image?.trim()) {
                    vehicleData.image = vehicleForm.image.trim();
                }

                if (modalMode === 'add') {
                    await vehicleAPI.registerVehicle(vehicleData);
                    alert('✅ Thêm xe thành công!');
                } else if (modalMode === 'edit' && selectedItem) {
                    const vehicle = selectedItem as Vehicle;
                    await vehicleAPI.updateVehicle(vehicle.vin, vehicleData);
                    alert('✅ Cập nhật xe thành công!');
                }
                fetchVehicles();
            } else {
                const partData = {
                    partSerialNumber: partForm.partSerialNumber,
                    partTypeID: partForm.partTypeID,
                    productionDate: partForm.productionDate,
                    warrantyPeriod: partForm.warrantyPeriod
                };

                if (modalMode === 'add') {
                    await partAPI.createPart(partData);
                    alert('Thêm linh kiện thành công!');
                } else if (modalMode === 'edit' && selectedItem) {
                    const part = selectedItem as Part;
                    await partAPI.updatePart(part.serialNumber, partData);
                    alert('Cập nhật linh kiện thành công!');
                }
                fetchParts();
            }

            setShowModal(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể thực hiện!';
            alert(`❌ Lỗi: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedItem) return;

        try {
            setLoading(true);

            if (activeTab === 'vehicles') {
                const vehicle = selectedItem as Vehicle;
                await vehicleAPI.deleteVehicle(vehicle.vin);
                alert('Xóa xe thành công!');
                fetchVehicles();
            } else {
                const part = selectedItem as Part;
                await partAPI.deletePart(part.serialNumber);
                alert('Xóa linh kiện thành công!');
                fetchParts();
            }

            setShowConfirmDelete(false);
        } catch (error: any) {
            alert(`❌ Lỗi: ${error.response?.data?.message || 'Không thể xóa!'}`);
        } finally {
            setLoading(false);
        }
    };

    const filteredVehicles = vehicles.filter((vehicle) => {
        const search = searchTerm.toLowerCase();
        return (
            vehicle.vin.toLowerCase().includes(search) ||
            vehicle.serialNumber.toLowerCase().includes(search) ||
            vehicle.productModelName?.toLowerCase().includes(search) ||
            vehicle.customerName?.toLowerCase().includes(search)
        );
    });

    const filteredParts = parts.filter(part => {
        const search = searchTerm.toLowerCase();
        return (
            part.serialNumber?.toLowerCase().includes(search) ||
            part.partName?.toLowerCase().includes(search)
        );
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        <FaBoxOpen /> Quản lý Sản phẩm
                    </h1>
                    <p className={styles.subtitle}>Quản lý xe và linh kiện trong hệ thống</p>
                </div>
                <button
                    onClick={activeTab === 'vehicles' ? handleAddVehicle : handleAddPart}
                    className={styles.addButton}
                >
                    <FaPlus /> Thêm {activeTab === 'vehicles' ? 'Xe' : 'Linh kiện'}
                </button>
            </div>

            <div className={styles.tabs}>
                <button
                    onClick={() => setActiveTab('vehicles')}
                    className={`${styles.tab} ${activeTab === 'vehicles' ? styles.tabActive : ''}`}
                >
                    <FaCar /> Xe
                </button>
                <button
                    onClick={() => setActiveTab('parts')}
                    className={`${styles.tab} ${activeTab === 'parts' ? styles.tabActive : ''}`}
                >
                    <FaCog /> Linh kiện
                </button>
            </div>

            <div className={styles.searchBar}>
                <FaSearch className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder={`Tìm ${activeTab === 'vehicles' ? 'xe theo VIN, Serial, Model' : 'linh kiện theo serial, tên'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {loading ? (
                <div className={styles.loading}>Đang tải...</div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                {activeTab === 'vehicles' ? (
                                    <>
                                        <th>VIN</th>
                                        <th>Biển số xe</th>
                                        <th>Model</th>
                                        <th>Khách hàng</th>
                                        <th>Năm SX</th>
                                        <th>Ghi chú</th>
                                        <th>Thao tác</th>
                                    </>
                                ) : (
                                    <>
                                        <th>Serial Number</th>
                                        <th>Tên linh kiện</th>
                                        <th>Danh mục</th>
                                        <th>Ngày sản xuất</th>
                                        <th>Bảo hành (tháng)</th>
                                        <th>Thao tác</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === 'vehicles' ? (
                                filteredVehicles.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={styles.noData}>
                                            Không có dữ liệu xe
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVehicles.map((vehicle) => (
                                        <tr key={vehicle.vin}>
                                            <td>{vehicle.vin}</td>
                                            <td>{vehicle.serialNumber}</td>
                                            <td>{vehicle.productModelName}</td>
                                            <td>{vehicle.customerName}</td>
                                            <td>
                                                {vehicle.productionDate && vehicle.productionDate !== 'N/A'
                                                    ? vehicle.productionDate.split('-')[0]
                                                    : 'N/A'}
                                            </td>
                                            <td>{vehicle.notes || '-'}</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button
                                                        onClick={() => handleEditVehicle(vehicle)}
                                                        className={styles.editButton}
                                                        title="Sửa"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteVehicle(vehicle)}
                                                        className={styles.deleteButton}
                                                        title="Xóa"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : filteredParts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className={styles.noData}>
                                        Không có dữ liệu linh kiện
                                    </td>
                                </tr>
                            ) : (
                                filteredParts.map((part) => (
                                    <tr key={part.serialNumber}>
                                        <td>{part.serialNumber}</td>
                                        <td>{part.partName}</td>
                                        <td>{part.category}</td>
                                        <td>
                                            {part.manufactureDate
                                                ? new Date(part.manufactureDate).toLocaleDateString('vi-VN')
                                                : 'N/A'}
                                        </td>
                                        <td>{part.warrantyPeriodMonths}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    onClick={() => handleEditPart(part)}
                                                    className={styles.editButton}
                                                    title="Sửa"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePart(part)}
                                                    className={styles.deleteButton}
                                                    title="Xóa"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>
                                {modalMode === 'add' ? 'Thêm' : 'Sửa'}{' '}
                                {activeTab === 'vehicles' ? 'Xe' : 'Linh kiện'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className={styles.closeButton}>
                                ×
                            </button>
                        </div>

                        <div className={styles.form}>
                            {activeTab === 'vehicles' ? (
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>VIN *</label>
                                        <input
                                            type="text"
                                            value={vehicleForm.vin}
                                            onChange={(e) => setVehicleForm({ ...vehicleForm, vin: e.target.value })}
                                            disabled={modalMode === 'edit'}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Biển số xe *</label>
                                        <input
                                            type="text"
                                            value={vehicleForm.licensePlate}
                                            onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value })}
                                            placeholder=""
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Model ID *</label>
                                        <input
                                            type="number"
                                            value={vehicleForm.modelID}
                                            onChange={(e) => setVehicleForm({ ...vehicleForm, modelID: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Customer ID *</label>
                                        <input
                                            type="number"
                                            value={vehicleForm.customerID}
                                            onChange={(e) => setVehicleForm({ ...vehicleForm, customerID: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Dung lượng pin (kWh) *</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={vehicleForm.batteryCapacity}
                                            onChange={(e) => setVehicleForm({ ...vehicleForm, batteryCapacity: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Ngày đăng ký *</label>
                                        <input
                                            type="date"
                                            value={vehicleForm.registrationDate}
                                            onChange={(e) => setVehicleForm({ ...vehicleForm, registrationDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Serial Number *</label>
                                        <input
                                            type="text"
                                            value={partForm.partSerialNumber}
                                            onChange={(e) => setPartForm({ ...partForm, partSerialNumber: e.target.value })}
                                            disabled={modalMode === 'edit'}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Part Type ID *</label>
                                        <input
                                            type="number"
                                            value={partForm.partTypeID}
                                            onChange={(e) => setPartForm({ ...partForm, partTypeID: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Ngày sản xuất *</label>
                                        <input
                                            type="date"
                                            value={partForm.productionDate}
                                            onChange={(e) => setPartForm({ ...partForm, productionDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Ngày hết hạn bảo hành *</label>
                                        <input
                                            type="date"
                                            value={partForm.warrantyPeriod}
                                            onChange={(e) => setPartForm({ ...partForm, warrantyPeriod: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button onClick={() => setShowModal(false)} className={styles.cancelButton}>
                                Hủy
                            </button>
                            <button onClick={handleSubmit} className={styles.saveButton} disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Lưu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={showConfirmDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa ${activeTab === 'vehicles'
                    ? `xe ${(selectedItem as Vehicle)?.vin}`
                    : `linh kiện ${(selectedItem as Part)?.serialNumber}`
                    }?`}
                onConfirm={handleConfirmDelete}
                onClose={() => setShowConfirmDelete(false)}
            />
        </div>
    );
};

export default ProductManagement;
