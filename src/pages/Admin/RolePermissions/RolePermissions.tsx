import React, { useState } from 'react';
import { Shield, Search } from 'lucide-react';
import styles from './RolePermissions.module.css';
import { ROLES, ROLE_PERMISSIONS } from '@/utils/constants';

const RolePermissions: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<string>(ROLES.ADMIN);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Lấy permissions của role hiện tại
    const currentPermissions: string[] = ROLE_PERMISSIONS[selectedRole] || [];

    // Filter permissions theo search
    const filteredPermissions = currentPermissions.filter(permission =>
        permission.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Convert permission key to readable name
    const formatPermissionName = (permission: string): string => {
        return permission
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Get permission description
    const getPermissionDescription = (permission: string): string => {
        const descriptions: Record<string, string> = {
            'manage_all_users': 'Full control over user accounts and profiles',
            'manage_roles': 'Create and modify user roles and permissions',
            'manage_products': 'Add, edit, and remove products and vehicles',
            'manage_vehicles': 'Manage vehicle information and registration',
            'manage_service_centers': 'Control service center configurations',
            'approve_warranty_claims': 'Review and approve warranty claims',
            'manage_system_settings': 'Modify system-wide settings',
            'manage_campaigns': 'Create and manage marketing campaigns',
            'view_warranty_claims': 'View warranty claim details',
            'manage_parts': 'Manage parts inventory',
            'view_reports': 'Access various system reports',
            'manage_customers': 'Manage customer information',
            'create_warranty_claim': 'Create new warranty claims',
            'assign_technician': 'Assign technicians to warranty tasks',
            'view_warranty_history': 'View historical warranty data',
            'view_service_history': 'View service history records',
            'manage_installed_parts': 'Track installed parts',
            'view_assigned_claims': 'View assigned warranty claims',
            'execute_warranty': 'Execute warranty procedures',
            'update_claim_status': 'Update warranty claim status',
            'complete_warranty': 'Mark warranty as completed',
            'view_parts_inventory': 'View available parts inventory',
            'request_parts': 'Request parts from inventory',
        };
        return descriptions[permission] || 'Permission description not available';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Role Permissions</h1>
                    <p className={styles.subtitle}>Manage and view permissions for each role</p>
                </div>
            </div>

            {/* Role Selector */}
            <div className={styles.roleSelector}>
                {Object.values(ROLES).map((role) => (
                    <button
                        key={role}
                        className={`${styles.roleCard} ${selectedRole === role ? styles.active : ''}`}
                        onClick={() => setSelectedRole(role)}
                    >
                        <Shield className={styles.roleIcon} />
                        <span className={styles.roleName}>{role.replace('_', ' ')}</span>
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className={styles.filterBar}>
                <div className={styles.searchBox}>
                    <Search className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search permissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {/* Permission Summary */}
            <div className={styles.summary}>
                <div className={styles.summaryHeader}>
                    <h3>Permission Summary</h3>
                    <span className={styles.summaryCount}>
                        {currentPermissions.length} permissions granted
                    </span>
                </div>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            {/* Permissions List */}
            <div className={styles.permissionsContainer}>
                <div className={styles.categorySection}>
                    <div className={styles.categoryHeader}>
                        <Shield size={24} />
                        <h2>Permissions</h2>
                        <span className={styles.categoryBadge}>
                            {filteredPermissions.length}
                        </span>
                    </div>
                    <div className={styles.permissionsList}>
                        {filteredPermissions.map((permission) => (
                            <div
                                key={permission}
                                className={`${styles.permissionCard} ${styles.granted}`}
                            >
                                <div className={styles.permissionInfo}>
                                    <div className={styles.permissionName}>
                                        {formatPermissionName(permission)}
                                    </div>
                                    <div className={styles.permissionDescription}>
                                        {getPermissionDescription(permission)}
                                    </div>
                                </div>
                                <div className={styles.permissionStatus}>
                                    <span className={styles.statusGranted}>✓ Granted</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {filteredPermissions.length === 0 && (
                <div className={styles.noResults}>
                    <Search size={48} />
                    <p>No permissions found matching your search criteria</p>
                </div>
            )}
        </div>
    );
};

export default RolePermissions;
