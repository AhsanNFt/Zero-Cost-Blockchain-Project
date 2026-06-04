import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useContract } from "@/hooks/useContract";
import { trpc } from "@/providers/trpc";
import { getIPFSUrl } from "@/services/pinata";
import QRScanner from "@/components/QRScanner";
import {
  ShieldCheck,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Award,
  AlertTriangle,
  Copy,
  ChevronRight,
  QrCode,
} from "lucide-react";

interface VerificationResult {
  tokenId: number;
  issuer: string;
  metadataURI: string;
  credType: number;
  issueTimestamp: number;
  isRevoked: boolean;
  owner: string;
  credentialName?: string;
  institution?: string;
  description?: string;
  imageUrl?: string;
  foundInDb: boolean;
}

const typeLabels: Record<number, string> = {
  0: "Course Completion",
  1: "Bootcamp",
  2: "Workshop",
  3: "Certification",
  4: "Skill Badge",
};

export default function Verify() {
  const { verifyCredential } = useContract();
  const [tokenId, setTokenId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState("");
  const [recentVerifications, setRecentVerifications] = useState<VerificationResult[]>([]);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenId) return;

    setIsVerifying(true);
    setError("");
    setResult(null);

    try {
      const id = parseInt(tokenId);
      if (isNaN(id) || id < 0) {
        throw new Error("Invalid Token ID");
      }

      // 1. Call smart contract
      const onChainResult = await verifyCredential(id);

      if (!onChainResult) {
        setError("No credential found with this Token ID on the blockchain.");
        setIsVerifying(false);
        return;
      }

      // 2. Check DB for additional data
      const dbResult = await trpc.credential.getByTokenId.useQuery({ tokenId: id }).refetch();
      const dbCred = dbResult.data;

      // 3. Try to fetch metadata from IPFS
      let metadata: Record<string, unknown> = {};
      if (onChainResult.metadataURI) {
        try {
          const cid = onChainResult.metadataURI.replace("ipfs://", "");
          const response = await fetch(getIPFSUrl(cid));
          metadata = await response.json();
        } catch {
          // ignore metadata fetch errors
        }
      }

      const verificationResult: VerificationResult = {
        tokenId: id,
        issuer: onChainResult.issuer,
        metadataURI: onChainResult.metadataURI,
        credType: onChainResult.credType,
        issueTimestamp: onChainResult.issueTimestamp,
        isRevoked: onChainResult.isRevoked,
        owner: onChainResult.owner,
        credentialName: (metadata?.name as string) ?? dbCred?.name ?? `Credential #${id}`,
        institution: (metadata?.attributes as Array<{ trait_type: string; value: string }>)?.find(
          (a) => a.trait_type === "Institution"
        )?.value ?? dbCred?.institution ?? "Unknown",
        description: (metadata?.description as string) ?? dbCred?.description ?? "",
        imageUrl: (metadata?.image as string)
          ? getIPFSUrl((metadata?.image as string).replace("ipfs://", ""))
          : undefined,
        foundInDb: !!dbCred,
      };

      setResult(verificationResult);
      setRecentVerifications((prev) => [verificationResult, ...prev].slice(0, 5));

      // Log verification
      await trpc.activity.log.useMutation().mutateAsync({
        userAddress: onChainResult.owner,
        action: "verify",
        details: { tokenId: id, isValid: !onChainResult.isRevoked },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] mb-6">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-extralight text-white/60 uppercase tracking-wider">Blockchain Verification</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extralight text-white mb-4 tracking-tight">
            Verify <span className="gradient-text font-light">Credential</span>
          </h1>
          <p className="text-lg font-extralight text-white/40 max-w-2xl mx-auto">
            Enter a token ID to verify credential authenticity on the blockchain
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleVerify} className="mb-12">
          <div className="flex gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="number"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Enter Token ID (e.g. 0, 1, 2...)"
                required
                min="0"
                className="w-full pl-12 pr-4 py-4 rounded-full bg-white/[0.02] border border-white/10 text-white text-sm font-light placeholder-white/20 focus:border-purple-500/40 focus:bg-white/[0.04] outline-none transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowQRScanner((v) => !v)}
              className={`px-5 py-4 rounded-full border text-sm font-light transition-all duration-300 flex items-center gap-2 shrink-0 ${
                showQRScanner
                  ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                  : "border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.05]"
              }`}
              title="Scan QR Code"
            >
              <QrCode className="w-5 h-5" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>
            <button
              type="submit"
              disabled={isVerifying || !tokenId}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-light text-sm hover:brightness-110 transition-all duration-300 disabled:opacity-30 flex items-center gap-2 shrink-0"
            >
              {isVerifying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
              Verify
            </button>
          </div>
        </form>

        {/* QR Scanner Panel */}
        {showQRScanner && (
          <div className="max-w-2xl mx-auto mb-10">
            <QRScanner
              onScan={(value) => {
                setTokenId(value);
                setShowQRScanner(false);
              }}
              onClose={() => setShowQRScanner(false)}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-8 liquid-glass rounded-2xl p-6 flex items-center gap-3 max-w-2xl mx-auto">
            <XCircle className="w-6 h-6 text-red-400 shrink-0" />
            <p className="text-sm font-light text-red-400">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="liquid-glass rounded-3xl overflow-hidden mb-12 max-w-3xl mx-auto">
            {/* Result Header */}
            <div
              className={`p-6 flex items-center gap-3 border-b ${
                result.isRevoked
                  ? "bg-red-500/5 border-red-500/10"
                  : "bg-emerald-500/5 border-emerald-500/10"
              }`}
            >
              {result.isRevoked ? (
                <>
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <span className="text-base font-light text-red-400">
                    Revoked Credential
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                  <span className="text-base font-light text-emerald-400">
                    Verified Authentic
                  </span>
                </>
              )}
            </div>

            {/* Credential Details */}
            <div className="p-8">
              {result.imageUrl && (
                <div className="h-48 rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-purple-500/5 to-purple-600/5">
                  <img
                    src={result.imageUrl}
                    alt={result.credentialName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-light tracking-wider">
                  {typeLabels[result.credType] ?? "Credential"}
                </span>
                <span className="text-xs text-white/30 font-mono">
                  Token #{result.tokenId}
                </span>
              </div>

              <h2 className="text-3xl font-extralight text-white mb-2">
                {result.credentialName}
              </h2>
              <p className="text-base font-extralight text-white/50 mb-6">{result.institution}</p>

              {result.description && (
                <p className="text-sm font-extralight text-white/40 mb-6 leading-relaxed">
                  {result.description}
                </p>
              )}

              {/* Blockchain Proof */}
              <div className="space-y-4 mt-8 pt-8 border-t border-white/5">
                <h4 className="text-xs font-light text-white/40 uppercase tracking-wider">
                  Blockchain Proof
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Owner</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-white font-mono truncate font-extralight">
                        {result.owner}
                      </p>
                      <button
                        onClick={() => copyToClipboard(result.owner)}
                        className="text-white/20 hover:text-purple-400 shrink-0 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Issuer</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-white font-mono truncate font-extralight">
                        {result.issuer}
                      </p>
                      <button
                        onClick={() => copyToClipboard(result.issuer)}
                        className="text-white/20 hover:text-purple-400 shrink-0 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Issued</p>
                    <p className="text-xs text-white font-extralight">
                      {new Date(result.issueTimestamp * 1000).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Network</p>
                    <p className="text-xs text-white font-extralight">Sepolia Testnet</p>
                  </div>
                </div>

                {result.metadataURI && (
                  <a
                    href={getIPFSUrl(result.metadataURI.replace("ipfs://", ""))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors font-light mt-4"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Metadata on IPFS
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recent Verifications */}
        {recentVerifications.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-sm font-light text-white/40 uppercase tracking-wider mb-4">
              Recent Verifications
            </h3>
            <div className="space-y-3">
              {recentVerifications.map((v, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTokenId(v.tokenId.toString());
                    setResult(v);
                    setError("");
                  }}
                  className="w-full liquid-glass rounded-2xl p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-all duration-300 text-left"
                >
                  <Award className="w-6 h-6 text-purple-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-light text-white truncate">
                      {v.credentialName}
                    </p>
                    <p className="text-xs font-extralight text-white/40">{v.institution}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        v.isRevoked ? "bg-red-400" : "bg-emerald-400"
                      }`}
                    />
                    <ChevronRight className="w-5 h-5 text-white/20" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
