/**
 * Privacy & Selective Disclosure System
 * Allows users to share specific credential fields with verifiers
 */

import { createHash, randomBytes } from "crypto";

export interface SharingPermission {
  id: string;
  credentialId: number;
  ownerAddress: string;
  sharedWith: string; // Verifier address or "public"
  fields: string[]; // Fields to share
  expiresAt: Date;
  createdAt: Date;
  signature: string;
  isRevoked: boolean;
}

export interface SelectiveDisclosureRequest {
  credentialId: number;
  requestedFields: string[];
  verifierAddress: string;
  purpose: string;
  expiresIn: number; // seconds
}

export interface DisclosureProof {
  credentialId: number;
  fields: Record<string, any>;
  proofHash: string;
  timestamp: Date;
  verifierAddress: string;
}

/**
 * Available credential fields for selective disclosure
 */
export const DISCLOSABLE_FIELDS = {
  // Basic Info
  name: { label: "Credential Name", sensitive: false },
  description: { label: "Description", sensitive: false },
  institution: { label: "Institution", sensitive: false },
  credentialType: { label: "Credential Type", sensitive: false },

  // Dates
  issueDate: { label: "Issue Date", sensitive: false },
  expiryDate: { label: "Expiry Date", sensitive: false },

  // Identity
  recipientAddress: { label: "Recipient Wallet", sensitive: true },
  recipientName: { label: "Recipient Name", sensitive: true },

  // Verification
  issuerAddress: { label: "Issuer Wallet", sensitive: false },
  transactionHash: { label: "Transaction Hash", sensitive: false },
  isRevoked: { label: "Revocation Status", sensitive: false },

  // Metadata
  metadataUri: { label: "Metadata URI", sensitive: false },
  imageCid: { label: "Image CID", sensitive: false },

  // Skills (if applicable)
  skills: { label: "Skills", sensitive: false },
  proficiencyLevel: { label: "Proficiency Level", sensitive: false },
} as const;

/**
 * Privacy levels
 */
export enum PrivacyLevel {
  PUBLIC = "public", // Anyone can view
  RESTRICTED = "restricted", // Only approved verifiers
  PRIVATE = "private", // Only owner
}

/**
 * Create a sharing permission
 */
export function createSharingPermission(
  credentialId: number,
  ownerAddress: string,
  sharedWith: string,
  fields: string[],
  expiresIn: number // seconds
): SharingPermission {
  const id = randomBytes(16).toString("hex");
  const createdAt = new Date();
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  // Create signature (in production, use proper cryptographic signing)
  const dataToSign = `${credentialId}:${ownerAddress}:${sharedWith}:${fields.join(",")}:${expiresAt.getTime()}`;
  const signature = createHash("sha256").update(dataToSign).digest("hex");

  return {
    id,
    credentialId,
    ownerAddress,
    sharedWith,
    fields,
    expiresAt,
    createdAt,
    signature,
    isRevoked: false,
  };
}

/**
 * Verify sharing permission
 */
export function verifySharingPermission(
  permission: SharingPermission,
  verifierAddress: string
): { valid: boolean; reason?: string } {
  // Check if revoked
  if (permission.isRevoked) {
    return { valid: false, reason: "Permission has been revoked" };
  }

  // Check if expired
  if (new Date() > permission.expiresAt) {
    return { valid: false, reason: "Permission has expired" };
  }

  // Check if verifier matches
  if (permission.sharedWith !== "public" && permission.sharedWith !== verifierAddress) {
    return { valid: false, reason: "Not authorized to view this credential" };
  }

  // Verify signature
  const dataToSign = `${permission.credentialId}:${permission.ownerAddress}:${permission.sharedWith}:${permission.fields.join(",")}:${permission.expiresAt.getTime()}`;
  const expectedSignature = createHash("sha256").update(dataToSign).digest("hex");

  if (permission.signature !== expectedSignature) {
    return { valid: false, reason: "Invalid signature" };
  }

  return { valid: true };
}

/**
 * Filter credential data based on sharing permission
 */
export function applySelectiveDisclosure<T extends Record<string, any>>(
  credentialData: T,
  allowedFields: string[]
): Partial<T> {
  const disclosed: Partial<T> = {};

  for (const field of allowedFields) {
    if (field in credentialData) {
      disclosed[field as keyof T] = credentialData[field];
    }
  }

  return disclosed;
}

/**
 * Create a zero-knowledge proof of credential ownership
 * (Simplified version - in production, use proper ZK-SNARK libraries)
 */
export function createOwnershipProof(
  credentialId: number,
  ownerAddress: string,
  secret: string
): string {
  const data = `${credentialId}:${ownerAddress}:${secret}`;
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Verify ownership proof
 */
export function verifyOwnershipProof(
  proof: string,
  credentialId: number,
  ownerAddress: string,
  secret: string
): boolean {
  const expectedProof = createOwnershipProof(credentialId, ownerAddress, secret);
  return proof === expectedProof;
}

/**
 * Generate disclosure proof
 */
export function generateDisclosureProof(
  credentialId: number,
  fields: Record<string, any>,
  verifierAddress: string
): DisclosureProof {
  const fieldsString = JSON.stringify(fields);
  const proofHash = createHash("sha256")
    .update(`${credentialId}:${fieldsString}:${verifierAddress}`)
    .digest("hex");

  return {
    credentialId,
    fields,
    proofHash,
    timestamp: new Date(),
    verifierAddress,
  };
}

/**
 * Privacy presets for common use cases
 */
export const PRIVACY_PRESETS = {
  minimal: {
    name: "Minimal Disclosure",
    description: "Share only credential type and institution",
    fields: ["credentialType", "institution", "issueDate"],
  },
  standard: {
    name: "Standard Disclosure",
    description: "Share basic credential information",
    fields: [
      "name",
      "description",
      "credentialType",
      "institution",
      "issueDate",
      "expiryDate",
      "isRevoked",
    ],
  },
  full: {
    name: "Full Disclosure",
    description: "Share all credential information",
    fields: Object.keys(DISCLOSABLE_FIELDS),
  },
  employment: {
    name: "Employment Verification",
    description: "Share information relevant for job applications",
    fields: [
      "name",
      "institution",
      "credentialType",
      "issueDate",
      "skills",
      "proficiencyLevel",
      "isRevoked",
    ],
  },
  education: {
    name: "Education Verification",
    description: "Share information for academic purposes",
    fields: [
      "name",
      "description",
      "institution",
      "credentialType",
      "issueDate",
      "expiryDate",
      "transactionHash",
    ],
  },
} as const;

/**
 * Get recommended fields for a purpose
 */
export function getRecommendedFields(purpose: string): string[] {
  const purposeLower = purpose.toLowerCase();

  if (purposeLower.includes("job") || purposeLower.includes("employment")) {
    return PRIVACY_PRESETS.employment.fields;
  }

  if (purposeLower.includes("education") || purposeLower.includes("academic")) {
    return PRIVACY_PRESETS.education.fields;
  }

  if (purposeLower.includes("minimal") || purposeLower.includes("basic")) {
    return PRIVACY_PRESETS.minimal.fields;
  }

  return PRIVACY_PRESETS.standard.fields;
}

/**
 * Audit log entry for disclosure
 */
export interface DisclosureAuditLog {
  id: string;
  credentialId: number;
  ownerAddress: string;
  verifierAddress: string;
  fieldsShared: string[];
  purpose: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create audit log entry
 */
export function createAuditLog(
  credentialId: number,
  ownerAddress: string,
  verifierAddress: string,
  fieldsShared: string[],
  purpose: string
): DisclosureAuditLog {
  return {
    id: randomBytes(16).toString("hex"),
    credentialId,
    ownerAddress,
    verifierAddress,
    fieldsShared,
    purpose,
    timestamp: new Date(),
  };
}

/**
 * Check if field is sensitive
 */
export function isFieldSensitive(field: string): boolean {
  return DISCLOSABLE_FIELDS[field as keyof typeof DISCLOSABLE_FIELDS]?.sensitive ?? false;
}

/**
 * Get field label
 */
export function getFieldLabel(field: string): string {
  return DISCLOSABLE_FIELDS[field as keyof typeof DISCLOSABLE_FIELDS]?.label ?? field;
}
