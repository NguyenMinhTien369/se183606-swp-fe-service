import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import type { User } from './types';
import { getRoleBadge, formatDate } from './helpers';
import styles from './UserManagement.module.css';

interface UserTableProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (userId: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete }) => {
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
                        <th>Service Center</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={9} className={styles.emptyState}>
                                No users found
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id}>
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
