import { useState, useEffect } from 'react';
import {
    FaClipboardList, FaSearch, FaEye, FaCheck, FaTimes,
    FaClock, FaExclamationCircle, FaCheckCircle, FaExternalLinkAlt, FaTruck,
    FaWarehouse, FaFileAlt, FaSync
} from 'react-icons/fa';
import { warrantyClaimAPI } from '@/utility';
// SỬA LỖI IMPORT CSS CHO ĐÚNG VỚI FILE CỦA ADMIN
import styles from './WarrantyApproval.module.css';

// --- 1. ĐỊNH NGHĨA TYPES & ENUM ---

export type ClaimStatusEnum =
    | 'SC_REVIEW'     // Chờ duyệt (Tại SC)
    | 'PENDING'       // Chờ hãng duyệt (Admin cần duyệt)
    | 'APPROVED'      // Hãng đã duyệt
    | 'REJECTED'      // Từ chối
    | 'SHIPPING'      // Đang giao hàng
    | 'MISSING_PARTS' // Chờ bổ sung / Thiếu hàng
    | 'RECEIVED'      // Đã nhận
    | 'IN_PROGRESS'   // Đang xử lý
    | 'COMPLETED';    // Hoàn thành

// Interface hiển thị FE
interface MappedWarrantyClaim {
    id: number;
    claimNumber: string;
    customer: { fullName: string; email: string; phone?: string; };
    vehicle: { vin: string; model: string; licensePlate?: string; };
    issueDescription: string;

    statusEnum: ClaimStatusEnum; // Dùng để check logic (Ẩn/Hiện nút)
    statusVietnamese: string;    // Dùng để hiển thị lên màn hình

    createdDate: string;
    result: string | null;
    affectedParts: any[];
    attachments: any[];
}

// --- 2. LOGIC MAPPING TRẠNG THÁI ---

// Map từ Tiếng Việt (BE trả về) sang Enum (FE dùng logic)
const mapStatusToEnum = (statusVN: string): ClaimStatusEnum => {
    const s = statusVN ? statusVN.trim() : '';

    // Mapping logic chuẩn với Backend hiện tại
    if (s === 'Chờ hãng duyệt') return 'PENDING';
    if (s === 'Hãng đã duyệt' || s === 'Được chấp nhận') return 'APPROVED';
    if (s === 'Từ chối') return 'REJECTED';
    if (s === 'Đang giao hàng' || s === 'Đang giao phụ tùng') return 'SHIPPING';
    if (s === 'Chờ bổ sung phụ tùng' || s === 'Thiếu hàng') return 'MISSING_PARTS';
    if (s === 'Đã nhận' || s === 'Đã nhận phụ tùng') return 'RECEIVED';
    if (s === 'Hoàn thành') return 'COMPLETED';
    if (s === 'Đang xử lý') return 'IN_PROGRESS';

    // Mặc định các trạng thái khác coi như SC đang giữ
    return 'SC_REVIEW';
};

// Map từ Enum Filter sang chuỗi API cần tìm
const mapFilterToApiString = (filter: ClaimStatusEnum | 'ALL'): string | null => {
    if (filter === 'ALL') return null;
    const map: Record<string, string> = {
        PENDING: 'Chờ hãng duyệt',
        APPROVED: 'Hãng đã duyệt',
        SHIPPING: 'Đang giao phụ tùng',
        MISSING_PARTS: 'Chờ bổ sung phụ tùng',
        REJECTED: 'Từ chối',
        COMPLETED: 'Hoàn thành'
    };
    return map[filter] || null;
};

// --- 3. COMPONENT CHÍNH ---

const WarrantyApproval = () => {
    // === STATE MANAGEMENT ===
    const [claims, setClaims] = useState<MappedWarrantyClaim[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ClaimStatusEnum | 'ALL'>('ALL');

    // Modal States
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showShipPartsModal, setShowShipPartsModal] = useState(false);
    const [showDelayModal, setShowDelayModal] = useState(false);

    // Data handling inside Modals
    const [selectedClaim, setSelectedClaim] = useState<MappedWarrantyClaim | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [delayDate, setDelayDate] = useState('');
    const [delayReason, setDelayReason] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    // === FETCH DATA ===
    const fetchClaims = async () => {
        try {
            setLoading(true);
            const apiStatus = mapFilterToApiString(statusFilter);

            let response;
            if (statusFilter === 'ALL' || !apiStatus) {
                response = await warrantyClaimAPI.getAllClaims();
            } else {
                response = await warrantyClaimAPI.getClaimsByStatus(apiStatus);
            }

            const rawList = response.data?.result || response.data || [];

            // Map data
            const mappedList = rawList.map((c: any) => ({
                id: c.claimID,
                claimNumber: `CLM-${c.claimID}`,
                customer: {
                    fullName: c.customerName,
                    email: c.customerEmail,
                    phone: c.customerPhone
                },
                vehicle: {
                    vin: c.vin,
                    model: c.modelName,
                    licensePlate: c.licensePlate
                },
                issueDescription: c.description || '',
                statusEnum: mapStatusToEnum(c.status),
                statusVietnamese: c.status,
                createdDate: c.creationDate,
                result: c.result,
                affectedParts: c.affectedParts || [],
                attachments: (c.attachments || []).map((a: any) => ({
                    ...a,
                    fileName: a.fileUrl ? a.fileUrl.split('/').pop() : 'Document'
                }))
            }));

            // Sort: Mới nhất lên đầu
            mappedList.sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

            setClaims(mappedList);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, [statusFilter]);

    // === HANDLERS (SỬA ĐỂ TRÁNH LỖI 1135 & 400) ===

    // 1. DUYỆT ĐƠN (Approve)
    const handleApproveClaim = async () => {
        if (!selectedClaim) return;
        if (selectedClaim.statusEnum !== 'PENDING') {
            alert('Lỗi: Đơn này không ở trạng thái "Chờ hãng duyệt"!');
            return;
        }
        try {
            setModalLoading(true);

            // QUAN TRỌNG: Gửi chuỗi Tiếng Việt "Hãng đã duyệt" để khớp với Backend cũ
            await warrantyClaimAPI.syncStatusFromManufacturer(
                selectedClaim.id,
                'Hãng đã duyệt', // Backend cũ cần chuỗi này
                'Admin đã phê duyệt yêu cầu.' // Kèm note để tránh lỗi 400
            );

            alert('✅ Đã duyệt đơn thành công!');
            setShowApproveModal(false);
            fetchClaims();
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message;
            alert(`❌ Lỗi khi duyệt: ${msg}`);
        } finally {
            setModalLoading(false);
        }
    };

    // 2. TỪ CHỐI ĐƠN (Reject)
    const handleRejectClaim = async () => {
        if (!selectedClaim || !rejectReason.trim()) {
            alert('Vui lòng nhập lý do từ chối');
            return;
        }
        try {
            setModalLoading(true);
            // QUAN TRỌNG: Gửi chuỗi Tiếng Việt "Từ chối"
            await warrantyClaimAPI.syncStatusFromManufacturer(
                selectedClaim.id,
                'Từ chối',
                rejectReason
            );
            alert('✅ Đã từ chối đơn!');
            setShowRejectModal(false);
            setRejectReason('');
            fetchClaims();
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message;
            alert(`❌ Lỗi khi từ chối: ${msg}`);
        } finally {
            setModalLoading(false);
        }
    };

    // 3. GIAO HÀNG (Ship Parts)
    const handleShipParts = async () => {
        if (!selectedClaim) return;
        try {
            setModalLoading(true);
            // API này Backend tự xử lý logic chuyển trạng thái
            await warrantyClaimAPI.shipParts(selectedClaim.id);
            alert('✅ Đã tạo lệnh giao hàng!');
            setShowShipPartsModal(false);
            fetchClaims();
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message;
            alert(`❌ Lỗi giao hàng: ${msg}`);
        } finally {
            setModalLoading(false);
        }
    };

    // 4. BÁO THIẾU HÀNG / DELAY (Report Missing)
    const handleReportMissingStock = async () => {
        if (!selectedClaim || !delayDate) {
            alert('Vui lòng chọn ngày hẹn có hàng');
            return;
        }
        try {
            setModalLoading(true);
            const note = `Hẹn ngày: ${new Date(delayDate).toLocaleDateString('vi-VN')}. Lý do: ${delayReason}`;

            // QUAN TRỌNG: Gửi chuỗi Tiếng Việt "Chờ bổ sung phụ tùng"
            await warrantyClaimAPI.syncStatusFromManufacturer(
                selectedClaim.id,
                'Chờ bổ sung phụ tùng',
                note
            );

            alert('✅ Đã cập nhật trạng thái chờ bổ sung!');
            setShowDelayModal(false);
            setDelayDate(''); setDelayReason('');
            fetchClaims();
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message;
            alert(`❌ Lỗi cập nhật: ${msg}`);
        } finally {
            setModalLoading(false);
        }
    };

    // === RENDER HELPERS ===

    const getStatusBadge = (statusEnum: ClaimStatusEnum, labelVN: string) => {
        let colorClass = 'bg-gray-100 text-gray-600';
        let Icon = FaClipboardList;

        switch (statusEnum) {
            case 'PENDING': colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200'; Icon = FaClock; break;
            case 'APPROVED': colorClass = 'bg-green-100 text-green-800 border-green-200'; Icon = FaCheckCircle; break;
            case 'REJECTED': colorClass = 'bg-red-100 text-red-800 border-red-200'; Icon = FaTimes; break;
            case 'SHIPPING': colorClass = 'bg-blue-100 text-blue-800 border-blue-200'; Icon = FaTruck; break;
            case 'MISSING_PARTS': colorClass = 'bg-orange-100 text-orange-800 border-orange-200'; Icon = FaExclamationCircle; break;
            case 'COMPLETED': colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200'; Icon = FaCheck; break;
            case 'SC_REVIEW': colorClass = 'bg-gray-200 text-gray-600'; Icon = FaWarehouse; break;
        }

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
                <Icon size={12} /> {labelVN || 'Không xác định'}
            </span>
        );
    };

    // Đếm số lượng cho Stats
    const getStatCount = (status: ClaimStatusEnum) => claims.filter((c) => c.statusEnum === status).length;

    const filteredClaims = claims.filter(c =>
        c.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // === JSX ===
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}><FaWarehouse /> Quản lý Bảo hành (Admin)</h1>
                    <p className={styles.subtitle}>Duyệt yêu cầu và điều phối phụ tùng từ Hãng</p>
                </div>
            </div>

            {/* STATISTICS GRID */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fef3c7' }}><FaClock color="#f59e0b" /></div>
                    <div className={styles.statContent}><h3>{getStatCount('PENDING')}</h3><p>Chờ phê duyệt</p></div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#d1fae5' }}><FaCheckCircle color="#10b981" /></div>
                    <div className={styles.statContent}><h3>{getStatCount('APPROVED')}</h3><p>Đã duyệt</p></div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#ffedd5' }}><FaExclamationCircle color="#ea580c" /></div>
                    <div className={styles.statContent}><h3>{getStatCount('MISSING_PARTS')}</h3><p>Chờ bổ sung</p></div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#ddd6fe' }}><FaTruck color="#7c3aed" /></div>
                    <div className={styles.statContent}><h3>{getStatCount('SHIPPING')}</h3><p>Đang giao</p></div>
                </div>
            </div>

            {/* FILTERS */}
            <div className={styles.filters}>
                <div className={styles.searchBar}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        placeholder="Tìm mã đơn, VIN, Tên khách..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className={styles.filterSelect}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ClaimStatusEnum | 'ALL')}
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ hãng duyệt</option>
                    <option value="APPROVED">Hãng đã duyệt</option>
                    <option value="SHIPPING">Đang giao hàng</option>
                    <option value="MISSING_PARTS">Thiếu hàng (Delay)</option>
                    <option value="REJECTED">Đã từ chối</option>
                    <option value="COMPLETED">Hoàn thành</option>
                </select>
                <button onClick={fetchClaims} className={styles.refreshButton} disabled={loading}>
                    <FaSync className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* TABLE */}
            <div className={styles.tableContainer}>
                {loading && <div className="p-4 text-center">Đang tải dữ liệu...</div>}

                {!loading && (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Mã Đơn</th>
                                <th>Khách hàng</th>
                                <th>Xe (Model/VIN)</th>
                                <th>Mô tả lỗi</th>
                                <th>Ngày tạo</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClaims.length === 0 ? (
                                <tr><td colSpan={7} className={styles.noData}>Không có dữ liệu</td></tr>
                            ) : (
                                filteredClaims.map(claim => (
                                    <tr key={claim.id}>
                                        <td className="font-bold text-blue-600">{claim.claimNumber}</td>
                                        <td>
                                            <div className="font-medium">{claim.customer.fullName}</div>
                                            <div className="text-xs text-gray-500">{claim.customer.phone}</div>
                                        </td>
                                        <td>
                                            <div>{claim.vehicle.model}</div>
                                            <div className="text-xs text-gray-500">{claim.vehicle.vin}</div>
                                        </td>
                                        <td className={styles.issueDesc}>
                                            {claim.issueDescription.length > 40
                                                ? claim.issueDescription.substring(0, 40) + '...'
                                                : claim.issueDescription}
                                        </td>
                                        <td>{new Date(claim.createdDate).toLocaleDateString('vi-VN')}</td>
                                        <td>{getStatusBadge(claim.statusEnum, claim.statusVietnamese)}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    onClick={() => { setSelectedClaim(claim); setShowDetailModal(true) }}
                                                    className={styles.viewButton} title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>

                                                {/* --- LOGIC HIỆN NÚT (TRÁNH LỖI 1135) --- */}

                                                {/* CHỈ HIỆN KHI ĐANG CHỜ HÃNG DUYỆT */}
                                                {claim.statusEnum === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => { setSelectedClaim(claim); setShowApproveModal(true) }}
                                                            className={styles.approveButton} title="Duyệt"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedClaim(claim); setShowRejectModal(true) }}
                                                            className={styles.rejectButton} title="Từ chối"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </>
                                                )}

                                                {/* CHỈ HIỆN KHI ĐÃ DUYỆT HOẶC ĐANG DELAY */}
                                                {(claim.statusEnum === 'APPROVED' || claim.statusEnum === 'MISSING_PARTS') && (
                                                    <>
                                                        {/* Nút Giao hàng vẫn giữ lại để có thể chuyển về trạng thái SHIPPING */}
                                                        <button
                                                            onClick={() => { setSelectedClaim(claim); setShowShipPartsModal(true) }}
                                                            className={styles.shipButton} title="Giao hàng"
                                                        >
                                                            <FaTruck />
                                                        </button>

                                                        {/* Ẩn nút Báo thiếu hàng nếu đã là MISSING_PARTS */}
                                                        {claim.statusEnum === 'APPROVED' && (
                                                            <button
                                                                onClick={() => { setSelectedClaim(claim); setShowDelayModal(true) }}
                                                                className={styles.shipButton}
                                                                style={{ backgroundColor: '#f97316' }}
                                                                title="Báo thiếu hàng"
                                                            >
                                                                <FaExclamationCircle />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- MODALS --- */}

            {/* 1. DETAIL MODAL (HIỂN THỊ ẢNH) */}
            {showDetailModal && selectedClaim && (
                <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Chi tiết yêu cầu {selectedClaim.claimNumber}</h2>
                            <button className={styles.closeButton} onClick={() => setShowDetailModal(false)}><FaTimes /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailItem}><label>Trạng thái:</label><div>{getStatusBadge(selectedClaim.statusEnum, selectedClaim.statusVietnamese)}</div></div>
                                <div className={styles.detailItem}><label>Khách hàng:</label><div>{selectedClaim.customer.fullName}</div></div>
                                <div className={styles.detailItem}><label>Model xe:</label><div>{selectedClaim.vehicle.model}</div></div>
                                <div className={styles.detailItem}><label>Số VIN:</label><div>{selectedClaim.vehicle.vin}</div></div>

                                <div className={styles.detailItem} style={{ gridColumn: '1/-1' }}>
                                    <label>Mô tả vấn đề:</label>
                                    <p className="bg-gray-50 p-3 rounded mt-1 border">{selectedClaim.issueDescription}</p>
                                </div>

                                {selectedClaim.affectedParts.length > 0 && (
                                    <div className={styles.detailItem} style={{ gridColumn: '1/-1' }}>
                                        <label>Linh kiện yêu cầu:</label>
                                        <div className={styles.partsList}>
                                            {selectedClaim.affectedParts.map((p, idx) => (
                                                <div key={idx} className={styles.partItem}>
                                                    <div className="font-bold text-gray-700">• {p.partTypeName}</div>
                                                    <div className="text-sm">
                                                        SL: {p.quantity || 1}
                                                        {p.missingQuantity ? <span className="text-red-500 font-bold ml-2"> (Thiếu: {p.missingQuantity})</span> : ''}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* HIỂN THỊ HÌNH ẢNH & TÀI LIỆU */}
                                {selectedClaim.attachments.length > 0 && (
                                    <div className={styles.detailItem} style={{ gridColumn: '1/-1', marginTop: '10px' }}>
                                        <label className="mb-2 block font-semibold">Hình ảnh & Tài liệu đính kèm:</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                                            {selectedClaim.attachments.map((att, idx) => {
                                                const isImage = att.fileUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i);
                                                return (
                                                    <div key={idx} className="border rounded p-2 flex flex-col items-center bg-white hover:shadow-md transition">
                                                        {isImage ? (
                                                            <div className="w-full h-24 mb-2 overflow-hidden rounded border bg-gray-100 flex items-center justify-center">
                                                                <img
                                                                    src={att.fileUrl}
                                                                    alt={att.fileName}
                                                                    className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-200"
                                                                    onClick={() => window.open(att.fileUrl, '_blank')}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-24 mb-2 flex items-center justify-center bg-gray-100 rounded text-gray-400">
                                                                <FaFileAlt size={32} />
                                                            </div>
                                                        )}
                                                        <a
                                                            href={att.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 text-xs truncate w-full text-center flex items-center justify-center gap-1"
                                                            title={att.fileName}
                                                        >
                                                            <FaExternalLinkAlt size={10} /> {att.fileName}
                                                        </a>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. APPROVE MODAL */}
            {showApproveModal && selectedClaim && (
                <div className={styles.modalOverlay} onClick={() => setShowApproveModal(false)}>
                    <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
                        <h3>Xác nhận duyệt?</h3>
                        <p>Đơn <b>{selectedClaim.claimNumber}</b> sẽ chuyển sang trạng thái "Hãng đã duyệt".</p>
                        <div className={styles.confirmActions}>
                            <button onClick={() => setShowApproveModal(false)} className={styles.btnCancel}>Hủy</button>
                            <button onClick={handleApproveClaim} className={styles.btnApprove} disabled={modalLoading}>
                                {modalLoading ? '...' : 'Đồng ý Duyệt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. REJECT MODAL */}
            {showRejectModal && selectedClaim && (
                <div className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}><h2>Từ chối yêu cầu</h2></div>
                        <div className={styles.modalBody}>
                            <textarea className={styles.textarea} rows={3} placeholder="Lý do từ chối (bắt buộc)..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                        </div>
                        <div className={styles.modalFooter}>
                            <button onClick={() => setShowRejectModal(false)} className={styles.cancelButton}>Hủy</button>
                            <button onClick={handleRejectClaim} className={styles.rejectButtonMain} disabled={modalLoading || !rejectReason.trim()}>Từ chối</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. SHIP MODAL */}
            {showShipPartsModal && selectedClaim && (
                <div className={styles.modalOverlay} onClick={() => setShowShipPartsModal(false)}>
                    <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
                        <h3>Giao phụ tùng?</h3>
                        <p>Tạo phiếu xuất kho cho đơn <b>{selectedClaim.claimNumber}</b>.</p>
                        <div className={styles.confirmActions}>
                            <button onClick={() => setShowShipPartsModal(false)} className={styles.btnCancel}>Hủy</button>
                            <button onClick={handleShipParts} className={styles.btnApprove} disabled={modalLoading}>Xác nhận Giao</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. DELAY MODAL (MODAL TO & ĐẸP) */}
            {showDelayModal && selectedClaim && (
                <div className={styles.modalOverlay} onClick={() => setShowDelayModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}><h2 className="text-orange-600">Báo thiếu hàng (Delay)</h2></div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                                <label>Ngày hẹn khách hàng:</label>
                                <input
                                    type="date"
                                    className={styles.searchInput}
                                    value={delayDate}
                                    onChange={e => setDelayDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Lý do/Ghi chú:</label>
                                <textarea
                                    className={styles.textarea}
                                    rows={5}
                                    value={delayReason}
                                    onChange={e => setDelayReason(e.target.value)}
                                    style={{ width: '100%' }}
                                    placeholder="Nhập lý do delay..."
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button onClick={() => setShowDelayModal(false)} className={styles.cancelButton}>Hủy</button>
                            <button onClick={handleReportMissingStock} className={styles.btnApprove} style={{ background: '#ea580c' }} disabled={modalLoading}>
                                {modalLoading ? '...' : 'Xác nhận & Gửi Mail'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarrantyApproval;