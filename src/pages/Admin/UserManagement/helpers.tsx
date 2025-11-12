import React from 'react';
import { FaUsers, FaUserShield, FaUserCog, FaUserTie, FaTools } from 'react-icons/fa';
import styles from './UserManagement.module.css';

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getRoleIcon = (role: string): React.ReactNode => {
    // Remove "ROLE_" prefix if exists
    const normalizedRole = role?.replace('ROLE_', '') || '';

    const icons: Record<string, React.ReactNode> = {
        ADMIN: <FaUserShield />,
        EVM_STAFF: <FaUserCog />,
        SC_STAFF: <FaUserTie />,
        SC_TECHNICIAN: <FaTools />
    };
    return icons[normalizedRole] || <FaUsers />;
};

export const getRoleBadge = (role: string): React.ReactNode => {
    // Remove "ROLE_" prefix if exists
    const normalizedRole = role?.replace('ROLE_', '') || '';

    const config: Record<string, { label: string; className: string }> = {
        ADMIN: { label: 'Admin', className: styles.roleAdmin },
        EVM_STAFF: { label: 'EVM Staff', className: styles.roleEVM_Staff },
        SC_STAFF: { label: 'SC Staff', className: styles.roleSC_Staff },
        SC_TECHNICIAN: { label: 'Technician', className: styles.roleTechnician }
    };
    const { label, className } = config[normalizedRole] || config.ADMIN;
    return <span className={`${styles.roleBadge} ${className}`}>{getRoleIcon(normalizedRole)} {label}</span>;
};

export const getRoleId = (roleString: string): number => {
    // Remove "ROLE_" prefix if exists (e.g., "ROLE_EVM_STAFF" -> "EVM_STAFF")
    const normalizedRole = roleString?.replace('ROLE_', '') || '';

    // ⚠️ IMPORTANT: Mapping phải khớp với thứ tự trong database
    // Database: 1=ADMIN, 2=SC_STAFF, 3=SC_TECHNICIAN, 4=EVM_STAFF
    const roleMap: Record<string, number> = {
        'ADMIN': 1,
        'SC_STAFF': 2,
        'SC_TECHNICIAN': 3,
        'EVM_STAFF': 4
    };

    const roleId = roleMap[normalizedRole];

    // Debug log to see what's being converted
    console.log('getRoleId:', {
        original: roleString,
        normalized: normalizedRole,
        result: roleId
    });

    return roleId || 2;
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
