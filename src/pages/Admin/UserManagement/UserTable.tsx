// src/pages/Admin/UserManagement/UserTable.tsx
import React from 'react';
import { FaEdit, FaTrash, FaBan, FaUnlock } from 'react-icons/fa'; // Import thêm icon
import type { User } from './types';
import { getRoleBadge, formatDate } from './helpers';
import styles from './UserManagement.module.css';

interface UserTableProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (userId: number) => void;
    onToggleStatus: (user: User) => void; // <--- Thêm prop này
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete, onToggleStatus }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.userTable}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Service Center</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={10} className={styles.emptyState}>
                                No users found
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id} style={{ opacity: user.status === 'INACTIVE' ? 0.6 : 1 }}>
                                <td>{user.id}</td>
                                <td>
                                    <div className={styles.userCell}>
                                        {user.image && (
                                            <img
                                                src={user.image}
                                                alt={user.username}
                                                className={styles.userAvatar}
                                            />
                                        )}
                                        <span>{user.username}</span>
                                    </div>
                                </td>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>{user.phone || '-'}</td>
                                <td>{getRoleBadge(user.role)}</td>

                                {/* Hiển thị Badge Status */}
                                <td>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: user.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                                        color: user.status === 'ACTIVE' ? '#109c44ff' : '#991b1b',
                                    }}>
                                        {user.status || 'ACTIVE'}
                                    </span>
                                </td>

                                <td>{user.serviceCenter?.name || '-'}</td>
                                <td>{formatDate(user.createdDate)}</td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        <button
                                            onClick={() => onEdit(user)}
                                            className={styles.btnEdit}
                                            title="Edit User"
                                        >
                                            <FaEdit />
                                        </button>

                                        {/* Nút Vô hiệu hóa / Kích hoạt */}
                                        <button
                                            onClick={() => {
                                                const action = user.status === 'ACTIVE' ? 'vô hiệu hóa' : 'kích hoạt';
                                                if (window.confirm(`Bạn có chắc muốn ${action} tài khoản "${user.username}"?`)) {
                                                    onToggleStatus(user);
                                                }
                                            }}
                                            className={styles.btnEdit} // Có thể tạo class riêng .btnBan trong CSS
                                            style={{
                                                backgroundColor: user.status === 'ACTIVE' ? '#f59e0b' : '#10b981',
                                                color: 'white'
                                            }}
                                            title={user.status === 'ACTIVE' ? "Vô hiệu hóa" : "Kích hoạt"}
                                        >
                                            {user.status === 'ACTIVE' ? <FaBan /> : <FaUnlock />}
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
                                                    onDelete(user.id);
                                                }
                                            }}
                                            className={styles.btnDelete}
                                            title="Delete User"
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
    );
};

export default UserTable;