import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  date,
  bigint,
  json,
  int,
} from "drizzle-orm/mysql-core";

// OAuth users (from Kimi auth system)
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

// Web3 wallet users
export const walletUsers = mysqlTable("wallet_users", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }),
  role: mysqlEnum("role", ["learner", "issuer", "admin"])
    .default("learner")
    .notNull(),
  isAuthorizedIssuer: boolean("is_authorized_issuer").default(false),
  institutionName: varchar("institution_name", { length: 200 }),
  profileImage: varchar("profile_image", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Credentials issued on blockchain
export const credentials = mysqlTable("credentials", {
  id: serial("id").primaryKey(),
  tokenId: bigint("token_id", { mode: "number", unsigned: true }).notNull().unique(),
  contractAddress: varchar("contract_address", { length: 42 }).notNull(),
  recipientAddress: varchar("recipient_address", { length: 42 }).notNull(),
  issuerAddress: varchar("issuer_address", { length: 42 }).notNull(),
  metadataUri: varchar("metadata_uri", { length: 200 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  institution: varchar("institution", { length: 200 }).notNull(),
  credentialType: mysqlEnum("credential_type", [
    "course",
    "bootcamp",
    "workshop",
    "certification",
    "skillbadge",
  ]).notNull(),
  description: text("description"),
  imageCid: varchar("image_cid", { length: 100 }),
  issueDate: date("issue_date").notNull(),
  expiryDate: date("expiry_date"),
  isRevoked: boolean("is_revoked").default(false),
  transactionHash: varchar("transaction_hash", { length: 66 }).notNull(),
  blockNumber: bigint("block_number", { mode: "number", unsigned: true }),
  network: varchar("network", { length: 20 }).default("sepolia"),
  chainId: bigint("chain_id", { mode: "number" }).default(11155111),
  networkName: varchar("network_name", { length: 100 }).default("Ethereum Sepolia"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Verification attempts logged
export const verifications = mysqlTable("verifications", {
  id: serial("id").primaryKey(),
  credentialId: bigint("credential_id", { mode: "number", unsigned: true }).notNull(),
  verifierAddress: varchar("verifier_address", { length: 42 }),
  isValid: boolean("is_valid").notNull(),
  verifiedAt: timestamp("verified_at").defaultNow().notNull(),
});

// Activity log
export const activityLog = mysqlTable("activity_log", {
  id: serial("id").primaryKey(),
  userAddress: varchar("user_address", { length: 42 }).notNull(),
  action: mysqlEnum("action", ["issue", "receive", "verify", "connect", "revoke"]).notNull(),
  details: json("details"),
  transactionHash: varchar("transaction_hash", { length: 66 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type WalletUser = typeof walletUsers.$inferSelect;
export type InsertWalletUser = typeof walletUsers.$inferInsert;
export type Credential = typeof credentials.$inferSelect;
export type InsertCredential = typeof credentials.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type InsertVerification = typeof verifications.$inferInsert;
export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

// Skill taxonomy tables
export const skills = mysqlTable("skills", {
  id: serial("id").primaryKey(),
  skillCode: varchar("skill_code", { length: 50 }).notNull().unique(),
  skillName: varchar("skill_name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  framework: mysqlEnum("framework", ["EQF", "SFIA", "ONET", "CUSTOM"]).notNull(),
  level: int("level"), // 1-8 for EQF, 1-7 for SFIA
  parentSkillId: bigint("parent_skill_id", { mode: "number", unsigned: true }),
  keywords: json("keywords").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const credentialSkills = mysqlTable("credential_skills", {
  id: serial("id").primaryKey(),
  credentialId: bigint("credential_id", { mode: "number", unsigned: true }).notNull(),
  skillId: bigint("skill_id", { mode: "number", unsigned: true }).notNull(),
  proficiencyLevel: int("proficiency_level"), // 1-5 scale
  endorsedBy: varchar("endorsed_by", { length: 42 }), // Wallet address of endorser
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;
export type CredentialSkill = typeof credentialSkills.$inferSelect;
export type InsertCredentialSkill = typeof credentialSkills.$inferInsert;
