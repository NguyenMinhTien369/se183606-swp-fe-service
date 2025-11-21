import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { userAPI, serviceCenterAPI } from '@/utility';
import type { User, ServiceCenter, UserFormData, RoleFilter } from './types';
import UserTable from './UserTable';
import UserModal from './UserModal';
import styles from './UserManagement.module.css';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
        fetchServiceCenters();
    }, []);

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

            if (modalMode === 'create') {
                await userAPI.createUser(userData);
                alert('User created successfully!');
            } else {
                if (!userData.password) {
                    delete userData.password;
                }
                await userAPI.updateUser(selectedUser!.id, userData);
                alert('User updated successfully!');
            }

            handleCloseModal();
            fetchUsers();
        } catch (error: any) {
            console.error('Error saving user:', error);
            alert('Error: ' + (error.response?.data?.message || error.message));
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: number) => {
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

            // Kiểm tra trạng thái hiện tại để gọi API đúng
            // Giả sử trạng thái 'ACTIVE' là đang hoạt động
            if (user.status === 'ACTIVE') {
                // Nếu đang Active -> Gọi API Vô hiệu hóa
                await userAPI.deactivateUser(user.id);
                alert(`Đã vô hiệu hóa tài khoản ${user.username}`);
            } else {
                // Ngược lại -> Gọi API Kích hoạt
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
                    <h1 className={styles.title}>Quản lý người dùng</h1>
                    <p className={styles.subtitle}>Quản lý tài khoản người dùng và quyền</p>
                </div>
                <button onClick={() => handleOpenModal('create')} className={styles.createButton}>
                    <FaPlus /> Tạo User
                </button>
            </div>

            {/* Search and Filters */}
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

            {/* Users Table */}
            {loading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Loading data...</p>
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

            {/* Modal */}
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
