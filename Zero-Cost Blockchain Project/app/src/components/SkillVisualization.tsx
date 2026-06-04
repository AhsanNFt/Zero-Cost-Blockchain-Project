import { useMemo } from "react";
import { Code, Database, Cloud, Shield, Palette, Briefcase, TrendingUp } from "lucide-react";

interface Skill {
  name: string;
  level: number; // 1-8 (EQF levels)
  category: string;
  count: number; // Number of credentials with this skill
}

interface SkillVisualizationProps {
  credentials: Array<{
    name: string;
    description?: string;
    credentialType: string;
  }>;
}

export default function SkillVisualization({ credentials }: SkillVisualizationProps) {
  // Extract skills from credentials (simplified - in production, use actual skill data)
  const skills = useMemo(() => {
    const skillMap = new Map<string, Skill>();

    credentials.forEach((cred) => {
      // Extract skills from credential name and description
      const text = `${cred.name} ${cred.description || ""}`.toLowerCase();

      // Common tech skills (simplified extraction)
      const skillPatterns = [
        { name: "JavaScript", category: "Programming", keywords: ["javascript", "js", "node"] },
        { name: "TypeScript", category: "Programming", keywords: ["typescript", "ts"] },
        { name: "Python", category: "Programming", keywords: ["python", "py", "django", "flask"] },
        { name: "React", category: "Frontend", keywords: ["react", "reactjs"] },
        { name: "Node.js", category: "Backend", keywords: ["node", "nodejs", "express"] },
        { name: "SQL", category: "Database", keywords: ["sql", "mysql", "postgres"] },
        { name: "MongoDB", category: "Database", keywords: ["mongodb", "mongo", "nosql"] },
        { name: "AWS", category: "Cloud", keywords: ["aws", "amazon web services", "cloud"] },
        { name: "Docker", category: "DevOps", keywords: ["docker", "container"] },
        { name: "Kubernetes", category: "DevOps", keywords: ["kubernetes", "k8s"] },
        { name: "Git", category: "Tools", keywords: ["git", "github", "version control"] },
        { name: "Blockchain", category: "Web3", keywords: ["blockchain", "ethereum", "web3"] },
        { name: "Smart Contracts", category: "Web3", keywords: ["smart contract", "solidity"] },
        { name: "Machine Learning", category: "AI", keywords: ["machine learning", "ml", "ai"] },
        { name: "Data Analysis", category: "Data", keywords: ["data analysis", "analytics"] },
        { name: "UI/UX Design", category: "Design", keywords: ["ui", "ux", "design", "figma"] },
        { name: "Cybersecurity", category: "Security", keywords: ["security", "cybersecurity"] },
        { name: "Project Management", category: "Management", keywords: ["project management", "agile", "scrum"] },
      ];

      skillPatterns.forEach((pattern) => {
        if (pattern.keywords.some((keyword) => text.includes(keyword))) {
          const existing = skillMap.get(pattern.name);
          if (existing) {
            existing.count++;
          } else {
            skillMap.set(pattern.name, {
              name: pattern.name,
              level: Math.min(8, Math.floor(Math.random() * 3) + 4), // Random level 4-6 for demo
              category: pattern.category,
              count: 1,
            });
          }
        }
      });
    });

    return Array.from(skillMap.values()).sort((a, b) => b.count - a.count);
  }, [credentials]);

  const categories = useMemo(() => {
    const catMap = new Map<string, number>();
    skills.forEach((skill) => {
      catMap.set(skill.category, (catMap.get(skill.category) || 0) + skill.count);
    });
    return Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [skills]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "programming":
      case "frontend":
      case "backend":
        return Code;
      case "database":
      case "data":
        return Database;
      case "cloud":
      case "devops":
        return Cloud;
      case "security":
        return Shield;
      case "design":
        return Palette;
      case "management":
        return Briefcase;
      default:
        return TrendingUp;
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 7) return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    if (level >= 5) return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    if (level >= 3) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  };

  const getLevelLabel = (level: number) => {
    const labels = [
      "Basic",
      "Foundation",
      "Intermediate",
      "Advanced",
      "Specialist",
      "Expert",
      "Master",
      "Authority",
    ];
    return labels[level - 1] || "Unknown";
  };

  if (skills.length === 0) {
    return (
      <div className="liquid-glass rounded-3xl p-8 text-center">
        <Code className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-sm font-extralight text-white/40">
          No skills detected yet. Issue more credentials to build your skill portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Skill Cloud */}
      <div className="liquid-glass rounded-3xl p-6">
        <h3 className="text-lg font-light text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Skill Cloud
        </h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => {
            const size = Math.min(24, 12 + skill.count * 2);
            return (
              <div
                key={skill.name}
                className={`px-4 py-2 rounded-full border ${getLevelColor(skill.level)} transition-all hover:scale-110 cursor-pointer`}
                style={{ fontSize: `${size}px` }}
                title={`${skill.name} - Level ${skill.level} (${getLevelLabel(skill.level)}) - ${skill.count} credential(s)`}
              >
                {skill.name}
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills by Category */}
      <div className="liquid-glass rounded-3xl p-6">
        <h3 className="text-lg font-light text-white mb-4">Skills by Category</h3>
        <div className="space-y-4">
          {categories.map(([category, count]) => {
            const Icon = getCategoryIcon(category);
            const categorySkills = skills.filter((s) => s.category === category);
            const totalCount = categorySkills.reduce((sum, s) => sum + s.count, 0);
            const percentage = (totalCount / credentials.length) * 100;

            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-light text-white">{category}</span>
                  </div>
                  <span className="text-sm font-extralight text-white/60">
                    {count} skill{count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 ml-6">
                  {categorySkills.map((skill) => (
                    <span
                      key={skill.name}
                      className="text-xs text-white/40 px-2 py-1 rounded-full bg-white/[0.02] border border-white/5"
                    >
                      {skill.name} (L{skill.level})
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Proficiency Levels */}
      <div className="liquid-glass rounded-3xl p-6">
        <h3 className="text-lg font-light text-white mb-4">Proficiency Distribution</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { range: "1-2", label: "Beginner", color: "amber" },
            { range: "3-4", label: "Intermediate", color: "emerald" },
            { range: "5-6", label: "Advanced", color: "blue" },
            { range: "7-8", label: "Expert", color: "purple" },
          ].map((level) => {
            const [min, max] = level.range.split("-").map(Number);
            const count = skills.filter((s) => s.level >= min && s.level <= max).length;
            return (
              <div
                key={level.range}
                className={`text-center p-4 rounded-2xl bg-${level.color}-500/5 border border-${level.color}-500/10`}
              >
                <div className={`text-2xl font-extralight text-${level.color}-400 mb-1`}>
                  {count}
                </div>
                <div className="text-xs font-extralight text-white/40">{level.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Skills */}
      <div className="liquid-glass rounded-3xl p-6">
        <h3 className="text-lg font-light text-white mb-4">Top Skills</h3>
        <div className="space-y-3">
          {skills.slice(0, 5).map((skill, index) => (
            <div key={skill.name} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-sm text-purple-400 font-light">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-light text-white">{skill.name}</span>
                  <span className="text-xs text-white/60">
                    Level {skill.level} - {getLevelLabel(skill.level)}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                    style={{ width: `${(skill.level / 8) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-white/40">{skill.count}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
