import { useParams, Link } from "react-router";
import Layout from "@/components/layout/Layout";
import { trpc } from "@/providers/trpc";
import { getIPFSUrl } from "@/services/pinata";
import { getEtherscanLink } from "@/services/alchemy";
import {
  Award,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Copy,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

const typeLabels: Record<string, string> = {
  course: "Course Completion",
  bootcamp: "Bootcamp",
  workshop: "Workshop",
  certification: "Certification",
  skillbadge: "Skill Badge",
};

const typeColors: Record<string, string> = {
  course: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  bootcamp: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  workshop: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  certification: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  skillbadge: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default function CredentialDetail() {
  const { id } = useParams<{ id: string }>();
  const tokenId = parseInt(id ?? "0");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const credQuery = trpc.credential.getByTokenId.useQuery(
    { tokenId },
    { enabled: !isNaN(tokenId) }
  );

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isNaN(tokenId)) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="glass rounded-2xl p-10 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-[#F1F5F9] mb-2">
              Invalid Token ID
            </h2>
            <p className="text-sm text-[#94A3B8]">
              The provided token ID is not valid.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Link */}
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#00D4FF] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>

        {credQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-[#64748B]" />
          </div>
        ) : !credQuery.data ? (
          <div className="glass rounded-2xl p-10 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-[#F1F5F9] mb-2">
              Credential Not Found
            </h2>
            <p className="text-sm text-[#94A3B8] mb-4">
              This credential may not have been indexed yet, or the token ID does
              not exist on the blockchain.
            </p>
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-[#0B0E1A] text-sm font-semibold hover:brightness-110 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Try Verifying
            </Link>
          </div>
        ) : (
          <>
            {/* Hero Card */}
            <div className="glass rounded-2xl overflow-hidden mb-6">
              <div
                className={`p-4 flex items-center gap-3 ${
                  credQuery.data.isRevoked
                    ? "bg-red-500/10 border-b border-red-500/30"
                    : "bg-emerald-500/10 border-b border-emerald-500/30"
                }`}
              >
                {credQuery.data.isRevoked ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-sm font-semibold text-red-400">
                      This credential has been revoked
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-400">
                      Verified Authentic on Blockchain
                    </span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                {/* Image */}
                <div className="md:col-span-2 h-56 md:h-auto bg-gradient-to-br from-[#00D4FF]/10 to-[#8B5CF6]/10 flex items-center justify-center">
                  <Award className="w-20 h-20 text-[#00D4FF]/30" />
                </div>

                {/* Details */}
                <div className="md:col-span-3 p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-full border text-xs ${
                        typeColors[credQuery.data.credentialType] ??
                        typeColors.course
                      }`}
                    >
                      {typeLabels[credQuery.data.credentialType] ?? "Credential"}
                    </span>
                    <span className="text-xs text-[#64748B] font-mono">
                      #{credQuery.data.tokenId}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mb-2">
                    {credQuery.data.name}
                  </h1>
                  <p className="text-base text-[#94A3B8] mb-4">
                    {credQuery.data.institution}
                  </p>

                  {credQuery.data.description && (
                    <p className="text-sm text-[#64748B] leading-relaxed mb-5">
                      {credQuery.data.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#64748B] w-20 shrink-0">
                        Recipient
                      </span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm text-[#F1F5F9] font-mono truncate">
                          {credQuery.data.recipientAddress}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              credQuery.data.recipientAddress,
                              "recipient"
                            )
                          }
                          className="text-[#64748B] hover:text-[#00D4FF] shrink-0"
                        >
                          {copiedField === "recipient" ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#64748B] w-20 shrink-0">
                        Issuer
                      </span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm text-[#F1F5F9] font-mono truncate">
                          {credQuery.data.issuerAddress}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              credQuery.data.issuerAddress,
                              "issuer"
                            )
                          }
                          className="text-[#64748B] hover:text-[#00D4FF] shrink-0"
                        >
                          {copiedField === "issuer" ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#64748B] w-20 shrink-0">
                        Issued
                      </span>
                      <span className="text-sm text-[#F1F5F9]">
                        {credQuery.data.issueDate
                          ? new Date(credQuery.data.issueDate).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </span>
                    </div>

                    {credQuery.data.expiryDate && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#64748B] w-20 shrink-0">
                          Expires
                        </span>
                        <span className="text-sm text-[#F1F5F9]">
                          {new Date(credQuery.data.expiryDate).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "long", day: "numeric" }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Blockchain Proof */}
            <div className="glass rounded-2xl p-6 sm:p-8">
              <h3 className="text-sm font-semibold text-[#64748B] uppercase tracking-wider mb-4">
                Blockchain Proof
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <p className="text-[10px] text-[#64748B] uppercase mb-1">
                    Contract Address
                  </p>
                  <a
                    href={`https://sepolia.etherscan.io/address/${credQuery.data.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#00D4FF] hover:underline font-mono"
                  >
                    {credQuery.data.contractAddress.slice(0, 12)}...
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-4 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <p className="text-[10px] text-[#64748B] uppercase mb-1">
                    Token ID
                  </p>
                  <p className="text-sm text-[#F1F5F9] font-mono">
                    {credQuery.data.tokenId}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <p className="text-[10px] text-[#64748B] uppercase mb-1">
                    Transaction Hash
                  </p>
                  <a
                    href={getEtherscanLink(credQuery.data.transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#00D4FF] hover:underline font-mono"
                  >
                    {credQuery.data.transactionHash.slice(0, 16)}...
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-4 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <p className="text-[10px] text-[#64748B] uppercase mb-1">
                    Block Number
                  </p>
                  <p className="text-sm text-[#F1F5F9] font-mono">
                    {credQuery.data.blockNumber ?? "Pending"}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <p className="text-[10px] text-[#64748B] uppercase mb-1">
                    IPFS Metadata
                  </p>
                  <a
                    href={getIPFSUrl(
                      credQuery.data.metadataUri.replace("ipfs://", "")
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#00D4FF] hover:underline font-mono"
                  >
                    {credQuery.data.metadataUri.slice(0, 20)}...
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-4 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <p className="text-[10px] text-[#64748B] uppercase mb-1">
                    Network
                  </p>
                  <p className="text-sm text-[#F1F5F9]">
                    Sepolia Testnet (Chain ID: 11155111)
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
