import { useState, useEffect } from 'react';
import {
    FaClipboardList,
    FaSearch,
    FaEye,
    FaCheck,
    FaTimes,
    FaUser,
    FaCar,
    FaClock,
    FaExclamationCircle,
    FaCheckCircle,
    FaFileAlt,
    FaExternalLinkAlt,
    FaTruck,
    FaRedo,
} from 'react-icons/fa';
import { warrantyClaimAPI } from '@/utility';
import type { IconType } from 'react-icons';
import styles from './WarrantyClaims.module.css';

// --- 1. ĐỊNH NGHĨA TYPES (Local để đảm bảo không lỗi import) ---

export type ClaimStatus =
    | 'PENDING'       // Chờ duyệt
    | 'APPROVED'      // Được chấp nhận
    | 'REJECTED'      // Từ chối
    | 'SHIPPING'      // Đang giao phụ tùng
    | 'MISSING_PARTS' // Thiếu hàng
    | 'RECEIVED'      // Đã nhận
    | 'IN_PROGRESS'   // Đang xử lý
    | 'COMPLETED';    // Hoàn thành

export interface ClaimPartResponse {
    claimPartID: number;
    partSerialNumber: string;
    partTypeName: string;
    partTypeDescription: string;
    description: string;
    createdDate: string;
    quantity?: number;
    quantityRequested?: number;
    requestedQuantity?: number;
    quantityReportedMissing?: number;
    reportedMissingQuantity?: number;
    quantityMissing?: number;
    missingQuantity?: number;
}

export interface ClaimAttachmentResponse {
    attachmentID: number;
    fileUrl: string;
    fileType: string;
    uploadDate: string;
}

export interface WarrantyClaimResponse {
    claimID: number;
    vin: string;
    licensePlate: string;
    modelName: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    creationDate: string;
    status: string; // Tiếng Việt từ BE
    description: string;
    result: string | null;
    affectedParts: ClaimPartResponse[];
    attachments: ClaimAttachmentResponse[];
}

// Interface cho FE state
interface MappedWarrantyClaim {
    id: number;
    claimNumber: string;
    customer: {
        fullName: string;
        email: string;
        phone?: string;
    };
    vehicle: {
        vin: string;
        model: string;
        licensePlate?: string;
    };
    issueDescription: string;
    status: ClaimStatus;
    createdDate: string;
    result: string | null;
    affectedParts: ClaimPartResponse[];
    attachments: (ClaimAttachmentResponse & { fileName: string })[];
}

// --- 2. HELPER FUNCTIONS (Đồng bộ Admin) ---

// Map status từ BE (Tiếng Việt) -> FE ClaimStatus
const mapStatusFromBE = (status: string): ClaimStatus => {
    const map: Record<string, ClaimStatus> = {
        'Chờ duyệt': 'PENDING',
        'Được chấp nhận': 'APPROVED',
        'Từ chối': 'REJECTED',
        'Đang giao phụ tùng': 'SHIPPING',
        'Thiếu hàng': 'MISSING_PARTS',
        'Đã nhận': 'RECEIVED',
        'Đang xử lý': 'IN_PROGRESS',
        'Hoàn thành': 'COMPLETED',
    };
    return map[status] ?? 'PENDING';
};

// Map FE status -> BE (Tiếng Việt) cho API filter
const mapStatusForAPI = (status: ClaimStatus | 'ALL'): string | null => {
    if (status === 'ALL') return null;
    const map: Record<ClaimStatus, string> = {
        PENDING: 'Chờ duyệt',
        APPROVED: 'Được chấp nhận',
        REJECTED: 'Từ chối',
        SHIPPING: 'Đang giao phụ tùng',
        MISSING_PARTS: 'Thiếu hàng',
        RECEIVED: 'Đã nhận',
        IN_PROGRESS: 'Đang xử lý',
        COMPLETED: 'Hoàn thành',
    };
    return map[status];
};

// --- 3. COMPONENT CHÍNH ---

const WarrantyClaims = () => {
    const [claims, setClaims] = useState<MappedWarrantyClaim[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'ALL'>('ALL');

    // Modal States
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showShipPartsModal, setShowShipPartsModal] = useState(false);

    const [selectedClaim, setSelectedClaim] = useState<MappedWarrantyClaim | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    // Helper: map 1 claim từ BE -> FE
    const mapClaimFromResponse = (claim: WarrantyClaimResponse): MappedWarrantyClaim => {
        const mappedParts: ClaimPartResponse[] = (claim.affectedParts || []).map((p) => ({
            ...p,
            // Logic ưu tiên lấy quantity từ các trường khác nhau
            quantity: p.quantity ?? p.quantityRequested ?? p.requestedQuantity ?? undefined,
            missingQuantity: p.missingQuantity ?? p.quantityReportedMissing ?? p.reportedMissingQuantity ?? p.quantityMissing ?? undefined,
        }));

        const mappedAttachments = (claim.attachments || []).map((att) => ({
            ...att,
            fileName: (att.fileUrl || '').split('/').pop() || 'attachment',
        }));

        return {
            id: claim.claimID,
            claimNumber: `CLM-${claim.claimID}`,
            customer: {
                fullName: claim.customerName,
                email: claim.customerEmail,
                phone: claim.customerPhone,
            },
            vehicle: {
                vin: claim.vin,
                model: claim.modelName,
                licensePlate: claim.licensePlate,
            },
            issueDescription: claim.description,
            status: mapStatusFromBE(claim.status),
            createdDate: claim.creationDate,
            result: claim.result,
            affectedParts: mappedParts,
            attachments: mappedAttachments,
        };
    };

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const apiStatus = mapStatusForAPI(statusFilter);
            let response;
            if (statusFilter === 'ALL' || !apiStatus) {
                response = await warrantyClaimAPI.getAllClaims();
            } else {
                response = await warrantyClaimAPI.getClaimsByStatus(apiStatus);
            }
            const rawList = response.data?.result || response.data || [];
            const mappedClaims: MappedWarrantyClaim[] = (rawList || []).map((claim: WarrantyClaimResponse) => mapClaimFromResponse(claim));

            // Sắp xếp mới nhất lên đầu
            mappedClaims.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
            setClaims(mappedClaims);
        } catch (error: any) {
            console.error('Error fetching claims:', error);
            setClaims([]);
            if (error.response?.status === 403) {
                alert('Lỗi: Bạn không có quyền truy cập! Vui lòng đăng nhập với tài khoản Admin hoặc EVM_Staff.');
            } else {
                // alert(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể tải dữ liệu'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, [statusFilter]);

    // --- HANDLERS ---

    const handleApproveClaim = async () => {
        if (!selectedClaim) return;
        try {
            setLoading(true);
            await warrantyClaimAPI.syncStatusFromManufacturer(selectedClaim.id, 'Được chấp nhận');
            alert('Phê duyệt yêu cầu thành công!');
            setShowApproveModal(false);
            fetchClaims();
        } catch (error: any) {
            console.error('Error approving claim:', error);
            alert(`Lỗi: ${error.response?.data?.message || 'Không thể phê duyệt!'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRejectClaim = async () => {
        if (!selectedClaim || !rejectReason.trim()) {
            alert('Vui lòng nhập lý do từ chối!');
            return;
        }
        try {
            setLoading(true);
            await warrantyClaimAPI.syncStatusFromManufacturer(selectedClaim.id, 'Từ chối', rejectReason);
            alert('Từ chối yêu cầu thành công!');
            setShowRejectModal(false);
            setRejectReason('');
            fetchClaims();
        } catch (error: any) {
            console.error('Error rejecting claim:', error);
            alert(`Lỗi: ${error.response?.data?.message || 'Không thể từ chối!'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleShipParts = async () => {
        if (!selectedClaim) return;
        try {
            setLoading(true);
            await warrantyClaimAPI.shipParts(selectedClaim.id);
            alert('✅ Đã tạo yêu cầu giao phụ tùng thành công! Trạng thái: Đang giao phụ tùng');
            setShowShipPartsModal(false);
            fetchClaims();
        } catch (error: any) {
            console.error('Error shipping parts:', error);
            alert(`Lỗi: ${error.response?.data?.message || 'Không thể giao phụ tùng!'}`);
        } finally {
            setLoading(false);
        }
    };

    // Quan trọng: Tải lại chi tiết claim để lấy missingQuantity mới nhất trước khi mở modal giao hàng
    const openShipPartsModal = async (claim: MappedWarrantyClaim) => {
        setSelectedClaim(claim);
        setShowShipPartsModal(true);
        try {
            setModalLoading(true);
            const resp = await warrantyClaimAPI.getClaimById(claim.id);
            const raw = resp.data?.result ?? resp.data;
            if (raw) setSelectedClaim(mapClaimFromResponse(raw as WarrantyClaimResponse));
        } catch (error) {
            console.error('Error loading claim details:', error);
        } finally {
            setModalLoading(false);
        }
    };

    const getStatusBadge = (status: ClaimStatus) => {
        const config: Record<ClaimStatus, { label: string; className: string; icon: IconType }> = {
            PENDING: { label: 'Chờ duyệt', className: styles.statusPending, icon: FaClock },
            APPROVED: { label: 'Đã duyệt', className: styles.statusApproved, icon: FaCheckCircle },
            REJECTED: { label: 'Từ chối', className: styles.statusRejected, icon: FaTimes },
            IN_PROGRESS: { label: 'Đang xử lý', className: styles.statusInProgress, icon: FaExclamationCircle },
            SHIPPING: { label: 'Đang giao hàng', className: styles.statusShipping, icon: FaTruck },
            RECEIVED: { label: 'Đã nhận', className: styles.statusReceived, icon: FaCheckCircle },
            MISSING_PARTS: { label: 'Thiếu hàng', className: styles.statusMissing, icon: FaExclamationCircle },
            COMPLETED: { label: 'Hoàn thành', className: styles.statusCompleted, icon: FaCheck },
        };
        const { label, className, icon: Icon } = config[status] || config.PENDING;
        return (
            <span className={`${styles.statusBadge} ${className}`}>
                <Icon /> {label}
            </span>
        );
    };

    const filteredClaims = claims.filter((claim) => {
        const search = searchTerm.toLowerCase();
        return (
            claim.claimNumber.toLowerCase().includes(search) ||
            claim.customer.fullName.toLowerCase().includes(search) ||
            claim.vehicle.vin.toLowerCase().includes(search) ||
            claim.vehicle.model.toLowerCase().includes(search)
        );
    });

    const getStatCount = (status: ClaimStatus) => claims.filter((c) => c.status === status).length;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}><FaClipboardList /> Phê duyệt Bảo hành</h1>
                    <p className={styles.subtitle}>Quản lý và phê duyệt yêu cầu bảo hành</p>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchBar}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Tìm theo mã claim, khách hàng, VIN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ClaimStatus | 'ALL')}
                    className={styles.filterSelect}
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="SHIPPING">Đang giao hàng</option>
                    <option value="RECEIVED">Đã nhận hàng</option>
                    <option value="MISSING_PARTS">Thiếu hàng</option>
                    <option value="REJECTED">Từ chối</option>
                    <option value="IN_PROGRESS">Đang xử lý</option>
                    <option value="COMPLETED">Hoàn thành</option>
                </select>
                <button
                    onClick={fetchClaims}
                    className={styles.refreshButton}
                    disabled={loading}
                    title="Làm mới dữ liệu"
                >
                    <FaRedo className={loading ? styles.spinning : ''} />
                    {loading ? 'Đang tải...' : 'Làm mới'}
                </button>
            </div>

            {/* Statistics */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fef3c7' }}><FaClock style={{ color: '#f59e0b' }} /></div>
                    <div className={styles.statContent}><h3>{getStatCount('PENDING')}</h3><p>Chờ phê duyệt</p></div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#d1fae5' }}><FaCheckCircle style={{ color: '#10b981' }} /></div>
                    <div className={styles.statContent}><h3>{getStatCount('APPROVED')}</h3><p>Đã duyệt</p></div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fee2e2' }}><FaTimes style={{ color: '#ef4444' }} /></div>
                    <div className={styles.statContent}><h3>{getStatCount('REJECTED')}</h3><p>Từ chối</p></div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#dbeafe' }}><FaExclamationCircle style={{ color: '#3b82f6' }} /></div>
                    <div className={styles.statContent}><h3>{getStatCount('COMPLETED')}</h3><p>Hoàn Thành</p></div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className={styles.loading}>Đang tải...</div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Mã Claim</th>
                                <th>Khách hàng</th>
                                <th>Xe</th>
                                <th>Vấn đề</th>
                                <th>Ngày tạo</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClaims.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className={styles.noData}>Không có dữ liệu</td>
                                </tr>
                            ) : (
                                filteredClaims.map((claim) => (
                                    <tr key={claim.id}>
                                        <td className={styles.claimNumber}>{claim.claimNumber}</td>
                                        <td>
                                            <div className={styles.customerInfo}>
                                                <FaUser />
                                                <div>
                                                    <div>{claim.customer.fullName}</div>
                                                    <small>{claim.customer.email}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.vehicleInfo}>
                                                <FaCar />
                                                <div>
                                                    <div>{claim.vehicle.model}</div>
                                                    <small>{claim.vehicle.vin}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={styles.issueDesc}>
                                            {claim.issueDescription.substring(0, 50)}
                                            {claim.issueDescription.length > 50 && '...'}
                                        </td>
                                        <td>{new Date(claim.createdDate).toLocaleDateString('vi-VN')}</td>
                                        <td>{getStatusBadge(claim.status)}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    onClick={() => { setSelectedClaim(claim); setShowDetailModal(true); }}
                                                    className={styles.viewButton}
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                                {claim.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => { setSelectedClaim(claim); setShowApproveModal(true); }}
                                                            className={styles.approveButton}
                                                            title="Phê duyệt"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedClaim(claim); setShowRejectModal(true); }}
                                                            className={styles.rejectButton}
                                                            title="Từ chối"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </>
                                                )}
                                                {(claim.status === 'APPROVED' || claim.status === 'MISSING_PARTS') && (
                                                    <button
                                                        onClick={() => openShipPartsModal(claim)}
                                                        className={styles.shipButton}
                                                        title={claim.status === 'MISSING_PARTS' ? 'Giao phụ tùng thiếu' : 'Giao phụ tùng'}
                                                    >
                                                        <FaTruck /> {claim.status === 'MISSING_PARTS' ? 'Giao phụ tùng thiếu' : 'Giao phụ tùng'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedClaim && (
                <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Chi tiết yêu cầu bảo hành</h2>
                            <button onClick={() => setShowDetailModal(false)} className={styles.closeButton}><FaTimes /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailItem}><label>Mã Claim:</label><p>{selectedClaim.claimNumber}</p></div>
                                <div className={styles.detailItem}><label>Trạng thái:</label><p>{getStatusBadge(selectedClaim.status)}</p></div>
                                <div className={styles.detailItem}><label>Khách hàng:</label><p>{selectedClaim.customer.fullName}</p></div>
                                <div className={styles.detailItem}><label>Email:</label><p>{selectedClaim.customer.email}</p></div>
                                <div className={styles.detailItem}><label>Model xe:</label><p>{selectedClaim.vehicle.model}</p></div>
                                <div className={styles.detailItem}><label>VIN:</label><p>{selectedClaim.vehicle.vin}</p></div>
                                <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}><label>Mô tả vấn đề:</label><p>{selectedClaim.issueDescription}</p></div>
                                <div className={styles.detailItem}><label>Ngày tạo:</label><p>{new Date(selectedClaim.createdDate).toLocaleString('vi-VN')}</p></div>

                                {selectedClaim.affectedParts?.length > 0 && (
                                    <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                                        <label>Linh kiện bị ảnh hưởng:</label>
                                        <div className={styles.partsList}>
                                            {selectedClaim.affectedParts.map(part => (
                                                <div key={part.claimPartID} className={styles.partItem}>
                                                    <div><strong>{part.partTypeName}</strong><span className={styles.partSerial}> (SN: {part.partSerialNumber})</span></div>
                                                    {part.description && <p className={styles.partDesc}>{part.description}</p>}
                                                    <div style={{ marginTop: '4px' }}>
                                                        <small>SL: <strong>{part.quantity ?? '-'}</strong></small>
                                                        {part.missingQuantity ? <small style={{ color: 'red', marginLeft: '8px' }}> (Thiếu: {part.missingQuantity})</small> : null}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedClaim.attachments?.length > 0 && (
                                    <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                                        <label><FaFileAlt /> Tài liệu & Hình ảnh đính kèm ({selectedClaim.attachments.length})</label>
                                        <div className={styles.attachmentsList}>
                                            {selectedClaim.attachments.map(att => {
                                                const isImage = att.fileType?.toLowerCase().includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(att.fileName);
                                                return (
                                                    <div key={att.attachmentID} className={styles.attachmentItem}>
                                                        {isImage ? (
                                                            <div className={styles.imagePreview}>
                                                                <img src={att.fileUrl} alt={att.fileName} className={styles.thumbnailImage} />
                                                                <div className={styles.imageOverlay}>
                                                                    <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.viewImageButton}>
                                                                        <FaExternalLinkAlt /> Xem đầy đủ
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className={styles.filePreview}><FaFileAlt className={styles.fileIcon} /></div>
                                                        )}
                                                        <div className={styles.attachmentInfo}>
                                                            <p className={styles.fileName}>{att.fileName}</p>
                                                            <p className={styles.fileDate}>{new Date(att.uploadDate).toLocaleDateString('vi-VN')}</p>
                                                            {!isImage && (
                                                                <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.downloadLink}>
                                                                    <FaExternalLinkAlt /> Xem tài liệu
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {selectedClaim.result && (
                                    <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                                        <label>Kết quả xử lý:</label>
                                        <div className={styles.resultBox}><p>{selectedClaim.result}</p></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Modal */}
            {showApproveModal && selectedClaim && (
                <div className={styles.modalOverlay} onClick={() => setShowApproveModal(false)}>
                    <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                        <h3>Xác nhận phê duyệt</h3>
                        <p>Bạn có chắc chắn muốn phê duyệt yêu cầu {selectedClaim.claimNumber}?</p>
                        <div className={styles.confirmActions}>
                            <button onClick={() => setShowApproveModal(false)} className={styles.btnCancel}>Hủy</button>
                            <button onClick={handleApproveClaim} className={styles.btnApprove} disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Phê duyệt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedClaim && (
                <div className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Từ chối yêu cầu bảo hành</h2>
                            <button onClick={() => setShowRejectModal(false)} className={styles.closeButton}><FaTimes /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Lý do từ chối *</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={4}
                                    placeholder="Nhập lý do từ chối yêu cầu bảo hành..."
                                    className={styles.textarea}
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button onClick={() => setShowRejectModal(false)} className={styles.cancelButton}>Hủy</button>
                            <button onClick={handleRejectClaim} className={styles.rejectButtonMain} disabled={loading || !rejectReason.trim()}>
                                {loading ? 'Đang xử lý...' : 'Từ chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ship Parts Modal */}
            {showShipPartsModal && selectedClaim && (
                <div className={styles.modalOverlay} onClick={() => setShowShipPartsModal(false)}>
                    <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                        <h3>{selectedClaim.status === 'MISSING_PARTS' ? 'Xác nhận giao phụ tùng thiếu' : 'Xác nhận giao phụ tùng'}</h3>
                        <p>Bạn có chắc chắn muốn tạo yêu cầu giao phụ tùng cho đơn <strong>{selectedClaim.claimNumber}</strong>?</p>
                        {selectedClaim.status === 'MISSING_PARTS' && (
                            <div className={styles.infoText} style={{ background: '#f0f7ff' }}>
                                Một số phụ tùng bị thiếu ở lần giao trước. Thực hiện giao bổ sung.
                            </div>
                        )}
                        <div className={styles.infoText}>
                            <FaTruck /> Hệ thống sẽ tự động tạo phiếu xuất kho và phân phối phụ tùng đến trung tâm bảo hành.
                        </div>

                        {modalLoading ? (
                            <p className={styles.loading}>Đang tải chi tiết phụ tùng...</p>
                        ) : (() => {
                            // Logic hiển thị phụ tùng cần giao (giống logic Admin ở lượt trước)
                            const isSupplement = selectedClaim.status === 'MISSING_PARTS';
                            const allParts = selectedClaim.affectedParts || [];
                            const displayParts = isSupplement
                                ? allParts.filter(p => p.missingQuantity && p.missingQuantity > 0)
                                : allParts;

                            return displayParts.length > 0 ? (
                                <div className={styles.partsBox}>
                                    <h4>Phụ tùng cần giao:</h4>
                                    <table className={styles.partsTable}>
                                        <thead>
                                            <tr>
                                                <th>Tên phụ tùng</th>
                                                <th>SN</th>
                                                <th>{isSupplement ? 'Bổ sung' : 'Số lượng'}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayParts.map(p => (
                                                <tr key={p.claimPartID}>
                                                    <td className={styles.partNameCell}>{p.partTypeName}</td>
                                                    <td>{p.partSerialNumber}</td>
                                                    <td>
                                                        {isSupplement ? (
                                                            <span className={styles.missingBadge}>+ {p.missingQuantity}</span>
                                                        ) : (
                                                            <span className={styles.missingBadge} style={{ background: '#10b981' }}>
                                                                {typeof p.quantity === 'number' ? p.quantity : '-'}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : null;
                        })()}

                        <div className={styles.confirmActions}>
                            <button onClick={() => setShowShipPartsModal(false)} className={styles.btnCancel}>Hủy</button>
                            <button onClick={handleShipParts} className={styles.btnApprove} disabled={loading || modalLoading}>
                                {loading ? 'Đang xử lý...' : (selectedClaim.status === 'MISSING_PARTS' ? 'Giao phụ tùng thiếu' : 'Giao phụ tùng')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarrantyClaims;