// ============================================
// USER MANAGEMENT TYPE DEFINITIONS
// ============================================

export interface ServiceCenter {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface User {
    id: number;
    username: string;
    fullName: string;
    email: string;
    phone?: string;
    image?: string;
    role: string;
    roleId: number;
    serviceCenter?: ServiceCenter;
    createdDate: string;
    status?: 'ACTIVE' | 'INACTIVE' | string;
}

export interface UserFormData {
    username: string;
    email: string;
    fullName: string;
    password: string;
    phone: string;
    roleId: number;
    serviceCenterId: number | null;
    address: string;
}

export interface RoleFilter {
    key: string;
    label: string;
    count: number;
}

export type ModalMode = 'create' | 'edit';
