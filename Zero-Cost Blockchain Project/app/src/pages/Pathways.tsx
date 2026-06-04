import { useState, useMemo } from "react";
import { Link } from "react-router";
import Layout from "@/components/layout/Layout";
import { useWallet } from "@/hooks/useWallet";
import { trpc } from "@/providers/trpc";
import {
  computeAllPathwaysProgress,
  getEarnedMicroBadges,
  getSkillCoverageSummary,
  LEARNING_PATHWAYS,
  type PathwayProgress,
  type CredentialRecord,
} from "../../lib/micro-credentials";
import {
  Map,
  Trophy,
  Star,
  ChevronRight,
  Loader2,
  CheckCircle,
  Clock,
  Zap,
  ArrowRight,
  Target,
  Award,
  BookOpen,
  TrendingUp,
  Layers,
} from "lucide-react";

// ─── Progress Ring SVG ────────────────────────────────────────────────────────

function ProgressRing({
  percent,
  size = 80,
  stroke = 6,
  color = "#a78bfa",
}: {
  percent: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={stroke}
        fill="none"
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

// ─── Pathway Card ─────────────────────────────────────────────────────────────

function PathwayCard({
  progress,
  isSelected,
  onClick,
}: {
  progress: PathwayProgress;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { pathway, progressPercent, completedSteps, earnedBadges } = progress;

  const ringColor =
    progressPercent === 100
      ? "#34d399"
      : progressPercent > 50
      ? "#a78bfa"
      : "#60a5fa";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left liquid-glass rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 group border ${
        isSelected
          ? "border-purple-500/40 bg-purple-500/5"
          : "border-white/5 hover:border-white/10"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{pathway.icon}</div>
          <div>
            <h3 className="text-base font-light text-white">{pathway.name}</h3>
            <p className="text-xs font-extralight text-white/40 mt-0.5">
              {pathway.industry}
            </p>
          </div>
        </div>
        {/* Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <ProgressRing percent={progressPercent} size={64} stroke={5} color={ringColor} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-light text-white">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Steps bar */}
      <div className="flex gap-1 mb-4">
        {pathway.steps.map((step, i) => {
          const done = i < completedSteps.length;
          return (
            <div
              key={step.stepId}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                done ? "bg-purple-500" : "bg-white/10"
              }`}
              style={{ transitionDelay: `${i * 50}ms` }}
            />
          );
        })}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            {completedSteps.length}/{pathway.steps.length}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {pathway.estimatedMonths}mo
          </span>
        </div>

        {/* Earned badges */}
        {earnedBadges.length > 0 && (
          <div className="flex gap-0.5">
            {earnedBadges.slice(0, 5).map((badge, i) => (
              <span key={i} className="text-sm">
                {badge}
              </span>
            ))}
            {earnedBadges.length > 5 && (
              <span className="text-[10px] text-white/40 ml-1">
                +{earnedBadges.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Active arrow */}
      <div
        className={`flex items-center gap-1 mt-4 text-xs font-light transition-colors ${
          isSelected ? "text-purple-400" : "text-white/20 group-hover:text-white/40"
        }`}
      >
        View details <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </button>
  );
}

// ─── Pathway Detail Panel ─────────────────────────────────────────────────────

function PathwayDetailPanel({ progress }: { progress: PathwayProgress }) {
  const { pathway, completedSteps, pendingSteps, nextStep, progressPercent } = progress;

  return (
    <div className="liquid-glass rounded-3xl p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="text-5xl">{pathway.icon}</div>
        <div>
          <h2 className="text-2xl font-extralight text-white">{pathway.name}</h2>
          <p className="text-sm font-extralight text-white/50 mt-1">
            {pathway.description}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
              {pathway.targetRole}
            </span>
            <span className="text-xs text-white/40">
              ~{pathway.estimatedMonths} months · {pathway.steps.length} credentials
            </span>
          </div>
        </div>
      </div>

      {/* Next Step CTA */}
      {nextStep && progressPercent < 100 && (
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-violet-500/5 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-light text-amber-400 uppercase tracking-wider">
              Next Step
            </span>
          </div>
          <p className="text-lg font-light text-white mb-1">
            {nextStep.badge} {nextStep.title}
          </p>
          <p className="text-sm font-extralight text-white/50 mb-4">
            {nextStep.description}
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Clock className="w-3 h-3" /> ~{nextStep.estimatedHours}h
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-light ${
                nextStep.level <= 2
                  ? "bg-emerald-500/10 text-emerald-400"
                  : nextStep.level === 3
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              Level {nextStep.level}
            </span>
            <a
              href={`/issue`}
              className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs font-light hover:brightness-110 transition-all"
            >
              Earn This <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {progressPercent === 100 && (
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 flex items-center gap-4">
          <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <p className="text-base font-light text-white">Pathway Complete! 🎉</p>
            <p className="text-sm font-extralight text-white/50">
              You have completed all {pathway.steps.length} credentials in this pathway.
            </p>
          </div>
        </div>
      )}

      {/* Step-by-step list */}
      <div>
        <h3 className="text-sm font-light text-white/60 uppercase tracking-wider mb-4">
          Credential Steps
        </h3>
        <div className="space-y-3">
          {pathway.steps.map((step, idx) => {
            const isComplete = completedSteps.some((s) => s.stepId === step.stepId);
            const isPending = pendingSteps.some((s) => s.stepId === step.stepId);
            const isNext = nextStep?.stepId === step.stepId;

            return (
              <div
                key={step.stepId}
                className={`flex items-start gap-4 p-4 rounded-2xl transition-all ${
                  isComplete
                    ? "bg-emerald-500/5 border border-emerald-500/10"
                    : isNext
                    ? "bg-purple-500/5 border border-purple-500/20"
                    : "bg-white/[0.01] border border-white/5"
                }`}
              >
                {/* Step Number / Check */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base ${
                    isComplete
                      ? "bg-emerald-500/20 border border-emerald-500/30"
                      : isNext
                      ? "bg-purple-500/20 border border-purple-500/30"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-xs font-light text-white/40">{idx + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{step.badge}</span>
                    <p
                      className={`text-sm font-light ${
                        isComplete ? "text-white" : isPending && !isNext ? "text-white/50" : "text-white"
                      }`}
                    >
                      {step.title}
                    </p>
                    {isNext && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[10px] text-purple-300">
                        Next
                      </span>
                    )}
                    {isComplete && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] text-emerald-400">
                        Earned
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-extralight text-white/40">
                    {step.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-white/30">
                      ~{step.estimatedHours}h
                    </span>
                    <span className="text-[10px] text-white/30 capitalize">
                      {step.credentialType}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Pathways() {
  const { isConnected, address } = useWallet();
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>(
    LEARNING_PATHWAYS[0].pathwayId
  );
  const [activeTab, setActiveTab] = useState<"pathways" | "badges">("pathways");

  const credsQuery = trpc.credential.list.useQuery(
    { owner: address ?? undefined, limit: 200 },
    { enabled: !!address }
  );

  // Map API credentials to our CredentialRecord shape
  const credentials: CredentialRecord[] = useMemo(
    () =>
      (credsQuery.data?.items ?? []).map((c) => ({
        name: c.name,
        institution: c.institution,
        credentialType: c.credentialType,
        tokenId: c.tokenId,
        issueDate: c.issueDate instanceof Date ? c.issueDate.toISOString() : String(c.issueDate ?? ""),
        isRevoked: c.isRevoked ?? false,
      })),
    [credsQuery.data]
  );

  const allProgress = useMemo(
    () => computeAllPathwaysProgress(credentials),
    [credentials]
  );

  const badges = useMemo(() => getEarnedMicroBadges(credentials), [credentials]);
  const summary = useMemo(() => getSkillCoverageSummary(credentials), [credentials]);

  const selectedProgress =
    allProgress.find((p) => p.pathway.pathwayId === selectedPathwayId) ??
    allProgress[0];

  if (!isConnected) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-6xl mb-6">🗺️</div>
            <h2 className="text-3xl font-extralight text-white mb-3">
              Connect to View{" "}
              <span className="font-light gradient-text">Pathways</span>
            </h2>
            <p className="text-base font-extralight text-white/40 mb-8 max-w-md mx-auto">
              Connect your wallet to track your learning journey and unlock skill pathway progress.
            </p>
            <Link
              to="/"
              className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-light hover:brightness-110 transition-all duration-300"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Page Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] mb-4">
            <Map className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-extralight text-white/60 uppercase tracking-wider">
              Learning Pathways
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-extralight text-white mb-3 tracking-tight">
            Skill <span className="gradient-text font-light">Pathways</span>
          </h1>
          <p className="text-base font-extralight text-white/40 max-w-2xl">
            Track your micro-credential journey across industry-recognized learning pathways. Earn
            stackable badges and progress toward your target role.
          </p>
        </div>

        {/* Summary Stats */}
        {credsQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-white/20" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              {
                label: "Badges Earned",
                value: summary.totalBadgesEarned,
                icon: Trophy,
                color: "text-amber-400",
                bg: "bg-amber-500/10 border-amber-500/20",
              },
              {
                label: "Total Badges",
                value: summary.totalBadgesAvailable,
                icon: Star,
                color: "text-purple-400",
                bg: "bg-purple-500/10 border-purple-500/20",
              },
              {
                label: "Coverage",
                value: `${summary.coveragePercent}%`,
                icon: Target,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20",
              },
              {
                label: "Mapped Credentials",
                value: summary.credentialsMapped,
                icon: Award,
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="liquid-glass rounded-2xl p-5"
              >
                <div
                  className={`w-10 h-10 rounded-full ${stat.bg} border flex items-center justify-center mb-3`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-extralight text-white">{stat.value}</div>
                <div className="text-xs font-extralight text-white/40 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(["pathways", "badges"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-light transition-all ${
                activeTab === tab
                  ? "bg-purple-500/20 border border-purple-500/30 text-purple-300"
                  : "bg-white/[0.02] border border-white/5 text-white/50 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {tab === "pathways" ? (
                <span className="flex items-center gap-2">
                  <Map className="w-4 h-4" /> Pathways
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Micro-Badges ({badges.length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pathways Tab */}
        {activeTab === "pathways" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Pathway list */}
            <div className="lg:col-span-2 space-y-4">
              {allProgress.map((progress) => (
                <PathwayCard
                  key={progress.pathway.pathwayId}
                  progress={progress}
                  isSelected={selectedPathwayId === progress.pathway.pathwayId}
                  onClick={() => setSelectedPathwayId(progress.pathway.pathwayId)}
                />
              ))}
            </div>

            {/* Right: Detail panel */}
            <div className="lg:col-span-3">
              {selectedProgress && (
                <PathwayDetailPanel progress={selectedProgress} />
              )}
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === "badges" && (
          <div>
            {badges.length === 0 ? (
              <div className="liquid-glass rounded-3xl p-16 text-center">
                <div className="text-6xl mb-4">🏅</div>
                <h3 className="text-xl font-extralight text-white mb-2">
                  No Micro-Badges Yet
                </h3>
                <p className="text-sm font-extralight text-white/40 mb-6 max-w-md mx-auto">
                  Earn credentials that match learning pathway steps to unlock
                  micro-badges. Each badge represents a verified skill milestone.
                </p>
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-light hover:brightness-110 transition-all"
                >
                  <BookOpen className="w-4 h-4" /> Browse Credentials
                </Link>
              </div>
            ) : (
              <>
                {/* Badge wall */}
                <div className="liquid-glass rounded-3xl p-8 mb-6">
                  <h3 className="text-lg font-light text-white mb-6 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    Your Badge Wall
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {badges.map((badge) => (
                      <div
                        key={badge.badgeId}
                        className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20 hover:bg-purple-500/5 transition-all cursor-default w-24"
                        title={badge.name}
                      >
                        <span className="text-3xl">{badge.icon}</span>
                        <span className="text-[10px] font-light text-white/60 text-center leading-tight">
                          {badge.name}
                        </span>
                        {badge.credentialTokenId !== undefined && (
                          <Link
                            to={`/credential/${badge.credentialTokenId}`}
                            className="text-[9px] text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            #{badge.credentialTokenId}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Badge list */}
                <div className="space-y-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.badgeId}
                      className="liquid-glass rounded-2xl p-5 flex items-center gap-4"
                    >
                      <span className="text-3xl shrink-0">{badge.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-light text-white">{badge.name}</p>
                        <p className="text-xs font-extralight text-white/40 mt-0.5">
                          {badge.description}
                        </p>
                      </div>
                      {badge.earnedAt && (
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle className="w-3 h-3" /> Earned
                          </div>
                          <p className="text-[10px] text-white/30 mt-0.5">
                            {new Date(badge.earnedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {badge.credentialTokenId !== undefined && (
                        <Link
                          to={`/credential/${badge.credentialTokenId}`}
                          className="text-white/20 hover:text-purple-400 transition-colors shrink-0"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Overall progress bar at bottom */}
        <div className="mt-12 liquid-glass rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-light text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Overall Pathway Progress
            </h3>
            <span className="text-sm text-white/40">
              {summary.totalBadgesEarned} / {summary.totalBadgesAvailable} badges
            </span>
          </div>
          <div className="space-y-4">
            {allProgress.map((progress) => {
              const colors = [
                "bg-blue-500",
                "bg-purple-500",
                "bg-emerald-500",
                "bg-amber-500",
                "bg-red-500",
              ];
              const colorIdx = LEARNING_PATHWAYS.findIndex(
                (p) => p.pathwayId === progress.pathway.pathwayId
              );
              return (
                <div key={progress.pathway.pathwayId}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-light text-white">
                      {progress.pathway.icon} {progress.pathway.name}
                    </span>
                    <span className="text-xs text-white/40">
                      {progress.completedSteps.length}/{progress.pathway.steps.length}
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        colors[colorIdx % colors.length]
                      } rounded-full transition-all duration-700`}
                      style={{ width: `${progress.progressPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
