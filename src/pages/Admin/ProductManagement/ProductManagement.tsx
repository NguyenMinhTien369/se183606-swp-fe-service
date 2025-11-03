import { useState, useEffect } from 'react';
import { FaBoxOpen, FaPlus, FaEdit, FaTrash, FaSearch, FaCar, FaCog } from 'react-icons/fa';
import { productModelAPI, partAPI } from '@/utility';
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
        model: '',
        year: new Date().getFullYear(),
        manufacturerID: 0,
        purchaseDate: '',
        warrantyEndDate: '',
    });

    const [partForm, setPartForm] = useState<PartFormData>({
        partSerialNumber: '',
        partTypeID: 1,
        productionDate: '',
        warrantyPeriod: '',
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
            const response = await productModelAPI.getAllProductModels();
            // Map ProductModelResponse to Vehicle interface
            const mappedVehicles = (response.data.result || []).map((model: any) => ({
                vin: `MODEL-${model.modelID}`, // Temporary VIN for display
                model: model.modelName,
                year: model.productionYear,
                manufacturerID: 0,
                purchaseDate: '',
                warrantyEndDate: '',
                color: model.color,
                modelID: model.modelID,
            }));
            setVehicles(mappedVehicles);
        } catch (error) {
            console.error('Error fetching product models:', error);
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchParts = async () => {
        try {
            setLoading(true);
            // Note: Backend doesn't have a get all parts endpoint
            // You may need to implement searchPartsBySerialNumber with empty or wildcard query
            setParts([]);
        } catch (error) {
            console.error('Error fetching parts:', error);
            setParts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVehicle = () => {
        setModalMode('add');
        setVehicleForm({
            vin: '',
            model: '',
            year: new Date().getFullYear(),
            manufacturerID: 0,
            purchaseDate: '',
            warrantyEndDate: '',
        });
        setShowModal(true);
    };

    const handleEditVehicle = (vehicle: Vehicle) => {
        setModalMode('edit');
        setSelectedItem(vehicle);
        setVehicleForm({
            vin: vehicle.vin,
            model: vehicle.model || '',
            year: vehicle.year || new Date().getFullYear(),
            manufacturerID: vehicle.manufacturerID || 0,
            purchaseDate: vehicle.purchaseDate || '',
            warrantyEndDate: vehicle.warrantyEndDate || '',
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
            warrantyPeriod: '',
        });
        setShowModal(true);
    };

    const handleEditPart = (part: Part) => {
        setModalMode('edit');
        setSelectedItem(part);
        setPartForm({
            partSerialNumber: part.serialNumber,
            partTypeID: 1, // Default value, should be set from part data
            productionDate: part.manufactureDate || '',
            warrantyPeriod: part.manufactureDate || '', // Placeholder
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
                if (modalMode === 'add') {
                    await productModelAPI.createProductModel({
                        modelName: vehicleForm.model,
                        color: 'Default', // You may want to add a color field to the form
                        productionYear: vehicleForm.year,
                        warrantyPeriod: 36, // Default 36 months warranty
                    });
                    alert('✅ Thêm model xe thành công!');
                } else if (modalMode === 'edit' && selectedItem) {
                    alert('⚠️ Chức năng cập nhật model chưa được hỗ trợ từ backend!');
                }
                fetchVehicles();
            } else {
                if (modalMode === 'add') {
                    await partAPI.createPart(partForm);
                    alert('✅ Thêm linh kiện thành công!');
                } else if (modalMode === 'edit' && selectedItem) {
                    const part = selectedItem as Part;
                    await partAPI.updatePart(part.serialNumber, {
                        partTypeID: partForm.partTypeID,
                        productionDate: partForm.productionDate,
                        warrantyPeriod: partForm.warrantyPeriod,
                    });
                    alert('✅ Cập nhật linh kiện thành công!');
                }
                fetchParts();
            }

            setShowModal(false);
        } catch (error: any) {
            console.error('Error submitting form:', error);
            alert(`❌ Lỗi: ${error.response?.data?.message || 'Không thể thực hiện!'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedItem) return;

        try {
            setLoading(true);

            if (activeTab === 'vehicles') {
                alert('⚠️ Chức năng xóa model xe chưa được hỗ trợ từ backend!');
            } else {
                const part = selectedItem as Part;
                await partAPI.deletePart(part.serialNumber);
                alert('✅ Xóa linh kiện thành công!');
                fetchParts();
            }

            setShowConfirmDelete(false);
        } catch (error: any) {
            console.error('Error deleting item:', error);
            alert(`❌ Lỗi: ${error.response?.data?.message || 'Không thể xóa!'}`);
        } finally {
            setLoading(false);
        }
    };

    const filteredVehicles = vehicles.filter((v) => {
        const search = searchTerm.toLowerCase();
        return v.vin?.toLowerCase().includes(search) || v.model?.toLowerCase().includes(search);
    });

    const filteredParts = parts.filter((p) => {
        const search = searchTerm.toLowerCase();
        return (
            p.serialNumber?.toLowerCase().includes(search) ||
            p.partName?.toLowerCase().includes(search)
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
                    placeholder={`Tìm ${activeTab === 'vehicles' ? 'xe theo VIN, model' : 'linh kiện theo serial, tên'}...`}
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
                                        <th>Model</th>
                                        <th>Năm</th>
                                        <th>Ngày mua</th>
                                        <th>Hết bảo hành</th>
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
                                        <td colSpan={6} className={styles.noData}>
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVehicles.map((vehicle) => (
                                        <tr key={vehicle.vin}>
                                            <td>{vehicle.vin}</td>
                                            <td>{vehicle.model}</td>
                                            <td>{vehicle.year}</td>
                                            <td>
                                                {vehicle.purchaseDate
                                                    ? new Date(vehicle.purchaseDate).toLocaleDateString('vi-VN')
                                                    : 'N/A'}
                                            </td>
                                            <td>
                                                {vehicle.warrantyEndDate
                                                    ? new Date(vehicle.warrantyEndDate).toLocaleDateString('vi-VN')
                                                    : 'N/A'}
                                            </td>
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
                                        Không có dữ liệu
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
                                        <label>Model *</label>
                                        <input
                                            type="text"
                                            value={vehicleForm.model}
                                            onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Năm</label>
                                        <input
                                            type="number"
                                            value={vehicleForm.year}
                                            onChange={(e) =>
                                                setVehicleForm({ ...vehicleForm, year: parseInt(e.target.value) })
                                            }
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Manufacturer ID</label>
                                        <input
                                            type="number"
                                            value={vehicleForm.manufacturerID}
                                            onChange={(e) =>
                                                setVehicleForm({
                                                    ...vehicleForm,
                                                    manufacturerID: parseInt(e.target.value),
                                                })
                                            }
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Ngày mua</label>
                                        <input
                                            type="date"
                                            value={vehicleForm.purchaseDate}
                                            onChange={(e) =>
                                                setVehicleForm({ ...vehicleForm, purchaseDate: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Ngày hết bảo hành</label>
                                        <input
                                            type="date"
                                            value={vehicleForm.warrantyEndDate}
                                            onChange={(e) =>
                                                setVehicleForm({ ...vehicleForm, warrantyEndDate: e.target.value })
                                            }
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
                                            onChange={(e) =>
                                                setPartForm({ ...partForm, productionDate: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Ngày hết hạn bảo hành *</label>
                                        <input
                                            type="date"
                                            value={partForm.warrantyPeriod}
                                            onChange={(e) =>
                                                setPartForm({ ...partForm, warrantyPeriod: e.target.value })
                                            }
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