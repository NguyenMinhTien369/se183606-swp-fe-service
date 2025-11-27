import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { FaPlus, FaSearch, FaUsers, FaHistory } from 'react-icons/fa';
import { userAPI, serviceCenterAPI, adminAPI } from '@/utility';
import type { User, ServiceCenter, UserFormData, RoleFilter, AuditLog } from './types';
import UserTable from './UserTable';
import AuditLogTable from './AuditLogTable';
import UserModal from './UserModal';
import styles from './UserManagement.module.css';

const UserManagement: React.FC = () => {
    // --- STATE QUẢN LÝ TABS ---
    const [activeTab, setActiveTab] = useState<'users' | 'auditLogs'>('users');

    // --- STATE CHO USER MANAGEMENT ---
    const [users, setUsers] = useState<User[]>([]);
    const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // --- STATE CHO AUDIT LOGS ---
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // --- THÊM STATE PHÂN TRANG CHO AUDIT LOGS ---
    const [currentPage, setCurrentPage] = useState(0); // Page bắt đầu từ 0
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const PAGE_SIZE = 50; // Kích thước trang cố định theo yêu cầu

    // --- EFFECT: LOAD DATA KHI CHUYỂN TAB HOẶC CHUYỂN TRANG ---
    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
            fetchServiceCenters();
        } else {
            fetchAuditLogs();
        }
    }, [activeTab, currentPage]); // <-- Thêm currentPage vào dependency array

    // --- API: LẤY DANH SÁCH USER (Không đổi) ---
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getUsers();

            let userData: any[] = [];
            if (response.data.result) {
                userData = Array.isArray(response.data.result)
                    ? response.data.result
                    : (response.data.result.content || []);
            } else if (Array.isArray(response.data)) {
                userData = response.data;
            }

            const mappedUsers: User[] = userData.map((user: any) => ({
                id: user.userID,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role?.roleName || 'UNKNOWN',
                roleId: user.role?.roleID,
                serviceCenter: user.serviceCenter ? {
                    id: user.serviceCenter.serviceCenterID,
                    name: user.serviceCenter.name,
                    phone: user.serviceCenter.phone,
                    email: user.serviceCenter.email,
                    address: user.serviceCenter.address
                } : undefined,
                createdDate: user.createdDate || new Date().toISOString(),
                status: user.status || (user.isActive ? 'ACTIVE' : 'INACTIVE') || 'ACTIVE',
            }));

            setUsers(mappedUsers);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // --- API: LẤY DANH SÁCH SERVICE CENTER (Không đổi) ---
    const fetchServiceCenters = async () => {
        try {
            const response = await serviceCenterAPI.getServiceCenters();
            let centers: any[] = [];

            if (response.data.result) {
                centers = Array.isArray(response.data.result)
                    ? response.data.result
                    : (response.data.result.content || []);
            } else if (Array.isArray(response.data)) {
                centers = response.data;
            }

            const mappedCenters: ServiceCenter[] = centers.map((sc: any) => ({
                id: sc.serviceCenterID || sc.id,
                name: sc.name,
                address: sc.address,
                phone: sc.phone,
                email: sc.email
            }));

            setServiceCenters(mappedCenters);
        } catch (error) {
            console.error('Error fetching service centers:', error);
            setServiceCenters([]);
        }
    };

    // --- API: LẤY NHẬT KÝ HỆ THỐNG (CẬP NHẬT LOGIC PHÂN TRANG) ---
    const fetchAuditLogs = async () => {
        try {
            setLoadingLogs(true);
            // GỌI API VỚI THAM SỐ PHÂN TRANG
            const response = await adminAPI.getAuditLogs(currentPage, PAGE_SIZE);

            // Lấy data và thông tin phân trang
            const result = response.data.result || {};
            const logsData = result.content || [];

            // Cập nhật state phân trang
            setAuditLogs(logsData);
            setTotalPages(result.totalPages || 1);
            setTotalElements(result.totalElements || 0);

        } catch (error) {
            console.error('Error fetching audit logs:', error);
            setAuditLogs([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoadingLogs(false);
        }
    };

    // --- HANDLER: CHUYỂN TRANG ---
    const handlePageChange = (newPage: number) => {
        // Đảm bảo newPage nằm trong phạm vi hợp lệ
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    // --- HANDLERS: USER MODAL & ACTIONS --- (Không đổi)
    const handleOpenModal = (mode: 'create' | 'edit', user: User | null = null) => {
        setModalMode(mode);
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleSubmit = async (formData: UserFormData) => {
        try {
            setLoading(true);

            const userData: any = {
                username: formData.username.trim(),
                password: formData.password,
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                phone: formData.phone?.trim() || null,
                roleId: formData.roleId,
                serviceCenterId: formData.serviceCenterId && formData.serviceCenterId !== 0
                    ? parseInt(String(formData.serviceCenterId))
                    : null
            };

            // Logic xử lý password: Nếu rỗng thì xóa key để backend không update
            if (!userData.password) {
                delete userData.password;
            }

            if (modalMode === 'create') {
                await userAPI.createUser(userData);
                alert('User created successfully!');
            } else {
                await userAPI.updateUser(selectedUser!.id, userData);
                alert('User updated successfully!');
            }

            handleCloseModal();
            fetchUsers();
        } catch (error: any) {
            console.error('Error saving user:', error);
            alert('Error: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            setLoading(true);
            await userAPI.deleteUser(userId);
            alert('User deleted successfully!');
            fetchUsers();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            alert('Cannot delete user: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user: User) => {
        try {
            setLoading(true);
            if (user.status === 'ACTIVE') {
                await userAPI.deactivateUser(user.id);
                alert(`Đã vô hiệu hóa tài khoản ${user.username}`);
            } else {
                await userAPI.activateUser(user.id);
                alert(`Đã kích hoạt lại tài khoản ${user.username}`);
            }
            fetchUsers();
        } catch (error: any) {
            console.error('Error changing user status:', error);
            const message = error.response?.data?.message || "Không thể thay đổi trạng thái";
            alert(`Lỗi: ${message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- FILTER LOGIC --- (Không đổi)
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const roleFilters: RoleFilter[] = [
        { key: 'ALL', label: 'All', count: users.length },
        { key: 'ADMIN', label: 'Admin', count: users.filter(u => u.role === 'ADMIN').length },
        { key: 'EVM_STAFF', label: 'EVM Staff', count: users.filter(u => u.role === 'EVM_STAFF').length },
        { key: 'SC_STAFF', label: 'SC Staff', count: users.filter(u => u.role === 'SC_STAFF').length },
        { key: 'SC_TECHNICIAN', label: 'Technician', count: users.filter(u => u.role === 'SC_TECHNICIAN').length },
    ];

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        {activeTab === 'users' ? 'Quản lý người dùng' : 'Nhật ký hệ thống'}
                    </h1>
                    <p className={styles.subtitle}>
                        Hệ thống quản lý bảo hành xe điện
                    </p>
                </div>
                {activeTab === 'users' && (
                    <button onClick={() => handleOpenModal('create')} className={styles.createButton}>
                        <FaPlus /> <span>Tạo User</span>
                    </button>
                )}
            </div>

            {/* --- TABS NAVIGATION --- */}
            <div className={styles.tabs}>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`${styles.tab} ${activeTab === 'users' ? styles.tabActive : ''}`}
                >
                    <FaUsers />
                    <span>Người dùng</span>
                </button>

                <button
                    onClick={() => {
                        setActiveTab('auditLogs');
                        setCurrentPage(0); // Reset về trang 0 khi chuyển tab
                    }}
                    className={`${styles.tab} ${activeTab === 'auditLogs' ? styles.tabActive : ''}`}
                >
                    <FaHistory />
                    <span>Nhật ký hệ thống</span>
                </button>
            </div>

            {/* --- TAB CONTENT 1: USER MANAGEMENT --- (Không đổi) */}
            {activeTab === 'users' && (
                <>
                    <div className={styles.controls}>
                        <div className={styles.searchBar}>
                            <FaSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by username, name, email..."
                                value={searchTerm}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className={styles.filters}>
                            {roleFilters.map(filter => (
                                <button
                                    key={filter.key}
                                    className={`${styles.filterButton} ${roleFilter === filter.key ? styles.active : ''}`}
                                    onClick={() => setRoleFilter(filter.key)}
                                >
                                    {filter.label}
                                    <span className={styles.filterCount}>{filter.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <p>Loading users...</p>
                        </div>
                    ) : (
                        <div className={styles.tableCard}>
                            <UserTable
                                users={filteredUsers}
                                onEdit={(user) => handleOpenModal('edit', user)}
                                onDelete={handleDelete}
                                onToggleStatus={handleToggleStatus}
                            />
                        </div>
                    )}
                </>
            )}

            {/* --- TAB CONTENT 2: AUDIT LOGS --- */}
            {activeTab === 'auditLogs' && (
                <div className={styles.tableCard}>
                    <AuditLogTable
                        logs={auditLogs}
                        loading={loadingLogs}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={PAGE_SIZE}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* User Modal (Create/Edit) */}
            <UserModal
                isOpen={showModal}
                mode={modalMode}
                user={selectedUser}
                serviceCenters={serviceCenters}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default UserManagement;