// src/pages/Admin/UserManagement/AuditLogTable.tsx

import React from 'react';
import { FaHistory, FaUser } from 'react-icons/fa';
import styles from './UserManagement.module.css';
import type { AuditLog } from './types';

interface AuditLogTableProps {
    logs: AuditLog[];
    loading: boolean;
    // Thêm Props cho Pagination
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    onPageChange: (newPage: number) => void;
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({
    logs,
    loading,
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    onPageChange
}) => {
    // Tính toán phạm vi hiển thị
    const startIndex = totalElements === 0 ? 0 : currentPage * pageSize + 1;
    const endIndex = Math.min((currentPage + 1) * pageSize, totalElements);

    return (
        <div className={styles.tableContainer}>
            <table className={styles.userTable}>
                <thead>
                    <tr>
                        <th style={{ width: '80px' }}>ID</th>
                        <th style={{ width: '150px' }}>Hành động</th>
                        <th style={{ width: '200px' }}>Đối tượng</th>
                        <th>Chi tiết</th>
                        <th style={{ width: '180px' }}>Người thực hiện</th>
                        <th style={{ width: '180px' }}>Thời gian</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={6} className={styles.emptyState}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div className={styles.spinner} style={{ width: '24px', height: '24px', margin: 0 }}></div>
                                    <span>Đang tải nhật ký...</span>
                                </div>
                            </td>
                        </tr>
                    ) : logs.length === 0 && !loading ? ( // Thêm điều kiện !loading để tránh nhầm lẫn
                        <tr>
                            <td colSpan={6} className={styles.emptyState}>
                                Chưa có nhật ký hoạt động nào
                            </td>
                        </tr>
                    ) : (
                        logs.map((log) => (
                            <tr key={log.id}>
                                <td>
                                    <span style={{ fontFamily: 'monospace', color: '#64748b' }}>
                                        #{log.id}
                                    </span>
                                </td>
                                <td>
                                    <span style={{
                                        fontWeight: 600,
                                        color: '#0f766e',
                                        backgroundColor: '#f0fdfa',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '12px'
                                    }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ fontSize: '13px' }}>
                                        <strong style={{ color: '#334155' }}>{log.targetEntity}</strong>
                                        {log.targetId && (
                                            <span style={{ color: '#94a3b8', marginLeft: '4px', fontSize: '12px' }}>
                                                (ID: {log.targetId})
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ maxWidth: '350px', whiteSpace: 'normal', lineHeight: '1.5' }}>
                                    <span style={{ color: '#475569' }}>
                                        {log.details || '-'}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.userCell}>
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '50%',
                                            backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', border: '1px solid #e2e8f0'
                                        }}>
                                            <FaUser style={{ color: '#94a3b8', fontSize: '12px' }} />
                                        </div>
                                        <span style={{ fontWeight: 500, fontSize: '13px' }}>{log.username}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.userCell}>
                                        <FaHistory style={{ color: '#94a3b8', fontSize: '14px' }} />
                                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                                            {new Date(log.timestamp).toLocaleString('vi-VN', {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* --- FOOTER PHÂN TRANG --- */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0'
            }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>
                    {`Hiển thị ${startIndex} - ${endIndex} trong tổng số ${totalElements} mục`}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 0 || loading || totalPages === 0}
                        className={styles.btnSecondary}
                        style={{ padding: '8px 12px', background: 'white', border: '1px solid #cbd5e1' }}
                    >
                        Trước
                    </button>
                    <span style={{
                        padding: '8px 12px',
                        backgroundColor: '#14b8a6',
                        color: 'white',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        {totalPages === 0 ? '0/0' : `${currentPage + 1} / ${totalPages}`}
                    </span>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1 || loading || totalPages === 0}
                        className={styles.btnSecondary}
                        style={{ padding: '8px 12px', background: 'white', border: '1px solid #cbd5e1' }}
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditLogTable;