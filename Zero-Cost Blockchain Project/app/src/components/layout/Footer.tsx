import { Link2, ExternalLink } from "lucide-react";

export default function Footer() {
  const apis = [
    { name: "MetaMask", url: "https://metamask.io" },
    { name: "Alchemy", url: "https://alchemy.com" },
    { name: "Pinata", url: "https://pinata.cloud" },
    { name: "Ethers.js", url: "https://ethers.org" },
  ];

  return (
    <footer className="border-t border-[#1E293B] bg-[#111827]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-5 h-5 text-[#00D4FF]" />
              <span className="text-lg font-bold gradient-text">SkillChain</span>
            </div>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Decentralized micro-credential verification platform. Built with
              zero-cost infrastructure using free Web3 APIs. Fill the gap in
              skill-based credential verification.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#F1F5F9] uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2">
              {["Dashboard", "Issue Credential", "Verify", "Explore"].map(
                (link) => (
                  <span
                    key={link}
                    className="text-sm text-[#64748B] hover:text-[#00D4FF] transition-colors cursor-pointer"
                  >
                    {link}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Powered By */}
          <div>
            <h3 className="text-sm font-semibold text-[#F1F5F9] uppercase tracking-wider mb-4">
              Powered By
            </h3>
            <div className="flex flex-wrap gap-3">
              {apis.map((api) => (
                <a
                  key={api.name}
                  href={api.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A2235] border border-[#1E293B] text-xs text-[#94A3B8] hover:text-[#00D4FF] hover:border-[#00D4FF]/30 transition-all"
                >
                  {api.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#1E293B] text-center">
          <p className="text-xs text-[#64748B]">
            &copy; {new Date().getFullYear()} SkillChain. University Project.
            Built with free Web3 APIs on Sepolia Testnet.
          </p>
        </div>
      </div>
    </footer>
  );
}
