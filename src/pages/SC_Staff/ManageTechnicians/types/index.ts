/**
 * InternalManagement Types Index
 *
 * Central export point for all type definitions used in the Internal Management module.
 * All types are synchronized with backend DTOs from Spring Boot EVWarrantyHub.
 *
 * @module InternalManagement/types
 * @see README.md for detailed documentation
 */

// ==================== Response Types ====================
export type {
    WarrantyClaimResponse,
    ClaimPartResponse,
    ClaimAttachmentResponse,
    AssignmentProgress,
    TechnicianPerformance,
    TechnicianUser,
    RoleResponse,
    ServiceCenterResponse,
} from "./warranty";

// ==================== Request Types ====================
export type {
    AssignTechnicianRequest,
    UpdateAssignmentProgressRequest,
} from "./warranty";

// ==================== Status Enums ====================
export type { WarrantyStatus, AssignmentStatus } from "./warranty";

// ==================== Deprecated Types ====================
// Kept for backward compatibility only
export type {
    /** @deprecated Use WarrantyClaimResponse */
    WarrantyRequest,
    /** @deprecated Use TechnicianUser */
    Technician,
} from "./warranty";
