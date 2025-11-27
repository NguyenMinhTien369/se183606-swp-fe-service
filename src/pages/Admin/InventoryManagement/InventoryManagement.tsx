import React, { useState, useEffect } from 'react';
import {
    FaWarehouse, FaPlus, FaSearch, FaEdit,
    FaExclamationTriangle, FaTrash, FaMapMarkerAlt, FaBox, FaShippingFast
} from 'react-icons/fa';
import { inventoryAPI, partDistributionAPI } from '@/utility';
import type { PartInventoryResponse, PartInventoryRequest } from '@/utility';
import styles from './InventoryManagement.module.css';

const LOW_STOCK_THRESHOLD = 10;

interface PartDistributionResponse {
    distributionID: number;
    partSerialNumber: string;
    serviceCenterID: number;
    quantity: number;
    distributionDate: string;
}

export default function InventoryManagement() {
    const [activeTab, setActiveTab] = useState<'inventory' | 'distribution'>('inventory');

    const [items, setItems] = useState<PartInventoryResponse[]>([]); // Dữ liệu Kho
    const [distributions, setDistributions] = useState<PartDistributionResponse[]>([]); // Dữ liệu Xuất kho

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
    const [selectedItem, setSelectedItem] = useState<PartInventoryResponse | null>(null);

    const [formData, setFormData] = useState<PartInventoryRequest>({
        partSerialNumber: '',
        quantity: 0,
        location: '',
        minQuantity: LOW_STOCK_THRESHOLD
    });

    useEffect(() => {
        if (activeTab === 'inventory') {
            fetchInventory();
        } else {
            fetchDistributions();
        }
    }, [activeTab, showLowStockOnly]);

    // API: Lấy tồn kho
    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = showLowStockOnly
                ? await inventoryAPI.getLowStockParts(LOW_STOCK_THRESHOLD)
                : await inventoryAPI.getFactoryInventory();
            setItems(response.data.result || []);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    // API: Lấy lịch sử xuất kho
    const fetchDistributions = async () => {
        setLoading(true);
        try {
            const response = await partDistributionAPI.getAllDistributions();
            const data = response.data.result || [];
            const sorted = data.sort((a: any, b: any) =>
                new Date(b.distributionDate).getTime() - new Date(a.distributionDate).getTime()
            );
            setDistributions(sorted);
        } catch (error) {
            console.error("Error fetching distributions:", error);
            setDistributions([]);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers Modal ---
    const handleOpenCreate = () => {
        setModalMode('create');
        setFormData({ partSerialNumber: '', quantity: 0, location: '', minQuantity: LOW_STOCK_THRESHOLD });
        setIsModalOpen(true);
    };

    const handleOpenUpdate = (item: PartInventoryResponse) => {
        setModalMode('update');
        setSelectedItem(item);
        setFormData({
            partSerialNumber: item.partSerialNumber,
            quantity: item.quantity,
            location: item.location || '',
            minQuantity: LOW_STOCK_THRESHOLD
        });
        setIsModalOpen(true);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await inventoryAPI.createOrUpdateInventory(formData);
                alert("✅ Tạo kho phụ tùng thành công!");
            } else if (modalMode === 'update') {
                await inventoryAPI.updateInventory(formData.partSerialNumber, formData);
                alert("✅ Cập nhật thông tin thành công!");
            }

            setIsModalOpen(false);
            fetchInventory();
        } catch (error: any) {
            alert(`Lỗi: ${error.response?.data?.message || "Thao tác thất bại"}`);
        }
    };

    const handleDelete = async (serial: string) => {
        if (!confirm(`Bạn có chắc muốn xóa kho của mã ${serial}?`)) return;
        try {
            await inventoryAPI.deleteInventory(serial);
            alert("✅ Đã xóa thành công!");
            fetchInventory();
        } catch (error: any) {
            alert("Lỗi xóa: " + (error.response?.data?.message || error.message));
        }
    };

    // --- Filter Logic ---
    const filteredItems = items.filter(item =>
        (item.partSerialNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDistributions = distributions.filter(dist =>
        (dist.partSerialNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(dist.serviceCenterID).includes(searchTerm)
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}><FaWarehouse /> Quản Lý Kho Phụ Tùng</h1>
                {activeTab === 'inventory' && (
                    <button className={styles.createBtn} onClick={handleOpenCreate}>
                        <FaPlus /> Thêm Mới
                    </button>
                )}
            </div>

            <div className={styles.tabs}>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`${styles.tab} ${activeTab === 'inventory' ? styles.tabActive : ''}`}
                >
                    <FaBox /> Kho (Tồn kho)
                </button>
                <button
                    onClick={() => setActiveTab('distribution')}
                    className={`${styles.tab} ${activeTab === 'distribution' ? styles.tabActive : ''}`}
                >
                    <FaShippingFast /> Xuất kho (Lịch sử)
                </button>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        placeholder={activeTab === 'inventory' ? "Tìm theo serial, vị trí..." : "Tìm theo serial, ID trung tâm..."}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                {activeTab === 'inventory' && (
                    <button
                        className={`${styles.filterBtn} ${showLowStockOnly ? styles.active : ''}`}
                        onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                        title="Lọc tồn kho thấp"
                    >
                        <FaExclamationTriangle />
                    </button>
                )}
            </div>

            <div className={styles.tableContainer}>
                {activeTab === 'inventory' ? (
                    // BẢNG TỒN KHO
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>ID</th>
                                <th>Mã Serial</th>
                                <th>Vị Trí</th>
                                <th>Tồn Kho</th>
                                <th>Trạng Thái</th>
                                <th>Cập Nhật</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className={styles.noData}>Đang tải dữ liệu...</td></tr>
                            ) : filteredItems.length === 0 ? (
                                <tr><td colSpan={7} className={styles.noData}>Không tìm thấy dữ liệu</td></tr>
                            ) : (
                                filteredItems.map((item, index) => (
                                    <tr key={item.inventoryId || index}>
                                        <td style={{ color: '#64748b' }}>{index + 1}</td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.partSerialNumber}</td>
                                        <td>{item.location ? <><FaMapMarkerAlt size={12} color="#64748b" /> {item.location}</> : '-'}</td>
                                        <td>
                                            <span className={`${styles.stockBadge} ${item.quantity < LOW_STOCK_THRESHOLD ? styles.lowStock : styles.goodStock}`}>
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td>
                                            {item.quantity < LOW_STOCK_THRESHOLD ?
                                                <span style={{ color: '#ef4444', fontSize: '12px' }}>Thấp</span> :
                                                <span style={{ color: '#16a34a', fontSize: '12px' }}>Ổn định</span>
                                            }
                                        </td>
                                        <td style={{ fontSize: '13px', color: '#64748b' }}>
                                            {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString('vi-VN') : '-'}
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={`${styles.iconBtn} ${styles.btnEdit}`} onClick={() => handleOpenUpdate(item)} title="Sửa"><FaEdit /></button>
                                                <button className={`${styles.iconBtn} ${styles.btnDelete}`} onClick={() => handleDelete(item.partSerialNumber)} title="Xóa"><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                ) : (
                    // BẢNG XUẤT KHO
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Mã Phân Phối</th>
                                <th>Mã Serial Phụ Tùng</th>
                                <th>Nơi Nhận (Service Center)</th>
                                <th>Số Lượng Xuất</th>
                                <th>Ngày Xuất Kho</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className={styles.noData}>Đang tải lịch sử xuất kho...</td></tr>
                            ) : filteredDistributions.length === 0 ? (
                                <tr><td colSpan={5} className={styles.noData}>Chưa có lịch sử xuất kho</td></tr>
                            ) : (
                                filteredDistributions.map((dist) => (
                                    <tr key={dist.distributionID}>
                                        <td style={{ fontWeight: 600, color: '#2563eb' }}>#{dist.distributionID}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{dist.partSerialNumber}</td>
                                        <td>
                                            <span className={styles.stockBadge} style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                                                Service Center #{dist.serviceCenterID}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600, color: '#ea580c' }}>
                                            - {dist.quantity}
                                        </td>
                                        <td>
                                            {dist.distributionDate ? new Date(dist.distributionDate).toLocaleDateString('vi-VN') : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Form */}
            {isModalOpen && activeTab === 'inventory' && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>
                                {modalMode === 'create' && '📦 Tạo Kho Mới'}
                                {modalMode === 'update' && '✏️ Cập Nhật Thông Tin'}
                            </h3>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>Mã Serial Phụ Tùng <span style={{ color: 'red' }}>*</span></label>
                                    <input
                                        required
                                        disabled={modalMode !== 'create'}
                                        value={modalMode === 'create' ? formData.partSerialNumber : selectedItem?.partSerialNumber}
                                        onChange={e => setFormData({ ...formData, partSerialNumber: e.target.value })}
                                        placeholder="VD: PART-001"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Vị Trí Lưu Kho</label>
                                    <input
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="VD: Kệ A, Hàng 2"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Số Lượng Tồn Kho <span style={{ color: 'red' }}>*</span></label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Hủy</button>
                                <button type="submit" className={styles.submitBtn}>Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}