import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { skills, credentialSkills, credentials } from "@db/schema";
import { eq, like, inArray, sql } from "drizzle-orm";
import {
  SKILL_TAXONOMY_DB,
  searchSkills,
  getSkillById,
  getSkillsByCategory,
  getSkillLevelDescription,
  type SkillFramework,
  type SkillLevel,
} from "@db/skill-taxonomy";

/**
 * Skills API Router
 * Provides skill taxonomy and credential-skill mapping
 */

export const skillsRouter = createRouter({
  /**
   * Search skills by keyword
   */
  search: publicQuery
    .input(
      z.object({
        query: z.string().min(1),
        category: z.string().optional(),
        framework: z.enum(["EQF", "SFIA", "ONET", "CUSTOM"]).optional(),
        limit: z.number().int().positive().max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      let results = searchSkills(input.query);

      // Filter by category if specified
      if (input.category) {
        results = results.filter((skill) => skill.category === input.category);
      }

      // Filter by framework if specified
      if (input.framework) {
        results = results.filter((skill) => skill.framework === input.framework);
      }

      // Limit results
      results = results.slice(0, input.limit);

      return {
        success: true,
        query: input.query,
        totalResults: results.length,
        skills: results,
      };
    }),

  /**
   * Get skill by ID
   */
  getById: publicQuery
    .input(
      z.object({
        skillId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const skill = getSkillById(input.skillId);

      if (!skill) {
        return {
          success: false,
          error: "Skill not found",
        };
      }

      return {
        success: true,
        skill,
      };
    }),

  /**
   * Get all skill categories
   */
  getCategories: publicQuery.query(async () => {
    const categories = [...new Set(SKILL_TAXONOMY_DB.map((skill) => skill.category))];

    return {
      success: true,
      categories: categories.map((category) => ({
        name: category,
        count: SKILL_TAXONOMY_DB.filter((skill) => skill.category === category).length,
      })),
    };
  }),

  /**
   * Get skills by category
   */
  getByCategory: publicQuery
    .input(
      z.object({
        category: z.string(),
      })
    )
    .query(async ({ input }) => {
      const skills = getSkillsByCategory(input.category);

      return {
        success: true,
        category: input.category,
        totalSkills: skills.length,
        skills,
      };
    }),

  /**
   * Get skill level description
   */
  getLevelDescription: publicQuery
    .input(
      z.object({
        framework: z.enum(["EQF", "SFIA", "ONET", "CUSTOM"]),
        level: z.number().int().min(1).max(8),
      })
    )
    .query(async ({ input }) => {
      const description = getSkillLevelDescription(
        input.framework as SkillFramework,
        input.level as SkillLevel
      );

      return {
        success: true,
        framework: input.framework,
        level: input.level,
        description,
      };
    }),

  /**
   * Get skills for a credential
   */
  getCredentialSkills: publicQuery
    .input(
      z.object({
        credentialId: z.number().int().positive(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      // Get credential skills from database
      const credSkills = await db
        .select()
        .from(credentialSkills)
        .where(eq(credentialSkills.credentialId, BigInt(input.credentialId)));

      if (credSkills.length === 0) {
        return {
          success: true,
          credentialId: input.credentialId,
          skills: [],
        };
      }

      // Get skill details from taxonomy
      const skillIds = credSkills.map((cs) => cs.skillId.toString());
      const skillDetails = SKILL_TAXONOMY_DB.filter((skill) =>
        skillIds.includes(skill.id)
      );

      return {
        success: true,
        credentialId: input.credentialId,
        skills: credSkills.map((cs) => {
          const skillDetail = skillDetails.find((sd) => sd.id === cs.skillId.toString());
          return {
            ...skillDetail,
            proficiencyLevel: cs.proficiencyLevel,
            endorsedBy: cs.endorsedBy,
          };
        }),
      };
    }),

  /**
   * Get popular skills
   */
  getPopular: publicQuery
    .input(
      z.object({
        limit: z.number().int().positive().max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      // Get most used skills from credentials
      const popularSkills = await db
        .select({
          skillId: credentialSkills.skillId,
          count: sql<number>`count(*)`,
        })
        .from(credentialSkills)
        .groupBy(credentialSkills.skillId)
        .orderBy(sql`count(*) DESC`)
        .limit(input.limit);

      // Get skill details
      const skillDetails = popularSkills.map((ps) => {
        const skill = getSkillById(ps.skillId.toString());
        return {
          ...skill,
          usageCount: ps.count,
        };
      });

      return {
        success: true,
        skills: skillDetails,
      };
    }),

  /**
   * Get skill trends
   */
  getTrends: publicQuery
    .input(
      z.object({
        days: z.number().int().positive().default(30),
        limit: z.number().int().positive().max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      // Get trending skills (most issued in last N days)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.days);

      const trendingSkills = await db
        .select({
          skillId: credentialSkills.skillId,
          count: sql<number>`count(*)`,
        })
        .from(credentialSkills)
        .innerJoin(credentials, eq(credentialSkills.credentialId, credentials.id))
        .where(sql`${credentials.createdAt} >= ${cutoffDate}`)
        .groupBy(credentialSkills.skillId)
        .orderBy(sql`count(*) DESC`)
        .limit(input.limit);

      const skillDetails = trendingSkills.map((ts) => {
        const skill = getSkillById(ts.skillId.toString());
        return {
          ...skill,
          trendCount: ts.count,
        };
      });

      return {
        success: true,
        period: `Last ${input.days} days`,
        skills: skillDetails,
      };
    }),

  /**
   * Get skill pathways (learning paths)
   */
  getPathways: publicQuery
    .input(
      z.object({
        targetSkillId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const targetSkill = getSkillById(input.targetSkillId);

      if (!targetSkill) {
        return {
          success: false,
          error: "Skill not found",
        };
      }

      // Find prerequisite skills (parent skills)
      const prerequisites: typeof targetSkill[] = [];
      let currentSkill = targetSkill;

      while (currentSkill.parentSkillId) {
        const parentSkill = getSkillById(currentSkill.parentSkillId);
        if (parentSkill) {
          prerequisites.unshift(parentSkill);
          currentSkill = parentSkill;
        } else {
          break;
        }
      }

      // Find related skills
      const relatedSkills = targetSkill.relatedSkills
        ? targetSkill.relatedSkills.map((id) => getSkillById(id)).filter(Boolean)
        : [];

      // Find advanced skills (children)
      const advancedSkills = SKILL_TAXONOMY_DB.filter(
        (skill) => skill.parentSkillId === targetSkill.id
      );

      return {
        success: true,
        targetSkill,
        pathway: {
          prerequisites,
          current: targetSkill,
          related: relatedSkills,
          advanced: advancedSkills,
        },
      };
    }),

  /**
   * Get all frameworks
   */
  getFrameworks: publicQuery.query(async () => {
    return {
      success: true,
      frameworks: [
        {
          code: "EQF",
          name: "European Qualifications Framework",
          levels: 8,
          description: "EU standard for comparing qualifications",
        },
        {
          code: "SFIA",
          name: "Skills Framework for the Information Age",
          levels: 7,
          description: "Global skills framework for IT professionals",
        },
        {
          code: "ONET",
          name: "O*NET",
          levels: 5,
          description: "US Department of Labor occupational framework",
        },
        {
          code: "CUSTOM",
          name: "Custom Skills",
          levels: 5,
          description: "Platform-specific skill definitions",
        },
      ],
    };
  }),
});
