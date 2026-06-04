import { useState, useRef, useCallback } from "react";
import { Link } from "react-router";
import Layout from "@/components/layout/Layout";
import { useWallet } from "@/hooks/useWallet";
import { useContract } from "@/hooks/useContract";
import { trpc } from "@/providers/trpc";
import {
  Upload,
  FileText,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  Trash2,
  AlertTriangle,
  Users,
  ArrowLeft,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface BulkRow {
  id: string;
  recipientAddress: string;
  name: string;
  institution: string;
  credentialType: "course" | "bootcamp" | "workshop" | "certification" | "skillbadge";
  description: string;
  status: "pending" | "processing" | "success" | "error";
  error?: string;
  tokenId?: number;
}

const CREDENTIAL_TYPE_MAP: Record<string, number> = {
  course: 0,
  bootcamp: 1,
  workshop: 2,
  certification: 3,
  skillbadge: 4,
};

const CSV_TEMPLATE = `recipientAddress,name,institution,credentialType,description
0xRecipientWalletAddress,React Developer Certification,Acme Bootcamp,certification,Completed 12-week React course
0xAnotherWalletAddress,Python Fundamentals,Code Academy,course,Introduction to Python programming
`;

function parseCSV(text: string): BulkRow[] {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line, i) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ""; });
    return {
      id: `row-${i}-${Date.now()}`,
      recipientAddress: row["recipientaddress"] ?? row["recipient_address"] ?? row["address"] ?? "",
      name: row["name"] ?? "",
      institution: row["institution"] ?? "",
      credentialType: (row["credentialtype"] ?? row["credential_type"] ?? "course") as BulkRow["credentialType"],
      description: row["description"] ?? "",
      status: "pending",
    };
  });
}

function validateRow(row: BulkRow): string | null {
  if (!row.recipientAddress || !/^0x[0-9a-fA-F]{40}$/.test(row.recipientAddress))
    return "Invalid Ethereum address";
  if (!row.name.trim()) return "Name is required";
  if (!row.institution.trim()) return "Institution is required";
  if (!["course", "bootcamp", "workshop", "certification", "skillbadge"].includes(row.credentialType))
    return "Invalid credential type";
  return null;
}

import { SUPPORTED_CHAINS } from "../../lib/multi-chain";

export default function BulkIssue() {
  const { isConnected, address, chainId } = useWallet();
  const { issueCredential } = useContract();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const issueCredentialMutation = trpc.credential.issue.useMutation();

  const [rows, setRows] = useState<BulkRow[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const pauseRef = useRef(false);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) processFile(file);
  }, []);

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_issue_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadResults = () => {
    const header = "recipientAddress,name,institution,credentialType,status,tokenId,error\n";
    const csvRows = rows.map((r) =>
      `${r.recipientAddress},${r.name},${r.institution},${r.credentialType},${r.status},${r.tokenId ?? ""},${r.error ?? ""}`
    ).join("\n");
    const blob = new Blob([header + csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_issue_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const runBulkIssue = async () => {
    if (!address || isRunning) return;
    pauseRef.current = false;
    setIsRunning(true);
    setIsPaused(false);

    for (let i = 0; i < rows.length; i++) {
      // Wait while paused
      while (pauseRef.current) {
        await new Promise((r) => setTimeout(r, 300));
      }

      const row = rows[i];
      if (row.status === "success") continue;

      const validationError = validateRow(row);
      if (validationError) {
        setRows((prev) =>
          prev.map((r) => r.id === row.id ? { ...r, status: "error", error: validationError } : r)
        );
        continue;
      }

      setRows((prev) =>
        prev.map((r) => r.id === row.id ? { ...r, status: "processing" } : r)
      );

      try {
        const credTypeNum = CREDENTIAL_TYPE_MAP[row.credentialType] ?? 0;
        const result = await issueCredential(
          row.recipientAddress,
          `ipfs://placeholder-${row.id}`,
          credTypeNum
        );

        // Extract actual token ID from receipt events (Transfer event has 4 topics)
        let tokenId = 0;
        try {
          const receipt = result?.receipt;
          const transferLog = receipt?.logs?.find((log: any) => log?.topics?.length === 4);
          if (transferLog && transferLog.topics[3]) {
            tokenId = parseInt(transferLog.topics[3], 16);
          } else {
            // fallback to timestamp to avoid conflicts
            tokenId = Math.floor(Date.now() / 1000) + i;
          }
        } catch {
          tokenId = Math.floor(Date.now() / 1000) + i;
        }

        const numericChainId = chainId ? parseInt(chainId, 16) : 11155111;
        const chainConfig = SUPPORTED_CHAINS.find((c) => c.chainId === numericChainId);

        await issueCredentialMutation.mutateAsync({
          tokenId,
          recipient: row.recipientAddress,
          issuer: address,
          name: row.name,
          institution: row.institution,
          credentialType: row.credentialType,
          description: row.description || undefined,
          metadataUri: `ipfs://placeholder-${row.id}`,
          issueDate: new Date().toISOString(),
          transactionHash: result?.txHash ?? `0x${"0".repeat(64)}`,
          chainId: numericChainId,
          networkName: chainConfig?.name ?? "Ethereum Sepolia",
        });

        setRows((prev) =>
          prev.map((r) => r.id === row.id ? { ...r, status: "success", tokenId } : r)
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Transaction failed";
        setRows((prev) =>
          prev.map((r) => r.id === row.id ? { ...r, status: "error", error: msg } : r)
        );
      }

      // Small delay between transactions to avoid nonce issues
      await new Promise((r) => setTimeout(r, 500));
    }

    setIsRunning(false);
    setIsPaused(false);
  };

  const togglePause = () => {
    pauseRef.current = !pauseRef.current;
    setIsPaused(pauseRef.current);
  };

  const clearRows = () => {
    setRows([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const successCount = rows.filter((r) => r.status === "success").length;
  const errorCount = rows.filter((r) => r.status === "error").length;
  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const processingCount = rows.filter((r) => r.status === "processing").length;
  const progress = rows.length > 0 ? ((successCount + errorCount) / rows.length) * 100 : 0;

  if (!isConnected) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-amber-400/40 mx-auto mb-4" />
            <h2 className="text-2xl font-extralight text-white mb-2">Wallet Required</h2>
            <p className="text-sm font-extralight text-white/40 mb-6">Connect your wallet to use Bulk Issuance.</p>
            <Link to="/" className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-light hover:brightness-110 transition-all">
              Go to Home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <div className="mb-10">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] mb-4">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-extralight text-white/60 uppercase tracking-wider">Bulk Issuance Tool</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-extralight text-white mb-3 tracking-tight">
            Issue <span className="gradient-text font-light">In Bulk</span>
          </h1>
          <p className="text-base font-extralight text-white/40 max-w-2xl">
            Upload a CSV file to issue multiple credentials at once. Each row becomes a blockchain credential.
          </p>
        </div>

        {/* Info Banner */}
        <div className="liquid-glass rounded-2xl p-5 mb-8 flex items-start gap-4">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-light text-white mb-1">How it works</p>
            <p className="text-xs font-extralight text-white/50 leading-relaxed">
              Upload a CSV with recipient addresses and credential details. The tool processes each row sequentially,
              minting one blockchain transaction per credential. You can pause and resume at any time.
              Each transaction requires a MetaMask confirmation.
            </p>
          </div>
        </div>

        {/* Upload Area */}
        {rows.length === 0 && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`liquid-glass rounded-3xl p-12 text-center mb-8 border-2 border-dashed transition-all duration-300 cursor-pointer ${
              dragOver ? "border-purple-500/50 bg-purple-500/5" : "border-white/10 hover:border-white/20"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            <Upload className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-light text-white mb-2">Drop your CSV file here</h3>
            <p className="text-sm font-extralight text-white/40 mb-6">or click to browse</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.02] text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>
          </div>
        )}

        {/* CSV Loaded - Stats + Controls */}
        {rows.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total", value: rows.length, color: "text-white" },
                { label: "Pending", value: pendingCount + processingCount, color: "text-white/60" },
                { label: "Success", value: successCount, color: "text-emerald-400" },
                { label: "Failed", value: errorCount, color: "text-red-400" },
              ].map((s) => (
                <div key={s.label} className="liquid-glass rounded-2xl p-4 text-center">
                  <div className={`text-3xl font-extralight mb-1 ${s.color}`}>{s.value}</div>
                  <div className="text-xs font-extralight text-white/40">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            {(isRunning || successCount + errorCount > 0) && (
              <div className="liquid-glass rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-light text-white">Progress</span>
                  <span className="text-sm font-extralight text-white/60">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              {!isRunning ? (
                <button
                  onClick={runBulkIssue}
                  disabled={rows.every((r) => r.status === "success")}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-light hover:brightness-110 transition-all disabled:opacity-40"
                >
                  <Play className="w-4 h-4" />
                  {successCount > 0 ? "Resume / Retry Failed" : "Start Issuing"}
                </button>
              ) : (
                <button
                  onClick={togglePause}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-light transition-all ${
                    isPaused
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:brightness-110"
                      : "border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                  }`}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? "Resume" : "Pause"}
                </button>
              )}
              {successCount + errorCount > 0 && (
                <button
                  onClick={downloadResults}
                  className="flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 bg-white/[0.02] text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export Results
                </button>
              )}
              {!isRunning && (
                <button
                  onClick={clearRows}
                  className="flex items-center gap-2 px-5 py-3 rounded-full border border-red-500/20 bg-red-500/5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>

            {/* Rows Table */}
            <div className="space-y-2">
              <div className="hidden sm:grid grid-cols-12 gap-3 px-4 mb-2">
                <span className="col-span-3 text-xs font-extralight text-white/30 uppercase tracking-wider">Recipient</span>
                <span className="col-span-3 text-xs font-extralight text-white/30 uppercase tracking-wider">Credential</span>
                <span className="col-span-3 text-xs font-extralight text-white/30 uppercase tracking-wider">Institution</span>
                <span className="col-span-2 text-xs font-extralight text-white/30 uppercase tracking-wider">Type</span>
                <span className="col-span-1 text-xs font-extralight text-white/30 uppercase tracking-wider">Status</span>
              </div>

              {rows.map((row) => (
                <div key={row.id} className="liquid-glass rounded-2xl overflow-hidden">
                  <button
                    className="w-full grid grid-cols-12 gap-3 p-4 text-left hover:bg-white/[0.02] transition-all"
                    onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                  >
                    <div className="col-span-3 min-w-0">
                      <p className="text-xs font-mono text-white/60 truncate">
                        {row.recipientAddress
                          ? `${row.recipientAddress.slice(0, 6)}...${row.recipientAddress.slice(-4)}`
                          : <span className="text-red-400">Missing</span>}
                      </p>
                    </div>
                    <div className="col-span-3 min-w-0">
                      <p className="text-xs font-light text-white truncate">{row.name || <span className="text-white/30">—</span>}</p>
                    </div>
                    <div className="col-span-3 min-w-0">
                      <p className="text-xs font-extralight text-white/50 truncate">{row.institution || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300 capitalize">
                        {row.credentialType}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center justify-between">
                      {row.status === "pending" && <div className="w-2 h-2 rounded-full bg-white/20" />}
                      {row.status === "processing" && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
                      {row.status === "success" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      {row.status === "error" && <XCircle className="w-4 h-4 text-red-400" />}
                      {expandedRow === row.id
                        ? <ChevronUp className="w-3 h-3 text-white/20" />
                        : <ChevronDown className="w-3 h-3 text-white/20" />}
                    </div>
                  </button>

                  {expandedRow === row.id && (
                    <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-2">
                      <p className="text-xs font-extralight text-white/40">
                        <span className="text-white/20">Address:</span> {row.recipientAddress || "—"}
                      </p>
                      {row.description && (
                        <p className="text-xs font-extralight text-white/40">
                          <span className="text-white/20">Description:</span> {row.description}
                        </p>
                      )}
                      {row.tokenId !== undefined && (
                        <p className="text-xs font-extralight text-emerald-400">
                          Token ID: #{row.tokenId}
                        </p>
                      )}
                      {row.error && (
                        <p className="text-xs font-extralight text-red-400">
                          Error: {row.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* CSV Format Guide */}
        <div className="mt-10 liquid-glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-light text-white">CSV Format Guide</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-extralight">
              <thead>
                <tr className="border-b border-white/5">
                  {["Column", "Required", "Values", "Example"].map((h) => (
                    <th key={h} className="text-left py-2 pr-4 text-white/30 uppercase tracking-wider font-light">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["recipientAddress", "Yes", "0x Ethereum address", "0xAbCd...1234"],
                  ["name", "Yes", "Any text", "React Developer Cert"],
                  ["institution", "Yes", "Any text", "Acme Bootcamp"],
                  ["credentialType", "Yes", "course | bootcamp | workshop | certification | skillbadge", "certification"],
                  ["description", "No", "Any text", "Completed 12-week course"],
                ].map(([col, req, vals, ex]) => (
                  <tr key={col}>
                    <td className="py-2 pr-4 text-purple-300 font-mono">{col}</td>
                    <td className="py-2 pr-4 text-white/50">{req}</td>
                    <td className="py-2 pr-4 text-white/40">{vals}</td>
                    <td className="py-2 text-white/30 font-mono">{ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={downloadTemplate}
            className="mt-4 flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors font-light"
          >
            <Download className="w-4 h-4" />
            Download CSV Template
          </button>
        </div>
      </div>
    </Layout>
  );
}
