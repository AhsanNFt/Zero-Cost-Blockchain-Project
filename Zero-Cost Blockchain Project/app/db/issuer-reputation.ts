/**
 * Issuer Reputation System
 * Tracks and scores credential issuers based on various metrics
 */

export interface IssuerReputation {
  issuerAddress: string;
  institutionName: string;
  reputationScore: number; // 0-100
  totalCredentialsIssued: number;
  totalRevoked: number;
  totalVerifications: number;
  verificationSuccessRate: number;
  averageCredentialLifespan: number; // in days
  endorsements: number;
  complaints: number;
  isVerified: boolean;
  verificationDate?: Date;
  tier: "bronze" | "silver" | "gold" | "platinum";
  badges: string[];
}

export interface IssuerMetrics {
  credentialsIssued: number;
  credentialsRevoked: number;
  revocationRate: number;
  verificationsPerformed: number;
  uniqueVerifiers: number;
  averageTimeToFirstVerification: number; // in hours
  endorsements: number;
  complaints: number;
}

/**
 * Calculate issuer reputation score
 * Score is based on multiple factors weighted by importance
 */
export function calculateReputationScore(metrics: IssuerMetrics): number {
  const weights = {
    volumeScore: 0.2, // Number of credentials issued
    qualityScore: 0.3, // Low revocation rate
    trustScore: 0.25, // High verification rate
    endorsementScore: 0.15, // Community endorsements
    longevityScore: 0.1, // Time in platform
  };

  // Volume Score (0-100): Based on credentials issued
  const volumeScore = Math.min(100, (metrics.credentialsIssued / 100) * 100);

  // Quality Score (0-100): Based on low revocation rate
  const revocationRate = metrics.credentialsRevoked / Math.max(metrics.credentialsIssued, 1);
  const qualityScore = Math.max(0, 100 - revocationRate * 200);

  // Trust Score (0-100): Based on verification activity
  const verificationRate = metrics.verificationsPerformed / Math.max(metrics.credentialsIssued, 1);
  const trustScore = Math.min(100, verificationRate * 50);

  // Endorsement Score (0-100): Based on endorsements vs complaints
  const netEndorsements = metrics.endorsements - metrics.complaints * 2;
  const endorsementScore = Math.max(0, Math.min(100, netEndorsements * 10));

  // Longevity Score: Would need creation date (placeholder)
  const longevityScore = 50; // Default mid-range

  // Calculate weighted total
  const totalScore =
    volumeScore * weights.volumeScore +
    qualityScore * weights.qualityScore +
    trustScore * weights.trustScore +
    endorsementScore * weights.endorsementScore +
    longevityScore * weights.longevityScore;

  return Math.round(Math.max(0, Math.min(100, totalScore)));
}

/**
 * Determine issuer tier based on reputation score
 */
export function getIssuerTier(score: number): "bronze" | "silver" | "gold" | "platinum" {
  if (score >= 90) return "platinum";
  if (score >= 75) return "gold";
  if (score >= 50) return "silver";
  return "bronze";
}

/**
 * Get badges earned by issuer
 */
export function getIssuerBadges(metrics: IssuerMetrics, isVerified: boolean): string[] {
  const badges: string[] = [];

  // Verification badge
  if (isVerified) {
    badges.push("verified");
  }

  // Volume badges
  if (metrics.credentialsIssued >= 1000) {
    badges.push("prolific-issuer");
  } else if (metrics.credentialsIssued >= 100) {
    badges.push("active-issuer");
  } else if (metrics.credentialsIssued >= 10) {
    badges.push("emerging-issuer");
  }

  // Quality badges
  const revocationRate = metrics.credentialsRevoked / Math.max(metrics.credentialsIssued, 1);
  if (revocationRate < 0.01 && metrics.credentialsIssued >= 50) {
    badges.push("quality-assured");
  }

  // Trust badges
  if (metrics.verificationsPerformed >= 500) {
    badges.push("highly-trusted");
  } else if (metrics.verificationsPerformed >= 100) {
    badges.push("trusted");
  }

  // Community badges
  if (metrics.endorsements >= 50) {
    badges.push("community-favorite");
  } else if (metrics.endorsements >= 10) {
    badges.push("community-endorsed");
  }

  // Engagement badges
  if (metrics.uniqueVerifiers >= 100) {
    badges.push("widely-recognized");
  }

  return badges;
}

/**
 * Badge descriptions
 */
export const BADGE_DESCRIPTIONS: Record<string, string> = {
  verified: "Officially verified institution",
  "prolific-issuer": "Issued 1000+ credentials",
  "active-issuer": "Issued 100+ credentials",
  "emerging-issuer": "Issued 10+ credentials",
  "quality-assured": "Less than 1% revocation rate",
  "highly-trusted": "500+ verifications performed",
  trusted: "100+ verifications performed",
  "community-favorite": "50+ community endorsements",
  "community-endorsed": "10+ community endorsements",
  "widely-recognized": "Recognized by 100+ verifiers",
};

/**
 * Tier benefits
 */
export const TIER_BENEFITS = {
  bronze: {
    maxCredentialsPerMonth: 50,
    apiRateLimit: 100,
    features: ["Basic issuance", "Standard verification"],
  },
  silver: {
    maxCredentialsPerMonth: 200,
    apiRateLimit: 500,
    features: ["Bulk issuance", "Analytics dashboard", "Custom branding"],
  },
  gold: {
    maxCredentialsPerMonth: 1000,
    apiRateLimit: 2000,
    features: [
      "Unlimited issuance",
      "Advanced analytics",
      "Custom branding",
      "Priority support",
      "API access",
    ],
  },
  platinum: {
    maxCredentialsPerMonth: -1, // Unlimited
    apiRateLimit: 10000,
    features: [
      "Unlimited issuance",
      "Advanced analytics",
      "White-label solution",
      "Dedicated support",
      "Full API access",
      "Custom integrations",
    ],
  },
} as const;

/**
 * Get reputation level description
 */
export function getReputationDescription(score: number): string {
  if (score >= 90) return "Exceptional - Top-tier institution with outstanding track record";
  if (score >= 75) return "Excellent - Highly reputable institution with strong credentials";
  if (score >= 60) return "Good - Reliable institution with solid performance";
  if (score >= 40) return "Fair - Developing institution with room for improvement";
  return "New - Recently joined institution building reputation";
}

/**
 * Calculate trust indicators
 */
export interface TrustIndicators {
  isVerified: boolean;
  reputationScore: number;
  tier: string;
  credentialsIssued: number;
  revocationRate: number;
  verificationRate: number;
  badges: string[];
  trustLevel: "high" | "medium" | "low";
}

export function getTrustIndicators(reputation: IssuerReputation): TrustIndicators {
  const revocationRate = reputation.totalRevoked / Math.max(reputation.totalCredentialsIssued, 1);
  const verificationRate =
    reputation.totalVerifications / Math.max(reputation.totalCredentialsIssued, 1);

  let trustLevel: "high" | "medium" | "low" = "low";
  if (reputation.reputationScore >= 75 && reputation.isVerified) {
    trustLevel = "high";
  } else if (reputation.reputationScore >= 50) {
    trustLevel = "medium";
  }

  return {
    isVerified: reputation.isVerified,
    reputationScore: reputation.reputationScore,
    tier: reputation.tier,
    credentialsIssued: reputation.totalCredentialsIssued,
    revocationRate,
    verificationRate,
    badges: reputation.badges,
    trustLevel,
  };
}
