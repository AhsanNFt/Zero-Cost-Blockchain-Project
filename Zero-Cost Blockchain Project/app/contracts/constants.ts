import { CONTRACT_ADDRESS, SkillChainCredentialABI } from "./abi/SkillChainCredential";

export const Session = {
  cookieName: "kimi_sid",
  maxAgeMs: 365 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
  oauthCallback: "/api/oauth/callback",
} as const;

export const SKILLCHAIN_CONTRACT_ADDRESS = CONTRACT_ADDRESS;
export const SKILLCHAIN_ABI = SkillChainCredentialABI;
