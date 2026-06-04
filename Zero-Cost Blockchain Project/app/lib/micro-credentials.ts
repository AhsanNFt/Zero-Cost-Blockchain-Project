/**
 * Micro-Credentials & Learning Pathways System
 * Covers the remaining industry gap: Micro-Credentials & Skill Stacking
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PathwayStep {
  stepId: string;
  title: string;
  description: string;
  skillCode: string; // maps to skill-taxonomy.ts codes
  credentialType: "course" | "bootcamp" | "workshop" | "certification" | "skillbadge";
  estimatedHours: number;
  level: 1 | 2 | 3 | 4 | 5; // 1=Beginner, 5=Expert
  badge: string; // emoji badge
  keywords: string[]; // for matching against credential names
}

export interface LearningPathway {
  pathwayId: string;
  name: string;
  description: string;
  icon: string; // emoji
  color: string; // tailwind gradient classes
  totalSteps: number;
  estimatedMonths: number;
  targetRole: string;
  industry: string;
  steps: PathwayStep[];
}

export interface PathwayProgress {
  pathway: LearningPathway;
  completedSteps: PathwayStep[];
  pendingSteps: PathwayStep[];
  progressPercent: number;
  nextStep: PathwayStep | null;
  earnedBadges: string[];
}

export interface MicroBadge {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt?: string;
  credentialTokenId?: number;
}

export interface CredentialRecord {
  name: string;
  institution: string;
  credentialType: string;
  tokenId: number;
  issueDate: string;
  isRevoked: boolean;
}

// ─── Pathway Definitions ──────────────────────────────────────────────────────

export const LEARNING_PATHWAYS: LearningPathway[] = [
  {
    pathwayId: "FULL-STACK",
    name: "Full-Stack Developer",
    description:
      "Master modern web development from frontend to backend, databases, and deployment.",
    icon: "🖥️",
    color: "from-blue-500 to-cyan-500",
    totalSteps: 8,
    estimatedMonths: 6,
    targetRole: "Full-Stack Engineer",
    industry: "Technology",
    steps: [
      {
        stepId: "FS-01",
        title: "HTML & CSS Fundamentals",
        description: "Build semantic, accessible web pages with modern CSS.",
        skillCode: "WEB-HTML",
        credentialType: "course",
        estimatedHours: 40,
        level: 1,
        badge: "🌐",
        keywords: ["html", "css", "web", "frontend", "markup"],
      },
      {
        stepId: "FS-02",
        title: "JavaScript Programming",
        description: "Core JS concepts: closures, promises, async/await, ES6+.",
        skillCode: "PROG-001",
        credentialType: "course",
        estimatedHours: 80,
        level: 2,
        badge: "⚡",
        keywords: ["javascript", "js", "programming", "scripting"],
      },
      {
        stepId: "FS-03",
        title: "React & Modern Frontend",
        description: "Build dynamic UIs with React, hooks, and state management.",
        skillCode: "WEB-001",
        credentialType: "course",
        estimatedHours: 100,
        level: 3,
        badge: "⚛️",
        keywords: ["react", "frontend", "component", "hooks", "redux"],
      },
      {
        stepId: "FS-04",
        title: "TypeScript Mastery",
        description: "Type-safe JavaScript for large-scale applications.",
        skillCode: "PROG-002",
        credentialType: "certification",
        estimatedHours: 60,
        level: 3,
        badge: "🔷",
        keywords: ["typescript", "ts", "type", "static"],
      },
      {
        stepId: "FS-05",
        title: "Node.js Backend",
        description: "Server-side JavaScript with Express, REST APIs, and middleware.",
        skillCode: "WEB-002",
        credentialType: "course",
        estimatedHours: 90,
        level: 3,
        badge: "🟢",
        keywords: ["node", "nodejs", "backend", "express", "server", "api"],
      },
      {
        stepId: "FS-06",
        title: "SQL & Database Design",
        description: "Relational databases, query optimization, and schema design.",
        skillCode: "DB-001",
        credentialType: "certification",
        estimatedHours: 60,
        level: 3,
        badge: "🗄️",
        keywords: ["sql", "mysql", "postgres", "database", "db", "query"],
      },
      {
        stepId: "FS-07",
        title: "Cloud & DevOps",
        description: "AWS, Docker, CI/CD pipelines, and deployment automation.",
        skillCode: "CLOUD-001",
        credentialType: "certification",
        estimatedHours: 80,
        level: 4,
        badge: "☁️",
        keywords: ["aws", "cloud", "docker", "devops", "deployment", "kubernetes"],
      },
      {
        stepId: "FS-08",
        title: "Full-Stack Capstone",
        description: "Build and deploy a complete production-grade application.",
        skillCode: "WEB-FULLSTACK",
        credentialType: "bootcamp",
        estimatedHours: 200,
        level: 5,
        badge: "🏆",
        keywords: ["fullstack", "full-stack", "capstone", "project", "bootcamp"],
      },
    ],
  },
  {
    pathwayId: "BLOCKCHAIN-ENG",
    name: "Blockchain Engineer",
    description:
      "From Ethereum fundamentals to deploying production-grade smart contracts and dApps.",
    icon: "⛓️",
    color: "from-purple-500 to-violet-600",
    totalSteps: 7,
    estimatedMonths: 5,
    targetRole: "Blockchain Developer",
    industry: "Web3 / DeFi",
    steps: [
      {
        stepId: "BC-01",
        title: "Blockchain Fundamentals",
        description: "Consensus mechanisms, cryptography, and distributed ledgers.",
        skillCode: "BC-001",
        credentialType: "course",
        estimatedHours: 40,
        level: 1,
        badge: "🔗",
        keywords: ["blockchain", "crypto", "distributed", "consensus", "ledger"],
      },
      {
        stepId: "BC-02",
        title: "Ethereum & Web3",
        description: "Ethereum architecture, wallets, transactions, and Web3.js.",
        skillCode: "BC-002",
        credentialType: "course",
        estimatedHours: 60,
        level: 2,
        badge: "🔷",
        keywords: ["ethereum", "eth", "web3", "wallet", "metamask"],
      },
      {
        stepId: "BC-03",
        title: "Solidity Smart Contracts",
        description: "Write, test, and deploy smart contracts on Ethereum.",
        skillCode: "PROG-SOL",
        credentialType: "course",
        estimatedHours: 100,
        level: 3,
        badge: "📜",
        keywords: ["solidity", "smart contract", "evm", "contract", "abi"],
      },
      {
        stepId: "BC-04",
        title: "DeFi Protocol Design",
        description: "Lending, AMMs, staking, and yield protocols.",
        skillCode: "BC-DEFI",
        credentialType: "certification",
        estimatedHours: 80,
        level: 4,
        badge: "💎",
        keywords: ["defi", "protocol", "lending", "amm", "liquidity", "yield"],
      },
      {
        stepId: "BC-05",
        title: "Smart Contract Security",
        description: "Auditing, reentrancy attacks, and secure coding patterns.",
        skillCode: "SEC-BC",
        credentialType: "certification",
        estimatedHours: 70,
        level: 4,
        badge: "🛡️",
        keywords: ["security", "audit", "reentrancy", "vulnerability", "pentest"],
      },
      {
        stepId: "BC-06",
        title: "NFT & Token Standards",
        description: "ERC-20, ERC-721, ERC-1155 and marketplace integrations.",
        skillCode: "BC-NFT",
        credentialType: "workshop",
        estimatedHours: 50,
        level: 3,
        badge: "🖼️",
        keywords: ["nft", "erc721", "erc20", "token", "opensea", "metadata"],
      },
      {
        stepId: "BC-07",
        title: "Full-Stack dApp",
        description: "End-to-end decentralized application with React + Ethers.js.",
        skillCode: "BC-DAPP",
        credentialType: "bootcamp",
        estimatedHours: 150,
        level: 5,
        badge: "🚀",
        keywords: ["dapp", "decentralized", "ethers", "frontend", "react", "blockchain"],
      },
    ],
  },
  {
    pathwayId: "DATA-SCIENCE",
    name: "Data Scientist",
    description:
      "Statistics, machine learning, deep learning, and production ML pipelines.",
    icon: "📊",
    color: "from-emerald-500 to-teal-500",
    totalSteps: 7,
    estimatedMonths: 7,
    targetRole: "Data Scientist / ML Engineer",
    industry: "AI / Analytics",
    steps: [
      {
        stepId: "DS-01",
        title: "Python for Data Science",
        description: "NumPy, Pandas, Matplotlib, and Jupyter workflows.",
        skillCode: "PROG-003",
        credentialType: "course",
        estimatedHours: 60,
        level: 1,
        badge: "🐍",
        keywords: ["python", "pandas", "numpy", "jupyter", "data"],
      },
      {
        stepId: "DS-02",
        title: "Statistics & Probability",
        description: "Descriptive stats, hypothesis testing, and probability distributions.",
        skillCode: "DATA-STAT",
        credentialType: "course",
        estimatedHours: 50,
        level: 2,
        badge: "📐",
        keywords: ["statistics", "probability", "hypothesis", "analysis", "math"],
      },
      {
        stepId: "DS-03",
        title: "Machine Learning Fundamentals",
        description: "Supervised, unsupervised, regression, classification, clustering.",
        skillCode: "AI-001",
        credentialType: "course",
        estimatedHours: 100,
        level: 3,
        badge: "🤖",
        keywords: ["machine learning", "ml", "sklearn", "model", "training"],
      },
      {
        stepId: "DS-04",
        title: "Deep Learning & Neural Networks",
        description: "CNNs, RNNs, transformers, and PyTorch/TensorFlow.",
        skillCode: "AI-DL",
        credentialType: "certification",
        estimatedHours: 120,
        level: 4,
        badge: "🧠",
        keywords: ["deep learning", "neural", "tensorflow", "pytorch", "cnn", "transformer"],
      },
      {
        stepId: "DS-05",
        title: "SQL & NoSQL Databases",
        description: "Data engineering: querying, pipelines, and data warehousing.",
        skillCode: "DB-002",
        credentialType: "course",
        estimatedHours: 50,
        level: 2,
        badge: "🗃️",
        keywords: ["sql", "nosql", "mongodb", "database", "query", "warehouse"],
      },
      {
        stepId: "DS-06",
        title: "MLOps & Model Deployment",
        description: "Productionize ML models with Docker, Kubernetes, and cloud platforms.",
        skillCode: "AI-MLOPS",
        credentialType: "certification",
        estimatedHours: 80,
        level: 4,
        badge: "⚙️",
        keywords: ["mlops", "deployment", "docker", "api", "production", "model serving"],
      },
      {
        stepId: "DS-07",
        title: "Data Science Capstone",
        description: "End-to-end ML project from data collection to deployment.",
        skillCode: "AI-CAP",
        credentialType: "bootcamp",
        estimatedHours: 160,
        level: 5,
        badge: "🏆",
        keywords: ["data science", "capstone", "project", "end-to-end"],
      },
    ],
  },
  {
    pathwayId: "CLOUD-ARCHITECT",
    name: "Cloud Architect",
    description:
      "Design and build scalable, resilient cloud-native systems on AWS, Azure, and GCP.",
    icon: "☁️",
    color: "from-amber-500 to-orange-500",
    totalSteps: 6,
    estimatedMonths: 5,
    targetRole: "Cloud / Solutions Architect",
    industry: "Cloud Computing",
    steps: [
      {
        stepId: "CA-01",
        title: "Linux & Networking",
        description: "OS fundamentals, TCP/IP, DNS, and system administration.",
        skillCode: "SYS-001",
        credentialType: "course",
        estimatedHours: 50,
        level: 1,
        badge: "🐧",
        keywords: ["linux", "networking", "tcp", "dns", "sysadmin", "bash"],
      },
      {
        stepId: "CA-02",
        title: "AWS Cloud Practitioner",
        description: "Core AWS services: EC2, S3, RDS, Lambda, and IAM.",
        skillCode: "CLOUD-001",
        credentialType: "certification",
        estimatedHours: 60,
        level: 2,
        badge: "🟠",
        keywords: ["aws", "amazon", "ec2", "s3", "lambda", "cloud practitioner"],
      },
      {
        stepId: "CA-03",
        title: "Docker & Containers",
        description: "Containerization, image building, and Docker Compose.",
        skillCode: "CLOUD-002",
        credentialType: "course",
        estimatedHours: 50,
        level: 3,
        badge: "🐳",
        keywords: ["docker", "container", "image", "compose", "registry"],
      },
      {
        stepId: "CA-04",
        title: "Kubernetes Orchestration",
        description: "Deploy and manage containerized apps at scale with K8s.",
        skillCode: "CLOUD-003",
        credentialType: "certification",
        estimatedHours: 80,
        level: 4,
        badge: "⎈",
        keywords: ["kubernetes", "k8s", "orchestration", "helm", "pod", "cluster"],
      },
      {
        stepId: "CA-05",
        title: "Infrastructure as Code",
        description: "Terraform, CloudFormation, and CI/CD automation.",
        skillCode: "CLOUD-004",
        credentialType: "certification",
        estimatedHours: 70,
        level: 4,
        badge: "🏗️",
        keywords: ["terraform", "iac", "cloudformation", "ci/cd", "automation"],
      },
      {
        stepId: "CA-06",
        title: "AWS Solutions Architect",
        description: "Design highly available, fault-tolerant architectures on AWS.",
        skillCode: "CLOUD-SAA",
        credentialType: "certification",
        estimatedHours: 120,
        level: 5,
        badge: "🏆",
        keywords: ["solutions architect", "aws certified", "architecture", "high availability"],
      },
    ],
  },
  {
    pathwayId: "CYBERSECURITY",
    name: "Cybersecurity Specialist",
    description:
      "From networking fundamentals to penetration testing and security operations.",
    icon: "🛡️",
    color: "from-red-500 to-rose-600",
    totalSteps: 6,
    estimatedMonths: 6,
    targetRole: "Security Engineer / Pen Tester",
    industry: "Cybersecurity",
    steps: [
      {
        stepId: "CS-01",
        title: "Networking Fundamentals",
        description: "OSI model, TCP/IP, firewalls, VPNs, and packet analysis.",
        skillCode: "NET-001",
        credentialType: "course",
        estimatedHours: 50,
        level: 1,
        badge: "🌐",
        keywords: ["networking", "tcp", "osi", "firewall", "vpn", "packet"],
      },
      {
        stepId: "CS-02",
        title: "Linux Security",
        description: "Hardening, privilege escalation, and file system security.",
        skillCode: "SEC-001",
        credentialType: "course",
        estimatedHours: 60,
        level: 2,
        badge: "🔐",
        keywords: ["linux", "security", "hardening", "privilege", "bash"],
      },
      {
        stepId: "CS-03",
        title: "Ethical Hacking",
        description: "Reconnaissance, exploitation, and post-exploitation techniques.",
        skillCode: "SEC-002",
        credentialType: "certification",
        estimatedHours: 100,
        level: 3,
        badge: "💀",
        keywords: ["ethical hacking", "pentest", "exploitation", "kali", "metasploit"],
      },
      {
        stepId: "CS-04",
        title: "Web Application Security",
        description: "OWASP Top 10, SQL injection, XSS, CSRF, and bug bounty.",
        skillCode: "SEC-003",
        credentialType: "certification",
        estimatedHours: 80,
        level: 4,
        badge: "🔍",
        keywords: ["web security", "owasp", "sql injection", "xss", "bug bounty"],
      },
      {
        stepId: "CS-05",
        title: "Security Operations (SOC)",
        description: "SIEM, threat hunting, incident response, and log analysis.",
        skillCode: "SEC-004",
        credentialType: "course",
        estimatedHours: 70,
        level: 4,
        badge: "👁️",
        keywords: ["soc", "siem", "incident response", "threat", "monitoring"],
      },
      {
        stepId: "CS-06",
        title: "CEH / OSCP Certification",
        description: "Industry-recognized penetration testing certification.",
        skillCode: "SEC-CERT",
        credentialType: "certification",
        estimatedHours: 150,
        level: 5,
        badge: "🏆",
        keywords: ["ceh", "oscp", "certified", "penetration testing", "security certification"],
      },
    ],
  },
];

// ─── Logic Functions ──────────────────────────────────────────────────────────

/**
 * Checks if a credential matches a pathway step based on keywords
 */
function credentialMatchesStep(
  credential: CredentialRecord,
  step: PathwayStep
): boolean {
  if (credential.isRevoked) return false;
  const searchText =
    `${credential.name} ${credential.institution} ${credential.credentialType}`.toLowerCase();
  return step.keywords.some((keyword) =>
    searchText.includes(keyword.toLowerCase())
  );
}

/**
 * Computes a user's progress through a specific pathway
 */
export function computePathwayProgress(
  credentials: CredentialRecord[],
  pathway: LearningPathway
): PathwayProgress {
  const completedSteps: PathwayStep[] = [];
  const pendingSteps: PathwayStep[] = [];

  for (const step of pathway.steps) {
    const matchingCredential = credentials.find((c) =>
      credentialMatchesStep(c, step)
    );
    if (matchingCredential) {
      completedSteps.push(step);
    } else {
      pendingSteps.push(step);
    }
  }

  const progressPercent =
    pathway.steps.length > 0
      ? Math.round((completedSteps.length / pathway.steps.length) * 100)
      : 0;

  const nextStep = pendingSteps[0] ?? null;
  const earnedBadges = completedSteps.map((s) => s.badge);

  return {
    pathway,
    completedSteps,
    pendingSteps,
    progressPercent,
    nextStep,
    earnedBadges,
  };
}

/**
 * Computes progress across all pathways
 */
export function computeAllPathwaysProgress(
  credentials: CredentialRecord[]
): PathwayProgress[] {
  return LEARNING_PATHWAYS.map((pathway) =>
    computePathwayProgress(credentials, pathway)
  );
}

/**
 * Returns pathways sorted by completion percentage (descending)
 */
export function getTopPathways(
  credentials: CredentialRecord[],
  limit = 3
): PathwayProgress[] {
  return computeAllPathwaysProgress(credentials)
    .sort((a, b) => b.progressPercent - a.progressPercent)
    .slice(0, limit);
}

/**
 * Generates micro-badges from all credentials across all pathways
 */
export function getEarnedMicroBadges(
  credentials: CredentialRecord[]
): MicroBadge[] {
  const badges: MicroBadge[] = [];

  for (const pathway of LEARNING_PATHWAYS) {
    for (const step of pathway.steps) {
      const matchingCred = credentials.find((c) =>
        credentialMatchesStep(c, step)
      );
      if (matchingCred) {
        badges.push({
          badgeId: step.stepId,
          name: step.title,
          description: step.description,
          icon: step.badge,
          color: pathway.color,
          earnedAt: matchingCred.issueDate,
          credentialTokenId: matchingCred.tokenId,
        });
      }
    }
  }

  return badges;
}

/**
 * Returns a summary of skill coverage across pathways
 */
export function getSkillCoverageSummary(credentials: CredentialRecord[]): {
  totalBadgesEarned: number;
  totalBadgesAvailable: number;
  coveragePercent: number;
  strongestPathway: string;
  credentialsMapped: number;
} {
  const allProgresses = computeAllPathwaysProgress(credentials);
  const totalBadgesAvailable = LEARNING_PATHWAYS.reduce(
    (sum, p) => sum + p.steps.length,
    0
  );
  const totalBadgesEarned = allProgresses.reduce(
    (sum, p) => sum + p.completedSteps.length,
    0
  );
  const strongestPathway =
    allProgresses.sort((a, b) => b.progressPercent - a.progressPercent)[0]
      ?.pathway.name ?? "None";

  const credentialsMapped = credentials.filter((c) =>
    LEARNING_PATHWAYS.some((pathway) =>
      pathway.steps.some((step) => credentialMatchesStep(c, step))
    )
  ).length;

  return {
    totalBadgesEarned,
    totalBadgesAvailable,
    coveragePercent:
      totalBadgesAvailable > 0
        ? Math.round((totalBadgesEarned / totalBadgesAvailable) * 100)
        : 0,
    strongestPathway,
    credentialsMapped,
  };
}
