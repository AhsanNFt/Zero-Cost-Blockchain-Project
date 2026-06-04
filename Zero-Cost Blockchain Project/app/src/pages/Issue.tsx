import { useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/components/layout/Layout";
import { useWallet } from "@/hooks/useWallet";
import { useContract } from "@/hooks/useContract";
import { trpc } from "@/providers/trpc";
import { uploadImageToIPFS, uploadJSONToIPFS, getIPFSUri } from "@/services/pinata";
import { SUPPORTED_CHAINS } from "../../lib/multi-chain";
import {
  Loader2,
  Upload,
  FilePlus,
  AlertTriangle,
  Wallet,
  CheckCircle,
  ExternalLink,
  Award,
  ShieldCheck,
} from "lucide-react";

const credentialTypes = [
  { value: "course", label: "Course Completion", enumVal: 0 },
  { value: "bootcamp", label: "Bootcamp", enumVal: 1 },
  { value: "workshop", label: "Workshop", enumVal: 2 },
  { value: "certification", label: "Certification", enumVal: 3 },
  { value: "skillbadge", label: "Skill Badge", enumVal: 4 },
];

export default function Issue() {
  const { isConnected, address, switchToSepolia, isCorrectNetwork, isAddress, chainId } = useWallet();
  const { issueCredential } = useContract();
  const navigate = useNavigate();

  // ✅ FIXED: Hooks must be declared at component top-level, not inside async functions
  const logActivity = trpc.activity.log.useMutation();
  const issueMutation = trpc.credential.issue.useMutation();

  const [form, setForm] = useState({
    recipient: "",
    name: "",
    institution: "",
    credentialType: "course",
    description: "",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState("form");
  const [txHash, setTxHash] = useState("");
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setError("");
    setIsSubmitting(true);
    setStep("uploading");

    try {
      // Validate recipient address
      if (!isAddress(form.recipient)) {
        throw new Error("Invalid recipient wallet address");
      }

      // 1. Upload image to IPFS (with error handling)
      let imageCid = "";
      if (imageFile) {
        try {
          imageCid = await uploadImageToIPFS(imageFile);
        } catch (ipfsError) {
          console.warn("IPFS image upload failed, continuing without image:", ipfsError);
          // Continue without image instead of failing
        }
      }

      // 2. Build and upload metadata to IPFS (with error handling)
      const typeEntry = credentialTypes.find((t) => t.value === form.credentialType);
      const metadata = {
        name: form.name,
        description: form.description || `${form.name} issued by ${form.institution}`,
        image: imageCid ? `ipfs://${imageCid}` : "",
        attributes: [
          { trait_type: "Institution", value: form.institution },
          { trait_type: "Credential Type", value: typeEntry?.label ?? form.credentialType },
          { trait_type: "Issue Date", value: form.issueDate },
          { trait_type: "Recipient", value: form.recipient },
          ...(form.expiryDate ? [{ trait_type: "Expiry Date", value: form.expiryDate }] : []),
        ],
      };

      setStep("pinning");
      let metadataUri = "";
      try {
        const metadataCid = await uploadJSONToIPFS(metadata, form.name);
        metadataUri = getIPFSUri(metadataCid);
      } catch (ipfsError) {
        console.warn("IPFS metadata upload failed, using fallback URI:", ipfsError);
        // Use a fallback metadata URI
        metadataUri = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
      }

      // 3. Issue on blockchain
      setStep("minting");
      const result = await issueCredential(
        form.recipient,
        metadataUri,
        typeEntry?.enumVal ?? 0
      );

      setTxHash(result.txHash);

      // 4. Extract token ID from receipt events (Transfer event has 4 topics: signature, from, to, tokenId)
      let resolvedTokenId = 0;
      try {
        const receipt = result.receipt;
        const transferLog = receipt?.logs?.find((log: any) => log?.topics?.length === 4);
        if (transferLog && transferLog.topics[3]) {
          resolvedTokenId = parseInt(transferLog.topics[3], 16);
        } else {
          // fallback to timestamp to avoid unique constraint violations if receipt is different
          resolvedTokenId = Math.floor(Date.now() / 1000);
        }
      } catch (e) {
        console.warn("Failed to parse token ID, using fallback:", e);
        resolvedTokenId = Math.floor(Date.now() / 1000);
      }
      setMintedTokenId(resolvedTokenId);

      // 5. Save to database using the mutation declared at top level
      setStep("saving");
      const numericChainId = chainId ? parseInt(chainId, 16) : 11155111;
      const chainConfig = SUPPORTED_CHAINS.find((c) => c.chainId === numericChainId);
      await issueMutation.mutateAsync({
        tokenId: resolvedTokenId,
        recipient: form.recipient,
        issuer: address,
        name: form.name,
        institution: form.institution,
        credentialType: form.credentialType as "course" | "bootcamp" | "workshop" | "certification" | "skillbadge",
        description: form.description,
        metadataUri,
        imageCid: imageCid || undefined,
        issueDate: form.issueDate,
        expiryDate: form.expiryDate || undefined,
        transactionHash: result.txHash,
        chainId: numericChainId,
        networkName: chainConfig?.name ?? "Ethereum Sepolia",
      });

      // Log activity
      await logActivity.mutateAsync({
        userAddress: address,
        action: "issue",
        details: { credentialName: form.name, recipient: form.recipient },
        transactionHash: result.txHash,
      });

      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setStep("form");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-3xl font-extralight text-white mb-3">Wallet <span className="font-light gradient-text">Required</span></h2>
            <p className="text-base font-extralight text-white/40 mb-8">Connect your wallet to issue credentials on the blockchain.</p>
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] mb-6">
            <FilePlus className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-extralight text-white/60 uppercase tracking-wider">Credential Issuance</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extralight text-white mb-4 tracking-tight">
            Issue <span className="gradient-text font-light">Credential</span>
          </h1>
          <p className="text-lg font-extralight text-white/40 max-w-2xl mx-auto">
            Create and mint verifiable blockchain credentials with zero-cost deployment
          </p>
        </div>

        {!isCorrectNetwork && (
          <div className="mb-8 liquid-glass rounded-2xl p-6 flex items-center gap-4 max-w-3xl mx-auto">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-light text-amber-300">Please switch to Sepolia Testnet to issue credentials.</p>
            </div>
            <button
              onClick={switchToSepolia}
              className="px-6 py-2.5 rounded-full bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-300 text-sm font-light transition-all duration-300"
            >
              Switch Network
            </button>
          </div>
        )}

        {step === "success" ? (
          <div className="liquid-glass rounded-3xl p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-4xl font-extralight text-white mb-3">Credential <span className="font-light gradient-text">Issued</span></h2>
            <p className="text-base font-extralight text-white/50 mb-6 max-w-md mx-auto">
              Your credential has been minted on Sepolia and is now permanently recorded on the blockchain.
            </p>
            {mintedTokenId !== null && (
              <p className="text-sm text-white/30 font-mono mb-8">Token ID: #{mintedTokenId}</p>
            )}
            {txHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/[0.02] text-sm text-purple-300 hover:border-purple-500/30 hover:bg-purple-500/10 transition-all duration-300 mb-8"
              >
                <ExternalLink className="w-4 h-4" />
                View on Etherscan
              </a>
            )}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setStep("form");
                  setForm({
                    recipient: "",
                    name: "",
                    institution: "",
                    credentialType: "course",
                    description: "",
                    issueDate: new Date().toISOString().split("T")[0],
                    expiryDate: "",
                  });
                  setImageFile(null);
                  setImagePreview("");
                  setTxHash("");
                  setMintedTokenId(null);
                }}
                className="px-6 py-3 rounded-full border border-white/10 text-sm font-light text-white hover:bg-white/[0.02] transition-all duration-300"
              >
                Issue Another
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-light hover:brightness-110 transition-all duration-300"
              >
                View Dashboard
              </button>
            </div>
          </div>
        ) : step !== "form" ? (
          <div className="liquid-glass rounded-3xl p-12 text-center max-w-md mx-auto">
            <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-6" />
            <h3 className="text-2xl font-extralight text-white mb-3">
              {step === "uploading" && "Uploading to IPFS"}
              {step === "pinning" && "Pinning Metadata"}
              {step === "minting" && "Confirm in MetaMask"}
              {step === "saving" && "Saving to Database"}
            </h3>
            <p className="text-sm font-extralight text-white/40">
              {step === "uploading" && "Uploading credential image to Pinata IPFS..."}
              {step === "pinning" && "Uploading metadata JSON to IPFS..."}
              {step === "minting" && "Please confirm the transaction in your MetaMask wallet."}
              {step === "saving" && "Storing credential details in the database..."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {/* Bento Grid Layout - Form + Preview */}
            {/* Form - Takes 3 columns */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 liquid-glass rounded-3xl p-8 space-y-6">
              <div className="mb-6">
                <h3 className="text-2xl font-extralight text-white mb-2">Credential Details</h3>
                <p className="text-sm font-extralight text-white/40">Fill in the information below to mint your credential</p>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm font-light text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-light text-white/60 mb-2">
                  Recipient Wallet Address *
                </label>
                <input
                  type="text"
                  value={form.recipient}
                  onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                  placeholder="0x..."
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-light placeholder-white/20 focus:border-purple-500/40 focus:bg-white/[0.04] outline-none transition-all font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-light text-white/60 mb-2">
                    Credential Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Advanced React Development"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-light placeholder-white/20 focus:border-purple-500/40 focus:bg-white/[0.04] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-white/60 mb-2">
                    Issuing Institution *
                  </label>
                  <input
                    type="text"
                    value={form.institution}
                    onChange={(e) => setForm({ ...form, institution: e.target.value })}
                    placeholder="e.g. Tech University"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-light placeholder-white/20 focus:border-purple-500/40 focus:bg-white/[0.04] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-light text-white/60 mb-2">
                  Credential Type *
                </label>
                <select
                  value={form.credentialType}
                  onChange={(e) => setForm({ ...form, credentialType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-light focus:border-purple-500/40 focus:bg-white/[0.04] outline-none transition-all"
                >
                  {credentialTypes.map((t) => (
                    <option key={t.value} value={t.value} className="bg-black">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-light text-white/60 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the credential..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-light placeholder-white/20 focus:border-purple-500/40 focus:bg-white/[0.04] outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-light text-white/60 mb-2">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-light focus:border-purple-500/40 focus:bg-white/[0.04] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-white/60 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white text-sm font-light focus:border-purple-500/40 focus:bg-white/[0.04] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-light text-white/60 mb-2">
                  Credential Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="credential-image"
                  />
                  <label
                    htmlFor="credential-image"
                    className="flex flex-col items-center justify-center w-full h-32 rounded-xl border border-dashed border-white/10 bg-white/[0.01] cursor-pointer hover:border-purple-500/30 hover:bg-white/[0.02] transition-all"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-contain rounded-xl"
                      />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-white/20 mb-2" />
                        <span className="text-xs font-extralight text-white/30">
                          Click to upload or drag and drop
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isCorrectNetwork}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-light text-sm transition-all duration-300 hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FilePlus className="w-5 h-5" />
                )}
                {isSubmitting ? "Processing..." : "Mint Credential"}
              </button>
            </form>

            {/* Preview - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <div className="liquid-glass rounded-3xl p-8">
                <h3 className="text-xl font-extralight text-white mb-6">
                  Live Preview
                </h3>
                <div className="rounded-2xl border border-white/10 bg-white/[0.01] overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-purple-500/10 to-purple-600/5 flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Credential"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Award className="w-12 h-12 text-white/10" />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300 uppercase font-light tracking-wider">
                        {credentialTypes.find((t) => t.value === form.credentialType)?.label ?? "Credential"}
                      </span>
                    </div>
                    <h4 className="text-lg font-light text-white mb-1">
                      {form.name || "Credential Name"}
                    </h4>
                    <p className="text-sm font-extralight text-white/50 mb-3">
                      {form.institution || "Institution Name"}
                    </p>
                    <p className="text-xs font-extralight text-white/30 mb-4 leading-relaxed">
                      {form.description || "Description will appear here..."}
                    </p>
                    <div className="space-y-1.5 text-xs font-extralight text-white/30 font-mono">
                      <p>
                        Recipient: {form.recipient ? `${form.recipient.slice(0, 10)}...` : "0x..."}
                      </p>
                      <p>Issue Date: {form.issueDate}</p>
                      {form.expiryDate && <p>Expiry: {form.expiryDate}</p>}
                    </div>
                    <div className="mt-5 pt-5 border-t border-white/5 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-extralight text-emerald-400">
                        Verified on SkillChain
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Indicator */}
              <div className="liquid-glass rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-light text-white mb-1">Blockchain Verified</h4>
                    <p className="text-xs font-extralight text-white/40 leading-relaxed">
                      All credentials are immutably stored on Ethereum and can be verified by anyone, anywhere.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
