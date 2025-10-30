import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import type { User, UserFormData, ServiceCenter, ModalMode } from './types';
import { validatePassword, validatePhone, getRoleId } from './helpers';
import styles from './UserManagement.module.css';

interface UserModalProps {
    isOpen: boolean;
    mode: ModalMode;
    user: User | null;
    serviceCenters: ServiceCenter[];
    onClose: () => void;
    onSubmit: (data: UserFormData) => Promise<void>;
}

const UserModal: React.FC<UserModalProps> = ({
    isOpen,
    mode,
    user,
    serviceCenters,
    onClose,
    onSubmit
}) => {
    const [formData, setFormData] = useState<UserFormData>({
        username: '',
        email: '',
        fullName: '',
        password: '',
        phone: '',
        roleId: 0,
        serviceCenterId: 0,
        address: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (mode === 'edit' && user) {
            setFormData({
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                password: '',
                phone: user.phone || '',
                roleId: getRoleId(user.role),
                serviceCenterId: user.serviceCenter?.id || 0,
                address: user.serviceCenter?.address || ''
            });
        } else {
            setFormData({
                username: '',
                email: '',
                fullName: '',
                password: '',
                phone: '',
                roleId: 0,
                serviceCenterId: 0,
                address: ''
            });
        }
        setErrors({});
    }, [mode, user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof UserFormData]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof UserFormData, string>> = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }
        if (mode === 'create' && !formData.password) {
            newErrors.password = 'Password is required';
        }
        if (formData.password && !validatePassword(formData.password)) {
            newErrors.password = 'Password must be at least 6 characters with letters and numbers';
        }
        if (formData.phone && !validatePhone(formData.phone)) {
            newErrors.phone = 'Phone must be 10-11 digits';
        }
        if (formData.roleId === 0) {
            newErrors.roleId = 'Please select a role';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{mode === 'create' ? 'Create New User' : 'Edit User'}</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label>Username *</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={mode === 'edit'}
                            className={errors.username ? styles.inputError : ''}
                        />
                        {errors.username && <span className={styles.errorText}>{errors.username}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? styles.inputError : ''}
                        />
                        {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Full Name *</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={errors.fullName ? styles.inputError : ''}
                        />
                        {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Password {mode === 'create' && '*'}</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={mode === 'edit' ? 'Leave blank to keep current password' : ''}
                            className={errors.password ? styles.inputError : ''}
                        />
                        {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={errors.phone ? styles.inputError : ''}
                        />
                        {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Role *</label>
                        <select
                            name="roleId"
                            value={formData.roleId}
                            onChange={handleChange}
                            className={errors.roleId ? styles.inputError : ''}
                        >
                            <option value={0}>-- Select Role --</option>
                            <option value={1}>Admin</option>
                            <option value={2}>EVM Staff</option>
                            <option value={4}>SC Staff</option>
                            <option value={3}>Technician</option>
                        </select>
                        {errors.roleId && <span className={styles.errorText}>{errors.roleId}</span>}
                    </div>

                    {(formData.roleId === 3 || formData.roleId === 4) && (
                        <div className={styles.formGroup}>
                            <label>Service Center</label>
                            <select
                                name="serviceCenterId"
                                value={formData.serviceCenterId || 0}
                                onChange={handleChange}
                            >
                                <option value={0}>-- Select Service Center --</option>
                                {serviceCenters.map(sc => (
                                    <option key={sc.id} value={sc.id}>
                                        {sc.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className={styles.modalFooter}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.btnSecondary}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.btnPrimary}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
