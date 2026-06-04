import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useWallet } from "@/hooks/useWallet";
import {
  SUPPORTED_CHAINS,
  GAS_COST_COMPARISON,
  DEPLOYMENT_ROADMAP,
  switchChain,
  getCurrentChainId,
  getExplorerContractUrl,
  type ChainConfig,
} from "../../lib/multi-chain";
import {
  Globe,
  Zap,
  Shield,
  ExternalLink,
  CheckCircle,
  Clock,
  ArrowRight,
  Copy,
  ChevronDown,
  ChevronUp,
  Loader2,
  Link2,
  BarChart3,
  Map,
} from "lucide-react";
import { Link } from "react-router";

// ─── Chain Status Badge ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ChainConfig["status"] }) {
  if (status === "live") {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-light">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Live
      </span>
    );
  }
  if (status === "coming-soon") {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-light">
        <Clock className="w-2.5 h-2.5" />
        Coming Soon
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/40 font-light">
      Deprecated
    </span>
  );
}

// ─── Chain Card ───────────────────────────────────────────────────────────────

function ChainCard({
  chain,
  isActive,
  isCurrent,
  onSwitch,
  isSwitching,
}: {
  chain: ChainConfig;
  isActive: boolean;
  isCurrent: boolean;
  onSwitch: (chain: ChainConfig) => void;
  isSwitching: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (!chain.contractAddress) return;
    navigator.clipboard.writeText(chain.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`liquid-glass rounded-3xl p-6 transition-all duration-300 border ${
        isCurrent
          ? "border-purple-500/40 bg-purple-500/5"
          : isActive
          ? "border-white/10"
          : "border-white/5 opacity-70"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl ${chain.bgColor} border flex items-center justify-center text-2xl`}
          >
            {chain.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-light text-white">{chain.name}</h3>
              {isCurrent && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[10px] text-purple-300">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs font-extralight text-white/40 mt-0.5">
              Chain ID: {chain.chainId}
            </p>
          </div>
        </div>
        <StatusBadge status={chain.status} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
          <div className={`text-sm font-light ${chain.color}`}>
            {chain.avgTxCostUSD || "$0.00"}
          </div>
          <div className="text-[10px] text-white/30 mt-0.5">Tx Cost</div>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
          <div className={`text-sm font-light ${chain.color}`}>
            {chain.avgTxTimeSeconds}s
          </div>
          <div className="text-[10px] text-white/30 mt-0.5">Tx Time</div>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
          <div className={`text-sm font-light ${chain.color}`}>
            {chain.nativeSymbol}
          </div>
          <div className="text-[10px] text-white/30 mt-0.5">Gas Token</div>
        </div>
      </div>

      {/* Contract Address */}
      {chain.contractAddress ? (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <Link2 className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <span className="text-[11px] font-mono text-white/50 truncate flex-1">
            {chain.contractAddress}
          </span>
          <button
            onClick={copyAddress}
            className="text-white/30 hover:text-purple-400 transition-colors shrink-0"
          >
            {copied ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <a
            href={getExplorerContractUrl(chain)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-purple-400 transition-colors shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <Link2 className="w-3.5 h-3.5 text-white/20 shrink-0" />
          <span className="text-[11px] font-extralight text-white/25">
            Contract not yet deployed
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSwitch(chain)}
          disabled={isCurrent || !chain.isDeployed || isSwitching}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-light transition-all ${
            isCurrent
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default"
              : chain.isDeployed
              ? "bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
              : "bg-white/5 border border-white/10 text-white/20 cursor-not-allowed"
          }`}
        >
          {isSwitching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isCurrent ? (
            <CheckCircle className="w-3.5 h-3.5" />
          ) : null}
          {isCurrent ? "Connected" : chain.isDeployed ? "Switch Network" : "Coming Soon"}
        </button>
        <a
          href={chain.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
          title={`Open ${chain.explorerName}`}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

// ─── Roadmap Timeline ─────────────────────────────────────────────────────────

function RoadmapTimeline() {
  return (
    <div className="liquid-glass rounded-3xl p-8">
      <h3 className="text-lg font-light text-white mb-8 flex items-center gap-2">
        <Map className="w-5 h-5 text-purple-400" />
        Deployment Roadmap
      </h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-purple-500/40 via-white/10 to-transparent" />

        <div className="space-y-8">
          {DEPLOYMENT_ROADMAP.map((phase, idx) => (
            <div key={idx} className="flex gap-6 relative">
              {/* Dot */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  phase.status === "complete"
                    ? "bg-emerald-500/20 border-2 border-emerald-500/40"
                    : phase.status === "upcoming"
                    ? "bg-purple-500/20 border-2 border-purple-500/40"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                {phase.status === "complete" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : phase.status === "upcoming" ? (
                  <Zap className="w-4 h-4 text-purple-400" />
                ) : (
                  <Clock className="w-4 h-4 text-white/30" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-sm font-light text-white">{phase.phase}</p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-light ${
                      phase.status === "complete"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : phase.status === "upcoming"
                        ? "bg-purple-500/10 text-purple-400"
                        : "bg-white/5 text-white/30"
                    }`}
                  >
                    {phase.timeline}
                  </span>
                </div>
                <p className="text-xs font-extralight text-white/40 mb-2">
                  {phase.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {phase.chains.map((chainName) => (
                    <span
                      key={chainName}
                      className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50"
                    >
                      {chainName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Gas Comparison Table ─────────────────────────────────────────────────────

function GasComparisonTable({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="liquid-glass rounded-3xl p-8">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-6"
      >
        <h3 className="text-lg font-light text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Gas Cost Comparison
        </h3>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-white/40" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/40" />
        )}
      </button>

      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Chain", "Issue Credential", "Verify", "Revoke", "100 Creds/Month"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-2 text-xs font-light text-white/40 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {GAS_COST_COMPARISON.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-2">
                    <span className="flex items-center gap-2">
                      <span className="text-base">{row.chain.icon}</span>
                      <span className="font-light text-white text-xs">
                        {row.chain.shortName}
                      </span>
                    </span>
                  </td>
                  <td className="py-3 px-2 font-mono text-xs text-emerald-400">
                    {row.issueCostUSD}
                  </td>
                  <td className="py-3 px-2 font-mono text-xs text-emerald-400">
                    {row.verifyCostUSD}
                  </td>
                  <td className="py-3 px-2 font-mono text-xs text-emerald-400">
                    {row.revokeCostUSD}
                  </td>
                  <td className="py-3 px-2 font-mono text-xs text-emerald-400">
                    {row.totalMonthly100CredsUSD}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-white/25 mt-4">
            * Costs are estimates based on average gas prices. Testnet costs $0. Mainnet costs will vary.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MultiChain() {
  const { isConnected } = useWallet();
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [switchingChainId, setSwitchingChainId] = useState<number | null>(null);
  const [gasTableExpanded, setGasTableExpanded] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  // Detect current chain
  useEffect(() => {
    getCurrentChainId().then(setCurrentChainId);

    const handler = () => {
      getCurrentChainId().then(setCurrentChainId);
    };
    window.ethereum?.on("chainChanged", handler);
    return () => window.ethereum?.removeListener("chainChanged", handler);
  }, []);

  const handleSwitchChain = async (chain: ChainConfig) => {
    setSwitchingChainId(chain.chainId);
    setSwitchError(null);
    const success = await switchChain(chain);
    if (success) {
      setCurrentChainId(chain.chainId);
    } else {
      setSwitchError(`Failed to switch to ${chain.name}. Please try manually in MetaMask.`);
    }
    setSwitchingChainId(null);
  };

  const deployedCount = SUPPORTED_CHAINS.filter((c) => c.isDeployed).length;
  const comingSoonCount = SUPPORTED_CHAINS.filter((c) => c.status === "coming-soon").length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] mb-4">
            <Globe className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-extralight text-white/60 uppercase tracking-wider">
              Multi-Chain
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-extralight text-white mb-3 tracking-tight">
            Cross-Chain <span className="gradient-text font-light">Support</span>
          </h1>
          <p className="text-base font-extralight text-white/40 max-w-2xl">
            SkillChain credentials are designed to be chain-agnostic. Deploy once,
            verify everywhere — across Ethereum, Polygon, Arbitrum, Optimism, and Base.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            {
              label: "Live Networks",
              value: deployedCount,
              icon: CheckCircle,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10 border-emerald-500/20",
            },
            {
              label: "Coming Soon",
              value: comingSoonCount,
              icon: Clock,
              color: "text-amber-400",
              bg: "bg-amber-500/10 border-amber-500/20",
            },
            {
              label: "Verify Cost",
              value: "$0.00",
              icon: Shield,
              color: "text-blue-400",
              bg: "bg-blue-500/10 border-blue-500/20",
            },
            {
              label: "Avg Tx Time",
              value: "< 2s",
              icon: Zap,
              color: "text-purple-400",
              bg: "bg-purple-500/10 border-purple-500/20",
            },
          ].map((s) => (
            <div key={s.label} className="liquid-glass rounded-2xl p-5">
              <div
                className={`w-10 h-10 rounded-full ${s.bg} border flex items-center justify-center mb-3`}
              >
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-2xl font-extralight text-white">{s.value}</div>
              <div className="text-xs font-extralight text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Switch Error */}
        {switchError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {switchError}
          </div>
        )}

        {/* Not connected notice */}
        {!isConnected && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-sm text-amber-400">
            <Zap className="w-4 h-4 shrink-0" />
            Connect your wallet to switch networks directly from this page.
          </div>
        )}

        {/* Chain Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {SUPPORTED_CHAINS.map((chain) => (
            <ChainCard
              key={chain.chainId}
              chain={chain}
              isActive={true}
              isCurrent={currentChainId === chain.chainId}
              onSwitch={handleSwitchChain}
              isSwitching={switchingChainId === chain.chainId}
            />
          ))}
        </div>

        {/* Gas Table + Roadmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <GasComparisonTable
            expanded={gasTableExpanded}
            onToggle={() => setGasTableExpanded(!gasTableExpanded)}
          />
          <RoadmapTimeline />
        </div>

        {/* Why Multi-Chain */}
        <div className="liquid-glass rounded-3xl p-8">
          <h3 className="text-lg font-light text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Why Multi-Chain Matters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: "🔗",
                title: "No Vendor Lock-in",
                desc: "Your credentials are not trapped on a single blockchain. ERC-721 is a universal open standard.",
              },
              {
                icon: "⚡",
                title: "Near-Zero Gas Cost",
                desc: "Layer 2 chains like Arbitrum and Optimism reduce issuance cost to fractions of a cent.",
              },
              {
                icon: "🌍",
                title: "Global Reach",
                desc: "Different regions prefer different chains. Multi-chain ensures maximum accessibility.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-3">
                <div className="text-3xl">{item.icon}</div>
                <p className="text-sm font-light text-white">{item.title}</p>
                <p className="text-xs font-extralight text-white/40 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-white/30">
              Ready to deploy on additional chains? See the roadmap above.
            </p>
            <Link
              to="/issue"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-light hover:brightness-110 transition-all"
            >
              Issue on Sepolia <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
