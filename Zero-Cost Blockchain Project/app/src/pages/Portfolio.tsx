import { useState } from "react";
import { useParams, Link } from "react-router";
import Layout from "@/components/layout/Layout";
import { trpc } from "@/providers/trpc";
import SkillVisualization from "@/components/SkillVisualization";
import {
  Award,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Share2,
  Download,
  Star,
  TrendingUp,
  Calendar,
  Building,
  GraduationCap,
  Briefcase,
} from "lucide-react";

export default function Portfolio() {
  const { address } = useParams<{ address: string }>();
  const [copied, setCopied] = useState(false);

  const credsQuery = trpc.credential.list.useQuery(
    { owner: address, limit: 100 },
    { enabled: !!address }
  );

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const truncateAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Calculate statistics
  const stats = {
    total: credsQuery.data?.items.length || 0,
    valid: credsQuery.data?.items.filter((c) => !c.isRevoked).length || 0,
    institutions: new Set(credsQuery.data?.items.map((c) => c.institution)).size || 0,
    types: credsQuery.data?.items.reduce((acc, cred) => {
      acc[cred.credentialType] = (acc[cred.credentialType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
  };

  // Group credentials by type
  const groupedCredentials = credsQuery.data?.items.reduce((acc, cred) => {
    if (!acc[cred.credentialType]) {
      acc[cred.credentialType] = [];
    }
    acc[cred.credentialType].push(cred);
    return acc;
  }, {} as Record<string, typeof credsQuery.data.items>);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <div className="liquid-glass rounded-3xl p-8 lg:p-12 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-3xl font-light">
                {address?.slice(2, 4).toUpperCase()}
              </div>
              
              <div>
                <h1 className="text-3xl lg:text-4xl font-extralight text-white mb-2">
                  Credential <span className="font-light gradient-text">Portfolio</span>
                </h1>
                <p className="text-sm font-extralight text-white/60 font-mono mb-3">
                  {address ? truncateAddr(address) : "Unknown"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified on Blockchain
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] text-white hover:bg-white/[0.05] transition-all text-sm"
              >
                <Share2 className="w-4 h-4" />
                {copied ? "Copied!" : "Share"}
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:brightness-110 transition-all text-sm"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-3xl font-extralight text-white mb-1">{stats.total}</div>
              <div className="text-xs font-extralight text-white/40">Total Credentials</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-3xl font-extralight text-emerald-400 mb-1">{stats.valid}</div>
              <div className="text-xs font-extralight text-white/40">Valid</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-3xl font-extralight text-purple-400 mb-1">{stats.institutions}</div>
              <div className="text-xs font-extralight text-white/40">Institutions</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-3xl font-extralight text-blue-400 mb-1">
                {Object.keys(stats.types).length}
              </div>
              <div className="text-xs font-extralight text-white/40">Types</div>
            </div>
          </div>
        </div>

        {/* Skill Visualization */}
        {credsQuery.data && credsQuery.data.items.length > 0 && (
          <div className="mb-8">
            <SkillVisualization credentials={credsQuery.data.items} />
          </div>
        )}

        {/* Credentials by Type */}
        {credsQuery.isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : credsQuery.data?.items.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-12 text-center">
            <Award className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-extralight text-white mb-2">No Credentials Yet</h3>
            <p className="text-sm font-extralight text-white/40">
              This wallet doesn't have any credentials yet.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedCredentials || {}).map(([type, credentials]) => (
              <div key={type}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    {type === "certification" ? (
                      <Star className="w-5 h-5 text-purple-400" />
                    ) : type === "bootcamp" ? (
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    ) : type === "course" ? (
                      <GraduationCap className="w-5 h-5 text-purple-400" />
                    ) : type === "workshop" ? (
                      <Briefcase className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Award className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <h2 className="text-2xl font-extralight text-white capitalize">
                    {type}s <span className="text-white/40 text-lg">({credentials.length})</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {credentials.map((cred) => (
                    <Link
                      key={cred.id}
                      to={`/credential/${cred.tokenId}`}
                      className="liquid-glass rounded-2xl overflow-hidden hover:bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 group"
                    >
                      {/* Credential Image/Header */}
                      <div className="h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/5 flex items-center justify-center relative">
                        <Award className="w-12 h-12 text-white/10" />
                        {!cred.isRevoked ? (
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-400">
                            <CheckCircle className="w-3 h-3" />
                            Valid
                          </div>
                        ) : (
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] text-red-400">
                            <AlertTriangle className="w-3 h-3" />
                            Revoked
                          </div>
                        )}
                      </div>

                      {/* Credential Details */}
                      <div className="p-5">
                        <h3 className="text-base font-light text-white mb-2 line-clamp-2">
                          {cred.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
                          <Building className="w-3 h-3" />
                          <span className="truncate">{cred.institution}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(cred.issueDate).toLocaleDateString()}</span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-extralight text-white/30 font-mono">
                            #{cred.tokenId}
                          </span>
                          <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-purple-400 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm font-extralight text-white/40 mb-4">
            Powered by SkillChain - Blockchain Credential Verification
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Create Your Portfolio
            </Link>
            <span className="text-white/20">•</span>
            <Link
              to="/verify"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Verify Credentials
            </Link>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .liquid-glass {
            background: white !important;
            border: 1px solid #e5e7eb !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
}
