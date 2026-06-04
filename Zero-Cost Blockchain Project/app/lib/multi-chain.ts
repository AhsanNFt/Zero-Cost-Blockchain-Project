/**
 * Multi-Chain Configuration & Support Layer
 * Covers the remaining industry gap: Cross-Chain Interoperability
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChainConfig {
  chainId: number;
  name: string;
  shortName: string;
  icon: string;
  nativeCurrency: string;
  nativeSymbol: string;
  rpcUrl: string;
  explorerUrl: string;
  explorerName: string;
  contractAddress: string | null; // null = not yet deployed
  isDeployed: boolean;
  isTestnet: boolean;
  avgGasPrice: string; // in gwei
  avgTxCostUSD: string; // estimated cost per tx
  avgTxTimeSeconds: number;
  color: string; // tailwind color class
  bgColor: string;
  status: "live" | "coming-soon" | "deprecated";
}

export interface ChainCredentialCount {
  chainId: number;
  count: number;
  isLoading: boolean;
  error: string | null;
}

export interface GasCostComparison {
  chain: ChainConfig;
  issueCostUSD: string;
  verifyCostUSD: string;
  revokeCostUSD: string;
  totalMonthly100CredsUSD: string;
}

// ─── Chain Registry ───────────────────────────────────────────────────────────

export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    chainId: 11155111,
    name: "Ethereum Sepolia",
    shortName: "Sepolia",
    icon: "⟠",
    nativeCurrency: "Sepolia ETH",
    nativeSymbol: "sETH",
    rpcUrl: "https://sepolia.infura.io/v3/",
    explorerUrl: "https://sepolia.etherscan.io",
    explorerName: "Etherscan",
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS ?? null,
    isDeployed: true,
    isTestnet: true,
    avgGasPrice: "5",
    avgTxCostUSD: "$0.00",
    avgTxTimeSeconds: 12,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    status: "live",
  },
  {
    chainId: 80002,
    name: "Polygon Amoy",
    shortName: "Polygon",
    icon: "⬡",
    nativeCurrency: "MATIC",
    nativeSymbol: "MATIC",
    rpcUrl: "https://rpc-amoy.polygon.technology/",
    explorerUrl: "https://amoy.polygonscan.com",
    explorerName: "PolygonScan",
    contractAddress: null,
    isDeployed: false,
    isTestnet: true,
    avgGasPrice: "30",
    avgTxCostUSD: "$0.001",
    avgTxTimeSeconds: 2,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
    status: "coming-soon",
  },
  {
    chainId: 421614,
    name: "Arbitrum Sepolia",
    shortName: "Arbitrum",
    icon: "🔵",
    nativeCurrency: "Arbitrum ETH",
    nativeSymbol: "aETH",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    explorerUrl: "https://sepolia.arbiscan.io",
    explorerName: "Arbiscan",
    contractAddress: null,
    isDeployed: false,
    isTestnet: true,
    avgGasPrice: "0.1",
    avgTxCostUSD: "$0.0001",
    avgTxTimeSeconds: 1,
    color: "text-sky-400",
    bgColor: "bg-sky-500/10 border-sky-500/20",
    status: "coming-soon",
  },
  {
    chainId: 11155420,
    name: "Optimism Sepolia",
    shortName: "Optimism",
    icon: "🔴",
    nativeCurrency: "Optimism ETH",
    nativeSymbol: "oETH",
    rpcUrl: "https://sepolia.optimism.io",
    explorerUrl: "https://sepolia-optimism.etherscan.io",
    explorerName: "OP Explorer",
    contractAddress: null,
    isDeployed: false,
    isTestnet: true,
    avgGasPrice: "0.05",
    avgTxCostUSD: "$0.00005",
    avgTxTimeSeconds: 2,
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    status: "coming-soon",
  },
  {
    chainId: 84532,
    name: "Base Sepolia",
    shortName: "Base",
    icon: "🔷",
    nativeCurrency: "Base ETH",
    nativeSymbol: "bETH",
    rpcUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia.basescan.org",
    explorerName: "BaseScan",
    contractAddress: null,
    isDeployed: false,
    isTestnet: true,
    avgGasPrice: "0.05",
    avgTxCostUSD: "$0.00005",
    avgTxTimeSeconds: 2,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10 border-indigo-500/20",
    status: "coming-soon",
  },
];

// ─── Gas Cost Comparison Data ─────────────────────────────────────────────────

export const GAS_COST_COMPARISON: GasCostComparison[] = [
  {
    chain: SUPPORTED_CHAINS[0], // Sepolia
    issueCostUSD: "$0.00 (testnet)",
    verifyCostUSD: "$0.00",
    revokeCostUSD: "$0.00 (testnet)",
    totalMonthly100CredsUSD: "$0.00",
  },
  {
    chain: SUPPORTED_CHAINS[1], // Polygon
    issueCostUSD: "~$0.001",
    verifyCostUSD: "$0.00",
    revokeCostUSD: "~$0.001",
    totalMonthly100CredsUSD: "~$0.10",
  },
  {
    chain: SUPPORTED_CHAINS[2], // Arbitrum
    issueCostUSD: "~$0.0001",
    verifyCostUSD: "$0.00",
    revokeCostUSD: "~$0.0001",
    totalMonthly100CredsUSD: "~$0.01",
  },
  {
    chain: SUPPORTED_CHAINS[3], // Optimism
    issueCostUSD: "~$0.00005",
    verifyCostUSD: "$0.00",
    revokeCostUSD: "~$0.00005",
    totalMonthly100CredsUSD: "~$0.005",
  },
  {
    chain: SUPPORTED_CHAINS[4], // Base
    issueCostUSD: "~$0.00005",
    verifyCostUSD: "$0.00",
    revokeCostUSD: "~$0.00005",
    totalMonthly100CredsUSD: "~$0.005",
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Get chain configuration by chainId
 */
export function getChainConfig(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((c) => c.chainId === chainId);
}

/**
 * Get currently active chain from MetaMask
 */
export async function getCurrentChainId(): Promise<number | null> {
  if (typeof window === "undefined" || !window.ethereum) return null;
  try {
    const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    return parseInt(chainIdHex as string, 16);
  } catch {
    return null;
  }
}

/**
 * Switch MetaMask to a target chain, adding it if necessary
 */
export async function switchChain(chain: ChainConfig): Promise<boolean> {
  if (typeof window === "undefined" || !window.ethereum) return false;

  const chainIdHex = `0x${chain.chainId.toString(16)}`;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
    return true;
  } catch (switchError: unknown) {
    // Chain not added yet — add it
    if ((switchError as { code: number }).code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: chain.name,
              nativeCurrency: {
                name: chain.nativeCurrency,
                symbol: chain.nativeSymbol,
                decimals: 18,
              },
              rpcUrls: [chain.rpcUrl],
              blockExplorerUrls: [chain.explorerUrl],
            },
          ],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

/**
 * Returns the explorer URL for a transaction on a given chain
 */
export function getExplorerTxUrl(chain: ChainConfig, txHash: string): string {
  return `${chain.explorerUrl}/tx/${txHash}`;
}

/**
 * Returns the explorer URL for a contract on a given chain
 */
export function getExplorerContractUrl(chain: ChainConfig): string {
  if (!chain.contractAddress) return chain.explorerUrl;
  return `${chain.explorerUrl}/address/${chain.contractAddress}`;
}

/**
 * Returns deployment roadmap timeline
 */
export const DEPLOYMENT_ROADMAP = [
  {
    phase: "Phase 1 — Current",
    status: "complete",
    chains: ["Ethereum Sepolia"],
    timeline: "Live Now",
    description: "Initial deployment on Ethereum testnet. Full feature coverage.",
  },
  {
    phase: "Phase 2 — Q3 2026",
    status: "upcoming",
    chains: ["Polygon Amoy", "Arbitrum Sepolia"],
    timeline: "Q3 2026",
    description: "Layer 2 expansion for near-zero gas costs and 10x faster transactions.",
  },
  {
    phase: "Phase 3 — Q4 2026",
    status: "planned",
    chains: ["Optimism Sepolia", "Base Sepolia"],
    timeline: "Q4 2026",
    description: "Full multi-chain coverage with cross-chain credential bridging.",
  },
  {
    phase: "Phase 4 — 2027",
    status: "planned",
    chains: ["Ethereum Mainnet", "Polygon Mainnet"],
    timeline: "2027",
    description: "Production mainnet launch after thorough testnet validation.",
  },
];

// Extend Window type for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}
