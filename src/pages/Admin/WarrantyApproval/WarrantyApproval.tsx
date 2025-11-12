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
} from 'react-icons/fa';
import { warrantyClaimAPI } from '@/utility';
import type { WarrantyClaim, ClaimStatus } from './types';
import styles from './WarrantyApproval.module.css';

const WarrantyApproval = () => {
    const [claims, setClaims] = useState<WarrantyClaim[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'ALL'>('ALL');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchClaims();
    }, [statusFilter]);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            console.log('Fetching claims with status filter:', statusFilter);

            // Convert English status to Vietnamese for API
            const mapStatusForAPI = (status: ClaimStatus | 'ALL'): string => {
                const statusMap: Record<string, string> = {
                    'PENDING': 'Chờ duyệt',
                    'APPROVED': 'Được chấp nhận',
                    'REJECTED': 'Từ chối',
                    'IN_PROGRESS': 'Đang xử lý',
                    'COMPLETED': 'Hoàn thành',
                };
                return statusMap[status] || status;
            };

            const response = statusFilter === 'ALL'
                ? await warrantyClaimAPI.getAllClaims()
                : await warrantyClaimAPI.getClaimsByStatus(mapStatusForAPI(statusFilter));

            console.log('API Response:', response);
            console.log('Result data:', response.data.result);

            // Map Vietnamese status to English
            const mapStatus = (status: string): ClaimStatus => {
                const statusMap: Record<string, ClaimStatus> = {
                    'Chờ duyệt': 'PENDING',
                    'Được chấp nhận': 'APPROVED',
                    'Đã duyệt': 'APPROVED',
                    'Từ chối': 'REJECTED',
                    'Đang xử lý': 'IN_PROGRESS',
                    'Hoàn thành': 'COMPLETED',
                };

                const upperStatus = status?.toUpperCase();
                if (['PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED'].includes(upperStatus)) {
                    return upperStatus as ClaimStatus;
                }
                return statusMap[status] || 'PENDING';
            };

            const mappedClaims = (response.data.result || []).map((claim: any) => {
                console.log('Mapping claim:', claim.claimID, 'Status:', claim.status);
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
                    status: mapStatus(claim.status),
                    createdDate: claim.creationDate,
                    estimatedCost: 0, // Not provided by backend
                    result: claim.result,
                    affectedParts: claim.affectedParts || [],
                    attachments: claim.attachments || [],
                };
            });

            // Sắp xếp các đơn bảo hành mới nhất lên đầu
            mappedClaims.sort((a: any, b: any) => {
                const dateA = new Date(a.createdDate).getTime();
                const dateB = new Date(b.createdDate).getTime();
                return dateB - dateA; // Sort giảm dần (mới nhất trước)
            });

            console.log('Mapped claims:', mappedClaims);
            console.log('Total claims:', mappedClaims.length);
            setClaims(mappedClaims);
        } catch (error: any) {
            console.error('Error fetching claims:', error);
            console.error('Error response:', error.response);
            console.error('Error details:', error.response?.data);
            setClaims([]);

            // Hiển thị lỗi chi tiết
            if (error.response?.status === 403) {
                alert('Lỗi: Bạn không có quyền truy cập! Vui lòng đăng nhập với tài khoản Admin hoặc EVM_Staff.');
            } else if (error.response?.status === 401) {
                alert('Lỗi: Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.');
            } else {
                alert(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể tải dữ liệu'}`);
            }
        } finally {
            setLoading(false);
        }
    };

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
            // SỬA: Gửi status bằng tiếng Việt thay vì tiếng Anh
            await warrantyClaimAPI.syncStatusFromManufacturer(selectedClaim.id, 'Từ chối');

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

    const getStatusBadge = (status: ClaimStatus) => {
        const config: Record<ClaimStatus, { label: string; className: string; icon: any }> = {
            PENDING: { label: 'Chờ duyệt', className: styles.statusPending, icon: FaClock },
            APPROVED: { label: 'Đã duyệt', className: styles.statusApproved, icon: FaCheckCircle },
            REJECTED: { label: 'Từ chối', className: styles.statusRejected, icon: FaTimes },
            IN_PROGRESS: { label: 'Đang xử lý', className: styles.statusInProgress, icon: FaExclamationCircle },
            COMPLETED: { label: 'Hoàn thành', className: styles.statusCompleted, icon: FaCheck },
        };

        const statusConfig = config[status] || config.PENDING; // Fallback to PENDING if status not found
        const { label, className, icon: Icon } = statusConfig;

        return (
            <span className={`${styles.statusBadge} ${className}`}>
                <Icon /> {label}
            </span>
        );
    };

    const filteredClaims = claims.filter((claim) => {
        // Không cần filter theo status nữa vì đã filter từ API
        const search = searchTerm.toLowerCase();
        const matchesSearch =
            claim.claimNumber?.toLowerCase().includes(search) ||
            claim.customer?.fullName?.toLowerCase().includes(search) ||
            claim.vehicle?.vin?.toLowerCase().includes(search) ||
            claim.vehicle?.model?.toLowerCase().includes(search);
        return matchesSearch;
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
                                <th>Ngày tạo</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClaims.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className={styles.noData}>
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
                                    <label>Ngày tạo:</label>
                                    <p>{new Date(selectedClaim.createdDate).toLocaleString('vi-VN')}</p>
                                </div>

                                {/* Linh kiện bị ảnh hưởng */}
                                {selectedClaim.affectedParts && selectedClaim.affectedParts.length > 0 && (
                                    <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                                        <label>Linh kiện bị ảnh hưởng:</label>
                                        <div className={styles.partsList}>
                                            {selectedClaim.affectedParts.map((part) => (
                                                <div key={part.partID} className={styles.partItem}>
                                                    <div>
                                                        <strong>{part.partName}</strong>
                                                        <span className={styles.partSerial}> (SN: {part.partSerialNumber})</span>
                                                    </div>
                                                    {part.description && (
                                                        <p className={styles.partDesc}>{part.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Hình ảnh và tài liệu đính kèm */}
                                {selectedClaim.attachments && selectedClaim.attachments.length > 0 && (
                                    <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                                        <label>
                                            <FaFileAlt /> Tài liệu & Hình ảnh đính kèm ({selectedClaim.attachments.length})
                                        </label>
                                        <div className={styles.attachmentsList}>
                                            {selectedClaim.attachments.map((attachment) => {
                                                const isImage = attachment.fileType?.toLowerCase().includes('image') ||
                                                    /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.fileName);

                                                return (
                                                    <div key={attachment.attachmentID} className={styles.attachmentItem}>
                                                        {isImage ? (
                                                            <div className={styles.imagePreview}>
                                                                <img
                                                                    src={attachment.fileUrl}
                                                                    alt={attachment.fileName}
                                                                    className={styles.thumbnailImage}
                                                                />
                                                                <div className={styles.imageOverlay}>
                                                                    <a
                                                                        href={attachment.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={styles.viewImageButton}
                                                                    >
                                                                        <FaExternalLinkAlt /> Xem đầy đủ
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className={styles.filePreview}>
                                                                <FaFileAlt className={styles.fileIcon} />
                                                            </div>
                                                        )}
                                                        <div className={styles.attachmentInfo}>
                                                            <p className={styles.fileName}>{attachment.fileName}</p>
                                                            <p className={styles.fileDate}>
                                                                {new Date(attachment.uploadDate).toLocaleDateString('vi-VN')}
                                                            </p>
                                                            {!isImage && (
                                                                <a
                                                                    href={attachment.fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={styles.downloadLink}
                                                                >
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

                                {/* Kết quả xử lý */}
                                {selectedClaim.result && (
                                    <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                                        <label>Kết quả xử lý:</label>
                                        <div className={styles.resultBox}>
                                            <p>{selectedClaim.result}</p>
                                        </div>
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