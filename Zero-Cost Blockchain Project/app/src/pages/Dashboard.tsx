import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Layout from "@/components/layout/Layout";
import { useWallet } from "@/hooks/useWallet";
import { useContract } from "@/hooks/useContract";
import { trpc } from "@/providers/trpc";
import { getTopPathways, type CredentialRecord } from "../../lib/micro-credentials";
import { SUPPORTED_CHAINS } from "../../lib/multi-chain";
import { getBalance } from "@/services/alchemy";
import {
  Award,
  FilePlus,
  Search,
  Clock,
  Loader2,
  ExternalLink,
  Wallet,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Eye,
  Calendar,
  Download,
  Share2,
  Star,
  Target,
  Layers,
  QrCode,
} from "lucide-react";

export default function Dashboard() {
  const { isConnected, address, switchToSepolia, isCorrectNetwork } = useWallet();
  const { getCredentialsByOwner } = useContract();
  const navigate = useNavigate();
  const [balance, setBalance] = useState("0");
  const [tokenIds, setTokenIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const credsQuery = trpc.credential.list.useQuery(
    { owner: address ?? undefined, limit: 100 }, // Increased limit for analytics
    { enabled: !!address }
  );

  const activityQuery = trpc.activity.list.useQuery(
    { userAddress: address ?? undefined, limit: 50 }, // Increased for better analytics
    { enabled: !!address }
  );

  const statsQuery = trpc.credential.getStats.useQuery(undefined, { enabled: !!address });

  useEffect(() => {
    if (!isConnected) {
      setIsLoading(false);
      return;
    }

    async function loadData() {
      if (!address) return;
      setIsLoading(true);
      try {
        const bal = await getBalance(address);
        setBalance(parseFloat(bal).toFixed(4));
        const ids = await getCredentialsByOwner(address);
        setTokenIds(ids);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isConnected, address, getCredentialsByOwner]);

  if (!isConnected) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-3xl font-extralight text-white mb-3">
              Connect Your <span className="font-light gradient-text">Wallet</span>
            </h2>
            <p className="text-base font-extralight text-white/40 mb-8 max-w-md mx-auto">
              Please connect your MetaMask wallet to view your dashboard and manage your credentials.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-light hover:brightness-110 transition-all duration-300"
            >
              Go to Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const truncateAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const stats = [
    {
      label: "Credentials Owned",
      value: tokenIds.length,
      icon: Award,
      href: "/explore",
    },
    {
      label: "Credentials Issued",
      value: credsQuery.data?.items.filter((c) => c.issuerAddress === address).length ?? 0,
      icon: FilePlus,
      href: "/issue",
    },
    {
      label: "Verifications",
      value: statsQuery.data?.totalVerified ?? 0,
      icon: Search,
      href: "/verify",
    },
    {
      label: "Balance",
      value: `${balance} ETH`,
      icon: Wallet,
      href: undefined,
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] mb-4">
              <Wallet className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-extralight text-white/60 uppercase tracking-wider">Your Dashboard</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-extralight text-white mb-2 tracking-tight">
              Welcome <span className="gradient-text font-light">Back</span>
            </h1>
            <p className="text-base font-extralight text-white/40 font-mono">
              {truncateAddr(address ?? "")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isCorrectNetwork && (
              <button
                onClick={switchToSepolia}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-light hover:bg-amber-500/20 transition-all duration-300"
              >
                <AlertTriangle className="w-4 h-4" />
                Switch to Sepolia
              </button>
            )}
            <span className="px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-xs text-purple-300 font-light">
              Sepolia Testnet
            </span>
          </div>
        </div>

        {/* Bento Grid - Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => (
            <Link
              key={i}
              to={stat.href ?? "#"}
              className="liquid-glass rounded-2xl p-6 hover:bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-purple-400" />
                </div>
                {stat.href && (
                  <ArrowRight className="w-5 h-5 text-white/10 group-hover:text-purple-400 transition-colors" />
                )}
              </div>
              <div className="text-3xl font-extralight text-white mb-1">
                {isLoading && typeof stat.value === "number" ? (
                  <Loader2 className="w-7 h-7 animate-spin text-white/20" />
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-xs font-extralight text-white/40">{stat.label}</div>
            </Link>
          ))}
        </div>

        {/* Recent Credentials */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extralight text-white">
              Recent <span className="font-light gradient-text">Credentials</span>
            </h2>
            <Link
              to="/explore"
              className="text-sm text-purple-400 hover:text-purple-300 font-light flex items-center gap-1.5 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {credsQuery.isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-white/20" />
            </div>
          ) : credsQuery.data?.items.length === 0 ? (
            <div className="liquid-glass rounded-3xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-xl font-extralight text-white mb-2">
                No Credentials Yet
              </h3>
              <p className="text-sm font-extralight text-white/40 mb-6">
                You have not received any credentials yet.
              </p>
              <Link
                to="/issue"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-light hover:brightness-110 transition-all duration-300"
              >
                <FilePlus className="w-4 h-4" />
                Issue Your First
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {credsQuery.data?.items.map((cred) => (
                <Link
                  key={cred.id}
                  to={`/credential/${cred.tokenId}`}
                  className="liquid-glass rounded-2xl overflow-hidden hover:bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/5 flex items-center justify-center">
                    <Award className="w-10 h-10 text-white/10" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300 uppercase font-light tracking-wider">
                        {cred.credentialType}
                      </span>
                      {!cred.isRevoked ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-extralight">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-red-400 font-extralight">
                          <AlertTriangle className="w-3 h-3" /> Revoked
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-light text-white truncate">
                      {cred.name}
                    </h3>
                    <p className="text-xs font-extralight text-white/50 mt-1">{cred.institution}</p>
                    <p className="text-[10px] font-extralight text-white/30 font-mono mt-2">
                      #{cred.tokenId}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="mb-12">
          <h2 className="text-2xl font-extralight text-white mb-6">
            Recent <span className="font-light gradient-text">Activity</span>
          </h2>
          {activityQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            </div>
          ) : activityQuery.data?.length === 0 ? (
            <div className="liquid-glass rounded-2xl p-10 text-center">
              <Clock className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-sm font-extralight text-white/40">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activityQuery.data?.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="liquid-glass rounded-2xl p-5 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    {activity.action === "issue" ? (
                      <FilePlus className="w-5 h-5 text-purple-400" />
                    ) : activity.action === "receive" ? (
                      <Award className="w-5 h-5 text-emerald-400" />
                    ) : activity.action === "verify" ? (
                      <ShieldCheck className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Wallet className="w-5 h-5 text-white/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-light text-white capitalize">
                      {activity.action}
                    </p>
                    <p className="text-xs font-extralight text-white/40">
                      {activity.createdAt
                        ? new Date(activity.createdAt).toLocaleDateString()
                        : "Just now"}
                    </p>
                  </div>
                  {activity.transactionHash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${activity.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/20 hover:text-purple-400 transition-colors shrink-0"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extralight text-white">
              Your <span className="font-light gradient-text">Analytics</span>
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-all">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Credential Distribution */}
            <div className="liquid-glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-400" />
                  Credential Distribution
                </h3>
              </div>
              {credsQuery.isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-white/20" />
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const typeCounts = credsQuery.data?.items.reduce((acc, cred) => {
                      acc[cred.credentialType] = (acc[cred.credentialType] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>) || {};
                    
                    const total = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
                    const colors = {
                      course: "bg-blue-500",
                      bootcamp: "bg-purple-500",
                      workshop: "bg-emerald-500",
                      certification: "bg-amber-500",
                      skillbadge: "bg-pink-500",
                    };

                    return Object.entries(typeCounts).map(([type, count]) => {
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-light text-white capitalize">{type}</span>
                            <span className="text-sm font-extralight text-white/60">{count} ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${colors[type as keyof typeof colors] || "bg-gray-500"} transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                  {credsQuery.data?.items.length === 0 && (
                    <p className="text-center text-sm text-white/40 py-8">No credentials yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Activity Trends */}
            <div className="liquid-glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Activity Trends
                </h3>
              </div>
              {activityQuery.isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-white/20" />
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const actionCounts = activityQuery.data?.reduce((acc, activity) => {
                      acc[activity.action] = (acc[activity.action] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>) || {};

                    const total = Object.values(actionCounts).reduce((sum, count) => sum + count, 0);
                    const actionIcons = {
                      issue: FilePlus,
                      receive: Award,
                      verify: ShieldCheck,
                      connect: Wallet,
                      revoke: AlertTriangle,
                    };

                    return Object.entries(actionCounts).map(([action, count]) => {
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      const Icon = actionIcons[action as keyof typeof actionIcons] || Activity;
                      return (
                        <div key={action} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-light text-white capitalize">{action}</span>
                              <span className="text-sm font-extralight text-white/60">{count}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                  {activityQuery.data?.length === 0 && (
                    <p className="text-center text-sm text-white/40 py-8">No activity yet</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Learning Pathways Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extralight text-white">
                Learning <span className="font-light gradient-text">Pathways</span>
              </h2>
              <Link
                to="/pathways"
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                View All Pathways <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(() => {
                const mappedRecords: CredentialRecord[] = (credsQuery.data?.items ?? []).map((c) => ({
                  name: c.name,
                  institution: c.institution,
                  credentialType: c.credentialType,
                  tokenId: c.tokenId,
                  issueDate: c.issueDate instanceof Date ? c.issueDate.toISOString() : String(c.issueDate ?? ""),
                  isRevoked: c.isRevoked ?? false,
                }));
                const pathwayProgresses = getTopPathways(mappedRecords, 3);
                
                if (pathwayProgresses.length === 0) {
                  return (
                    <div className="col-span-3 text-center py-6 text-white/40 font-light text-sm">
                      No learning pathway progress found.
                    </div>
                  );
                }

                return pathwayProgresses.map((prog) => {
                  return (
                    <div
                      key={prog.pathway.pathwayId}
                      className="liquid-glass rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{prog.pathway.icon}</span>
                          <div>
                            <h4 className="text-sm font-light text-white leading-tight">
                              {prog.pathway.name}
                            </h4>
                            <p className="text-[10px] font-extralight text-white/40 mt-1">
                              {prog.pathway.targetRole}
                            </p>
                          </div>
                        </div>
                        <div className="relative flex items-center justify-center shrink-0 w-12 h-12">
                          <span className="text-xs font-light text-purple-300">{prog.progressPercent}%</span>
                        </div>
                      </div>

                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${prog.progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-extralight text-white/40">
                        <span>
                          {prog.completedSteps.length} / {prog.pathway.steps.length} Steps
                        </span>
                        {prog.nextStep && (
                          <span className="text-[10px] text-amber-400">
                            Next: {prog.nextStep.title}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Networks Status Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-extralight text-white mb-6">
              Network <span className="font-light gradient-text">Distribution</span>
            </h2>
            <div className="liquid-glass rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-light text-white">Cross-Chain Status</h3>
                  <p className="text-xs font-extralight text-white/40 mt-1">
                    Distribution of credentials across different blockchain networks
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extralight text-white/40">Total Cross-Chain Credentials:</span>
                  <span className="text-lg font-light text-purple-400 font-mono">
                    {credsQuery.data?.items.length ?? 0}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {SUPPORTED_CHAINS.map((chain) => {
                  const chainCreds = (credsQuery.data?.items ?? []).filter(
                    (c) => c.chainId === chain.chainId
                  );
                  const hasCredentials = chainCreds.length > 0;
                  
                  return (
                    <div
                      key={chain.chainId}
                      className={`p-4 rounded-2xl border transition-all duration-300 ${
                        hasCredentials
                          ? "bg-purple-500/5 border-purple-500/20"
                          : "bg-white/[0.01] border-white/5 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{chain.icon}</span>
                        {chain.isDeployed ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/30">
                            Soon
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-light text-white truncate">{chain.shortName}</h4>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-lg font-light text-white font-mono">
                          {chainCreds.length}
                        </span>
                        <span className="text-[10px] text-white/30"> credentials</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Verification Rate */}
            <div className="liquid-glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-extralight text-white">
                    {activityQuery.data?.filter(a => a.action === "verify").length || 0}
                  </div>
                  <div className="text-xs font-extralight text-white/40">Verifications</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span>Active</span>
              </div>
            </div>

            {/* Credential Value */}
            <div className="liquid-glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-extralight text-white">
                    {credsQuery.data?.items.filter(c => !c.isRevoked).length || 0}
                  </div>
                  <div className="text-xs font-extralight text-white/40">Valid Credentials</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <CheckCircle className="w-3 h-3" />
                <span>Verified</span>
              </div>
            </div>

            {/* Institutions */}
            <div className="liquid-glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-extralight text-white">
                    {new Set(credsQuery.data?.items.map(c => c.institution)).size || 0}
                  </div>
                  <div className="text-xs font-extralight text-white/40">Institutions</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-400">
                <Target className="w-3 h-3" />
                <span>Diverse</span>
              </div>
            </div>

            {/* Latest Activity */}
            <div className="liquid-glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-extralight text-white">
                    {activityQuery.data?.[0]?.createdAt 
                      ? new Date(activityQuery.data[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : "N/A"}
                  </div>
                  <div className="text-xs font-extralight text-white/40">Last Activity</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-400">
                <Clock className="w-3 h-3" />
                <span>Recent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-extralight text-white mb-6">
            Quick <span className="font-light gradient-text">Actions</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/issue"
              className="liquid-glass rounded-2xl p-6 hover:bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FilePlus className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-light text-white mb-2">Issue Credential</h3>
              <p className="text-sm font-extralight text-white/40">Create and mint a new blockchain credential</p>
            </Link>

            <Link
              to="/verify"
              className="liquid-glass rounded-2xl p-6 hover:bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-light text-white mb-2">Verify Credential</h3>
              <p className="text-sm font-extralight text-white/40">Instantly verify any credential by token ID</p>
            </Link>

            <button
              onClick={() => {
                // Share portfolio functionality
                const portfolioUrl = `${window.location.origin}/portfolio/${address}`;
                navigator.clipboard.writeText(portfolioUrl);
                alert("Portfolio link copied to clipboard!");
              }}
              className="liquid-glass rounded-2xl p-6 hover:bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 group text-left"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Share2 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-light text-white mb-2">Share Portfolio</h3>
              <p className="text-sm font-extralight text-white/40">Share your credential portfolio with employers</p>
            </button>

            <Link
              to="/bulk-issue"
              className="liquid-glass rounded-2xl p-6 hover:bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-light text-white mb-2">Bulk Issue</h3>
              <p className="text-sm font-extralight text-white/40">Issue multiple credentials via CSV upload</p>
            </Link>

            <Link
              to="/verify"
              className="liquid-glass rounded-2xl p-6 hover:bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-light text-white mb-2">Scan QR Code</h3>
              <p className="text-sm font-extralight text-white/40">Verify credentials by scanning a QR code</p>
            </Link>

            <Link
              to={`/portfolio/${address}`}
              className="liquid-glass rounded-2xl p-6 hover:bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Share2 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-light text-white mb-2">My Portfolio</h3>
              <p className="text-sm font-extralight text-white/40">View and share your public credential portfolio</p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
