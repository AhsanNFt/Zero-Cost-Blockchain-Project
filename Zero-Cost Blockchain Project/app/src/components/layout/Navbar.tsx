import { Link, useLocation, useNavigate } from "react-router";
import { useWallet } from "@/hooks/useWallet";
import { trpc } from "@/providers/trpc";
import { Link2, Wallet, LogOut, Loader2, User, LogIn, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { isConnected, address, connect, disconnect, isConnecting } = useWallet();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
  });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Issue", href: "/issue" },
    { label: "Verify", href: "/verify" },
    { label: "Explore", href: "/explore" },
    { label: "Pathways", href: "/pathways" },
    { label: "Multi-Chain", href: "/multi-chain" },
  ];

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">SkillChain</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                location.pathname === link.href
                  ? "text-white bg-white/5"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth & Wallet */}
        <div className="hidden md:flex items-center gap-3">
          {/* Google Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <User className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white font-medium">
                  {user.name?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : !userLoading ? (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium text-white transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          ) : null}

          {/* Wallet Connection */}
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-white font-mono">
                  {truncateAddress(address)}
                </span>
              </div>
              <button
                onClick={disconnect}
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                title="Disconnect Wallet"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold text-sm disabled:opacity-50"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              {isConnecting ? "Connecting..." : "Connect"}
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-white hover:bg-white/5 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/5 p-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                location.pathname === link.href
                  ? "text-white bg-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/10 space-y-3">
            {!user && (
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
            {!isConnected && (
              <button
                onClick={() => {
                  connect();
                  setMobileMenuOpen(false);
                }}
                disabled={isConnecting}
                className="w-full btn-primary flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-semibold text-sm"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4" />
                )}
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
