import React from 'react';
import { FaUsers, FaUserShield, FaUserCog, FaUserTie, FaTools } from 'react-icons/fa';
import styles from './UserManagement.module.css';

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getRoleIcon = (role: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
        ADMIN: <FaUserShield />,
        EVM_STAFF: <FaUserCog />,
        SC_STAFF: <FaUserTie />,
        SC_TECHNICIAN: <FaTools />
    };
    return icons[role] || <FaUsers />;
};

export const getRoleBadge = (role: string): React.ReactNode => {
    const config: Record<string, { label: string; className: string }> = {
        ADMIN: { label: 'Admin', className: styles.roleAdmin },
        EVM_STAFF: { label: 'EVM Staff', className: styles.roleEVM_Staff },
        SC_STAFF: { label: 'SC Staff', className: styles.roleSC_Staff },
        SC_TECHNICIAN: { label: 'Technician', className: styles.roleTechnician }
    };
    const { label, className } = config[role] || config.ADMIN;
    return <span className={`${styles.roleBadge} ${className}`}>{getRoleIcon(role)} {label}</span>;
};

export const getRoleId = (roleString: string): number => {
    const roleMap: Record<string, number> = {
        'ADMIN': 1,
        'EVM_STAFF': 2,
        'SC_STAFF': 4,
        'SC_TECHNICIAN': 3
    };
    return roleMap[roleString] || 4;
};

export const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return passwordRegex.test(password);
};

export const validatePhone = (phone: string): boolean => {
    return /^[0-9]{10,11}$/.test(phone);
};

export const formatDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
        return '-';
    }
};
