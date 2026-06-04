/**
 * Skill Taxonomy System
 * Integrates multiple international standards for skill classification
 */

export type SkillFramework = "EQF" | "SFIA" | "ONET" | "IEEE" | "CUSTOM";
export type SkillLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface SkillTaxonomy {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  framework: SkillFramework;
  level?: SkillLevel;
  parentSkillId?: string;
  relatedSkills?: string[];
}

/**
 * European Qualifications Framework (EQF) Levels
 * https://europa.eu/europass/en/description-eight-eqf-levels
 */
export const EQF_LEVELS = {
  1: { name: "Basic", description: "Basic general knowledge" },
  2: { name: "Foundation", description: "Basic factual knowledge of a field" },
  3: { name: "Intermediate", description: "Knowledge of facts, principles, processes" },
  4: { name: "Advanced", description: "Factual and theoretical knowledge" },
  5: { name: "Specialist", description: "Comprehensive, specialized knowledge" },
  6: { name: "Expert", description: "Advanced knowledge, critical understanding" },
  7: { name: "Master", description: "Highly specialized knowledge" },
  8: { name: "Authority", description: "Knowledge at forefront of field" },
} as const;

/**
 * Skills Framework for the Information Age (SFIA)
 * Levels of responsibility
 */
export const SFIA_LEVELS = {
  1: { name: "Follow", description: "Works under close direction" },
  2: { name: "Assist", description: "Works under general direction" },
  3: { name: "Apply", description: "Works under general direction" },
  4: { name: "Enable", description: "Works under general direction" },
  5: { name: "Ensure/Advise", description: "Works under broad direction" },
  6: { name: "Initiate/Influence", description: "Has defined authority" },
  7: { name: "Set Strategy/Inspire", description: "Has full authority" },
} as const;

/**
 * Common Technology Skills Taxonomy
 */
export const TECH_SKILLS: SkillTaxonomy[] = [
  // Programming Languages
  {
    id: "PROG-001",
    code: "JS",
    name: "JavaScript",
    description: "JavaScript programming language",
    category: "Programming Languages",
    framework: "CUSTOM",
  },
  {
    id: "PROG-002",
    code: "TS",
    name: "TypeScript",
    description: "TypeScript programming language",
    category: "Programming Languages",
    framework: "CUSTOM",
    relatedSkills: ["PROG-001"],
  },
  {
    id: "PROG-003",
    code: "PY",
    name: "Python",
    description: "Python programming language",
    category: "Programming Languages",
    framework: "CUSTOM",
  },
  {
    id: "PROG-004",
    code: "JAVA",
    name: "Java",
    description: "Java programming language",
    category: "Programming Languages",
    framework: "CUSTOM",
  },
  {
    id: "PROG-005",
    code: "SOL",
    name: "Solidity",
    description: "Solidity smart contract language",
    category: "Programming Languages",
    framework: "CUSTOM",
    relatedSkills: ["BLOCK-001"],
  },

  // Web Development
  {
    id: "WEB-001",
    code: "REACT",
    name: "React",
    description: "React JavaScript library",
    category: "Web Development",
    framework: "CUSTOM",
    relatedSkills: ["PROG-001", "PROG-002"],
  },
  {
    id: "WEB-002",
    code: "NODE",
    name: "Node.js",
    description: "Node.js runtime environment",
    category: "Web Development",
    framework: "CUSTOM",
    relatedSkills: ["PROG-001"],
  },
  {
    id: "WEB-003",
    code: "HTML",
    name: "HTML",
    description: "HTML markup language",
    category: "Web Development",
    framework: "CUSTOM",
  },
  {
    id: "WEB-004",
    code: "CSS",
    name: "CSS",
    description: "CSS styling language",
    category: "Web Development",
    framework: "CUSTOM",
  },

  // Blockchain
  {
    id: "BLOCK-001",
    code: "ETH",
    name: "Ethereum",
    description: "Ethereum blockchain development",
    category: "Blockchain",
    framework: "CUSTOM",
  },
  {
    id: "BLOCK-002",
    code: "WEB3",
    name: "Web3",
    description: "Web3 development",
    category: "Blockchain",
    framework: "CUSTOM",
    relatedSkills: ["BLOCK-001"],
  },
  {
    id: "BLOCK-003",
    code: "SMART",
    name: "Smart Contracts",
    description: "Smart contract development",
    category: "Blockchain",
    framework: "CUSTOM",
    relatedSkills: ["BLOCK-001", "PROG-005"],
  },

  // Databases
  {
    id: "DB-001",
    code: "SQL",
    name: "SQL",
    description: "SQL database management",
    category: "Databases",
    framework: "CUSTOM",
  },
  {
    id: "DB-002",
    code: "NOSQL",
    name: "NoSQL",
    description: "NoSQL database management",
    category: "Databases",
    framework: "CUSTOM",
  },
  {
    id: "DB-003",
    code: "MYSQL",
    name: "MySQL",
    description: "MySQL database",
    category: "Databases",
    framework: "CUSTOM",
    relatedSkills: ["DB-001"],
  },

  // Cloud & DevOps
  {
    id: "CLOUD-001",
    code: "AWS",
    name: "Amazon Web Services",
    description: "AWS cloud platform",
    category: "Cloud Computing",
    framework: "CUSTOM",
  },
  {
    id: "CLOUD-002",
    code: "DOCKER",
    name: "Docker",
    description: "Docker containerization",
    category: "DevOps",
    framework: "CUSTOM",
  },
  {
    id: "CLOUD-003",
    code: "K8S",
    name: "Kubernetes",
    description: "Kubernetes orchestration",
    category: "DevOps",
    framework: "CUSTOM",
    relatedSkills: ["CLOUD-002"],
  },

  // Data Science
  {
    id: "DATA-001",
    code: "ML",
    name: "Machine Learning",
    description: "Machine learning and AI",
    category: "Data Science",
    framework: "CUSTOM",
    relatedSkills: ["PROG-003"],
  },
  {
    id: "DATA-002",
    code: "ANALYTICS",
    name: "Data Analytics",
    description: "Data analysis and visualization",
    category: "Data Science",
    framework: "CUSTOM",
  },

  // Security
  {
    id: "SEC-001",
    code: "CYBERSEC",
    name: "Cybersecurity",
    description: "Cybersecurity practices",
    category: "Security",
    framework: "CUSTOM",
  },
  {
    id: "SEC-002",
    code: "PENTEST",
    name: "Penetration Testing",
    description: "Security testing and penetration testing",
    category: "Security",
    framework: "CUSTOM",
    relatedSkills: ["SEC-001"],
  },
];

export const SKILL_TAXONOMY_DB = TECH_SKILLS;

/**
 * Skill Categories
 */
export const SKILL_CATEGORIES = [
  "Programming Languages",
  "Web Development",
  "Mobile Development",
  "Blockchain",
  "Databases",
  "Cloud Computing",
  "DevOps",
  "Data Science",
  "Machine Learning",
  "Security",
  "UI/UX Design",
  "Project Management",
  "Business Analysis",
  "Quality Assurance",
  "System Architecture",
] as const;

/**
 * Get skill by ID
 */
export function getSkillById(id: string): SkillTaxonomy | undefined {
  return TECH_SKILLS.find((skill) => skill.id === id);
}

/**
 * Get skill by code
 */
export function getSkillByCode(code: string): SkillTaxonomy | undefined {
  return TECH_SKILLS.find((skill) => skill.code === code);
}

/**
 * Search skills by name or description
 */
export function searchSkills(query: string): SkillTaxonomy[] {
  const lowerQuery = query.toLowerCase();
  return TECH_SKILLS.filter(
    (skill) =>
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery) ||
      skill.code.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get skills by category
 */
export function getSkillsByCategory(category: string): SkillTaxonomy[] {
  return TECH_SKILLS.filter((skill) => skill.category === category);
}

/**
 * Get related skills
 */
export function getRelatedSkills(skillId: string): SkillTaxonomy[] {
  const skill = getSkillById(skillId);
  if (!skill || !skill.relatedSkills) return [];

  return skill.relatedSkills
    .map((id) => getSkillById(id))
    .filter((s): s is SkillTaxonomy => s !== undefined);
}

/**
 * Get skill level description
 */
export function getSkillLevelDescription(
  level: SkillLevel,
  framework: "EQF" | "SFIA" = "EQF"
): string {
  if (framework === "EQF") {
    return EQF_LEVELS[level]?.description || "Unknown level";
  } else {
    return SFIA_LEVELS[level as 1 | 2 | 3 | 4 | 5 | 6 | 7]?.description || "Unknown level";
  }
}

/**
 * Validate skill level
 */
export function isValidSkillLevel(level: number, framework: "EQF" | "SFIA" = "EQF"): boolean {
  if (framework === "EQF") {
    return level >= 1 && level <= 8;
  } else {
    return level >= 1 && level <= 7;
  }
}
