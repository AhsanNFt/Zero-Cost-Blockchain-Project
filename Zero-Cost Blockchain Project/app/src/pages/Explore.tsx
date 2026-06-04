import { useState } from "react";
import { Link } from "react-router";
import Layout from "@/components/layout/Layout";
import { trpc } from "@/providers/trpc";
import {
  Award,
  Loader2,
  Search,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

const filterTypes = [
  { label: "All", value: "all" },
  { label: "Course", value: "course" },
  { label: "Bootcamp", value: "bootcamp" },
  { label: "Workshop", value: "workshop" },
  { label: "Certification", value: "certification" },
  { label: "Skill Badge", value: "skillbadge" },
];

const typeColors: Record<string, string> = {
  course: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  bootcamp: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  workshop: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  certification: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  skillbadge: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default function Explore() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [offset, setOffset] = useState(0);
  const limit = 12;

  const credsQuery = trpc.credential.list.useQuery({
    limit,
    offset,
  });

  const filteredItems =
    credsQuery.data?.items.filter((cred) =>
      activeFilter === "all" ? true : cred.credentialType === activeFilter
    ) ?? [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Hero Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] mb-4">
              <Search className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-extralight text-white/60 uppercase tracking-wider">Credential Explorer</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-extralight text-white mb-2 tracking-tight">
              Explore <span className="gradient-text font-light">Credentials</span>
            </h1>
            <p className="text-base font-extralight text-white/40">
              Browse all skill-based micro-credentials issued on the blockchain
            </p>
          </div>
          <div className="text-sm font-extralight text-white/30">
            {credsQuery.data?.total ?? 0} total credentials
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-12">
          {filterTypes.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setActiveFilter(filter.value);
                setOffset(0);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-light transition-all duration-300 ${
                activeFilter === filter.value
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                  : "bg-white/[0.02] border border-white/10 text-white/40 hover:text-white hover:border-white/20"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Credential Grid */}
        {credsQuery.isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-white/20" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-extralight text-white mb-2">
              No Credentials Found
            </h3>
            <p className="text-sm font-extralight text-white/40">
              {activeFilter === "all"
                ? "No credentials have been issued yet. Be the first to issue one!"
                : `No ${activeFilter} credentials found. Try a different filter.`}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((cred) => (
                <Link
                  key={cred.id}
                  to={`/credential/${cred.tokenId}`}
                  className="liquid-glass rounded-2xl overflow-hidden hover:bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="h-36 bg-gradient-to-br from-purple-500/10 to-purple-600/5 flex items-center justify-center">
                    <Award className="w-12 h-12 text-white/10" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-2.5 py-1 rounded-full border text-[10px] uppercase font-light tracking-wider ${
                          typeColors[cred.credentialType] ?? typeColors.course
                        }`}
                      >
                        {cred.credentialType}
                      </span>
                      {!cred.isRevoked ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-extralight">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-red-400 font-extralight">
                          <AlertTriangle className="w-3 h-3" /> Revoked
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-light text-white truncate mb-1">
                      {cred.name}
                    </h3>
                    <p className="text-xs font-extralight text-white/50">{cred.institution}</p>
                    <p className="text-[10px] font-extralight text-white/30 font-mono mt-3">
                      {cred.recipientAddress.slice(0, 8)}...
                      {cred.recipientAddress.slice(-6)}
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-extralight text-white/30">
                        {cred.issueDate
                          ? new Date(cred.issueDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                      <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-purple-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {(credsQuery.data?.total ?? 0) > limit && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setOffset((prev) => prev + limit)}
                  disabled={offset + limit >= (credsQuery.data?.total ?? 0)}
                  className="px-8 py-3 rounded-full border border-white/10 text-sm font-light text-white hover:bg-white/[0.02] hover:border-purple-500/30 transition-all duration-300 disabled:opacity-20"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
