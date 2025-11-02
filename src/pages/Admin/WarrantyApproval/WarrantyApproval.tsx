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
} from 'react-icons/fa';
import { warrantyClaimAPI } from '@/utility';
import type { WarrantyClaim, ClaimStatus } from './types';
import styles from './WarrantyApproval.module.css';

const WarrantyApproval = () => {
    const [claims, setClaims] = useState<WarrantyClaim[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'ALL'>('PENDING');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    // TODO: Get serviceCenterID from auth context instead of hardcoding
    const serviceCenterID = 1;

    useEffect(() => {
        fetchClaims();
    }, [statusFilter, serviceCenterID]);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const response = await warrantyClaimAPI.getClaimsByServiceCenter(serviceCenterID);

            // Map backend response to frontend interface
            const mappedClaims = (response.data.result || []).map((claim: any) => ({
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
                status: claim.status?.toUpperCase() || 'PENDING',
                createdDate: claim.creationDate,
                estimatedCost: 0, // Not provided by backend
                result: claim.result,
                affectedParts: claim.affectedParts || [],
                attachments: claim.attachments || [],
            }));

            setClaims(mappedClaims);
        } catch (error) {
            console.error('Error fetching claims:', error);
            setClaims([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClaim = async () => {
        if (!selectedClaim) return;

        try {
            setLoading(true);
            // Sync status to APPROVED using backend API
            await warrantyClaimAPI.syncStatusFromManufacturer(selectedClaim.id, 'APPROVED');

            alert('✅ Phê duyệt yêu cầu thành công!');
            setShowApproveModal(false);
            fetchClaims();
        } catch (error: any) {
            console.error('Error approving claim:', error);
            alert(`❌ Lỗi: ${error.response?.data?.message || 'Không thể phê duyệt!'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRejectClaim = async () => {
        if (!selectedClaim || !rejectReason.trim()) {
            alert('❌ Vui lòng nhập lý do từ chối!');
            return;
        }

        try {
            setLoading(true);
            // Sync status to REJECTED using backend API
            await warrantyClaimAPI.syncStatusFromManufacturer(selectedClaim.id, 'REJECTED');

            alert('✅ Từ chối yêu cầu thành công!');
            setShowRejectModal(false);
            setRejectReason('');
            fetchClaims();
        } catch (error: any) {
            console.error('Error rejecting claim:', error);
            alert(`❌ Lỗi: ${error.response?.data?.message || 'Không thể từ chối!'}`);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: ClaimStatus) => {
        const config = {
            PENDING: { label: 'Chờ duyệt', className: styles.statusPending, icon: FaClock },
            APPROVED: { label: 'Đã duyệt', className: styles.statusApproved, icon: FaCheckCircle },
            REJECTED: { label: 'Từ chối', className: styles.statusRejected, icon: FaTimes },
            IN_PROGRESS: { label: 'Đang xử lý', className: styles.statusInProgress, icon: FaExclamationCircle },
            COMPLETED: { label: 'Hoàn thành', className: styles.statusCompleted, icon: FaCheck },
        };
        const { label, className, icon: Icon } = config[status];
        return (
            <span className={`${styles.statusBadge} ${className}`}>
                <Icon /> {label}
            </span>
        );
    };

    const filteredClaims = claims.filter((claim) => {
        const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;
        const search = searchTerm.toLowerCase();
        const matchesSearch =
            claim.claimNumber?.toLowerCase().includes(search) ||
            claim.customer?.fullName?.toLowerCase().includes(search) ||
            claim.vehicle?.vin?.toLowerCase().includes(search);
        return matchesStatus && matchesSearch;
    });

    const getStatCount = (status: ClaimStatus) => {
        return claims.filter((c) => c.status === status).length;
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        <FaClipboardList /> Phê duyệt Bảo hành
                    </h1>
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
                    <option value="REJECTED">Từ chối</option>
                    <option value="IN_PROGRESS">Đang xử lý</option>
                    <option value="COMPLETED">Hoàn thành</option>
                </select>
            </div>

            {/* Statistics */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fef3c7' }}>
                        <FaClock style={{ color: '#f59e0b' }} />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{getStatCount('PENDING')}</h3>
                        <p>Chờ phê duyệt</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#d1fae5' }}>
                        <FaCheckCircle style={{ color: '#10b981' }} />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{getStatCount('APPROVED')}</h3>
                        <p>Đã duyệt</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fee2e2' }}>
                        <FaTimes style={{ color: '#ef4444' }} />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{getStatCount('REJECTED')}</h3>
                        <p>Từ chối</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#dbeafe' }}>
                        <FaExclamationCircle style={{ color: '#3b82f6' }} />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{getStatCount('IN_PROGRESS')}</h3>
                        <p>Đang xử lý</p>
                    </div>
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
                                <th>Chi phí dự kiến</th>
                                <th>Ngày tạo</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClaims.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className={styles.noData}>
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                filteredClaims.map((claim) => (
                                    <tr key={claim.id}>
                                        <td className={styles.claimNumber}>{claim.claimNumber}</td>
                                        <td>
                                            <div className={styles.customerInfo}>
                                                <FaUser />
                                                <div>
                                                    <div>{claim.customer?.fullName}</div>
                                                    <small>{claim.customer?.email}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.vehicleInfo}>
                                                <FaCar />
                                                <div>
                                                    <div>{claim.vehicle?.model}</div>
                                                    <small>{claim.vehicle?.vin}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={styles.issueDesc}>
                                            {claim.issueDescription?.substring(0, 50)}
                                            {claim.issueDescription?.length > 50 && '...'}
                                        </td>
                                        <td className={styles.cost}>
                                            {claim.estimatedCost?.toLocaleString('vi-VN')} VNĐ
                                        </td>
                                        <td>{new Date(claim.createdDate).toLocaleDateString('vi-VN')}</td>
                                        <td>{getStatusBadge(claim.status)}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedClaim(claim);
                                                        setShowDetailModal(true);
                                                    }}
                                                    className={styles.viewButton}
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                                {claim.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedClaim(claim);
                                                                setShowApproveModal(true);
                                                            }}
                                                            className={styles.approveButton}
                                                            title="Phê duyệt"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedClaim(claim);
                                                                setShowRejectModal(true);
                                                            }}
                                                            className={styles.rejectButton}
                                                            title="Từ chối"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </>
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
                            <button onClick={() => setShowDetailModal(false)} className={styles.closeButton}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailItem}>
                                    <label>Mã Claim:</label>
                                    <p>{selectedClaim.claimNumber}</p>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Trạng thái:</label>
                                    <p>{getStatusBadge(selectedClaim.status)}</p>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Khách hàng:</label>
                                    <p>{selectedClaim.customer?.fullName}</p>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Email:</label>
                                    <p>{selectedClaim.customer?.email}</p>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Model xe:</label>
                                    <p>{selectedClaim.vehicle?.model}</p>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>VIN:</label>
                                    <p>{selectedClaim.vehicle?.vin}</p>
                                </div>
                                <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                                    <label>Mô tả vấn đề:</label>
                                    <p>{selectedClaim.issueDescription}</p>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Chi phí dự kiến:</label>
                                    <p className={styles.cost}>
                                        {selectedClaim.estimatedCost?.toLocaleString('vi-VN')} VNĐ
                                    </p>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Ngày tạo:</label>
                                    <p>{new Date(selectedClaim.createdDate).toLocaleString('vi-VN')}</p>
                                </div>
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
                            <button onClick={() => setShowApproveModal(false)} className={styles.btnCancel}>
                                Hủy
                            </button>
                            <button
                                onClick={handleApproveClaim}
                                className={styles.btnApprove}
                                disabled={loading}
                            >
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
                            <button onClick={() => setShowRejectModal(false)} className={styles.closeButton}>
                                <FaTimes />
                            </button>
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
                            <button onClick={() => setShowRejectModal(false)} className={styles.cancelButton}>
                                Hủy
                            </button>
                            <button
                                onClick={handleRejectClaim}
                                className={styles.rejectButtonMain}
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Từ chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarrantyApproval;
