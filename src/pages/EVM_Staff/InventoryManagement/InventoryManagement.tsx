import React, { useState, useEffect } from 'react';
import {
    FaWarehouse, FaPlus, FaSearch, FaEdit, FaArrowDown,
    FaExclamationTriangle, FaTrash, FaMapMarkerAlt
} from 'react-icons/fa';
import { inventoryAPI } from '@/utility';
import type { PartInventoryResponse, PartInventoryRequest } from '@/utility';
import styles from './InventoryManagement.module.css';

const LOW_STOCK_THRESHOLD = 10;

export default function InventoryManagement() {
    // State
    const [items, setItems] = useState<PartInventoryResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'update' | 'stock_in'>('create');
    const [selectedItem, setSelectedItem] = useState<PartInventoryResponse | null>(null);

    // Form State
    const [formData, setFormData] = useState<PartInventoryRequest>({
        partSerialNumber: '',
        quantity: 0,
        location: '',
        minQuantity: LOW_STOCK_THRESHOLD
    });
    const [stockInAmount, setStockInAmount] = useState<number>(0);

    useEffect(() => {
        fetchInventory();
    }, [showLowStockOnly]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = showLowStockOnly
                ? await inventoryAPI.getLowStockParts(LOW_STOCK_THRESHOLD)
                : await inventoryAPI.getAllInventories();

            const data = response.data.result || [];
            setItems(data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers mở Modal ---

    const handleOpenCreate = () => {
        setModalMode('create');
        setFormData({
            partSerialNumber: '',
            quantity: 0,
            location: '',
            minQuantity: LOW_STOCK_THRESHOLD
        });
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

    const handleOpenStockIn = (item: PartInventoryResponse) => {
        setModalMode('stock_in');
        setSelectedItem(item);
        setStockInAmount(0);
        setIsModalOpen(true);
    };

    // --- Handler Submit ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await inventoryAPI.createOrUpdateInventory(formData);
                alert("✅ Tạo kho phụ tùng thành công!");
            }
            else if (modalMode === 'update') {
                await inventoryAPI.updateInventory(formData.partSerialNumber, formData);
                alert("✅ Cập nhật thông tin thành công!");
            }
            else if (modalMode === 'stock_in' && selectedItem) {
                const currentQty = selectedItem.quantity;
                const newTotal = currentQty + Number(stockInAmount);

                await inventoryAPI.updateInventoryQuantity(
                    selectedItem.partSerialNumber,
                    newTotal
                );
                alert(`✅ Đã nhập thêm ${stockInAmount}. Tổng tồn kho: ${newTotal}`);
            }

            setIsModalOpen(false);
            fetchInventory();
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || "Thao tác thất bại";
            alert(`❌ Lỗi: ${msg}`);
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

    const filteredItems = items.filter(item =>
        (item.partSerialNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}><FaWarehouse /> Quản Lý Kho Phụ Tùng</h1>
                <button className={styles.createBtn} onClick={handleOpenCreate}>
                    <FaPlus /> Thêm Mới
                </button>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        placeholder="Tìm theo tên, serial, vị trí..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    className={`${styles.filterBtn} ${showLowStockOnly ? styles.active : ''}`}
                    onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                >
                    <FaExclamationTriangle />
                </button>
            </div>

            <div className={styles.tableContainer}>
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
                            <tr><td colSpan={8} className={styles.noData}>Đang tải dữ liệu...</td></tr>
                        ) : filteredItems.length === 0 ? (
                            <tr><td colSpan={8} className={styles.noData}>Không tìm thấy dữ liệu</td></tr>
                        ) : (
                            filteredItems.map((item, index) => (
                                <tr key={item.inventoryId || index}>
                                    <td style={{ color: '#64748b', fontWeight: 500 }}>
                                        {index + 1}
                                    </td>

                                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                        {item.partSerialNumber}
                                    </td>
                                    <td>
                                        {item.location ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FaMapMarkerAlt size={12} color="#64748b" /> {item.location}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        <span className={`${styles.stockBadge} ${item.quantity < LOW_STOCK_THRESHOLD ? styles.lowStock : styles.goodStock}`}>
                                            {item.quantity}
                                        </span>
                                    </td>
                                    <td>
                                        {item.quantity < LOW_STOCK_THRESHOLD ? (
                                            <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>Thấp</span>
                                        ) : (
                                            <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 500 }}>Ổn định</span>
                                        )}
                                    </td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                                        {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString('vi-VN') : '-'}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={`${styles.iconBtn} ${styles.btnStockIn}`}
                                                onClick={() => handleOpenStockIn(item)}
                                                title="Nhập kho"
                                            >
                                                <FaArrowDown />
                                            </button>
                                            <button
                                                className={`${styles.iconBtn} ${styles.btnEdit}`}
                                                onClick={() => handleOpenUpdate(item)}
                                                title="Chỉnh sửa thông tin"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className={`${styles.iconBtn} ${styles.btnDelete}`}
                                                onClick={() => handleDelete(item.partSerialNumber)}
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

            {/* Modal Form (Giữ nguyên như cũ) */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>
                                {modalMode === 'create' && '📦 Tạo Kho Mới'}
                                {modalMode === 'update' && '✏️ Cập Nhật Thông Tin'}
                                {modalMode === 'stock_in' && '⬇️ Nhập Kho (Stock In)'}
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

                                {modalMode !== 'stock_in' && (
                                    <>
                                        <div className={styles.formGroup}>
                                            <label>Vị Trí Lưu Kho</label>
                                            <input
                                                value={formData.location}
                                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="VD: Kệ A, Hàng 2"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className={styles.formGroup}>
                                    <label>
                                        {modalMode === 'stock_in' ? 'Số Lượng Nhập Thêm' : 'Số Lượng Tồn Kho'} <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    {modalMode === 'stock_in' ? (
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={stockInAmount}
                                            onChange={e => setStockInAmount(Number(e.target.value))}
                                            autoFocus
                                        />
                                    ) : (
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                        />
                                    )}

                                    {modalMode === 'stock_in' && selectedItem && (
                                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                            Hiện tại: <b>{selectedItem.quantity}</b>.
                                            Sau khi nhập: <b>{selectedItem.quantity + stockInAmount}</b>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Hủy</button>
                                <button type="submit" className={styles.submitBtn}>
                                    {modalMode === 'stock_in' ? 'Xác Nhận Nhập' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}