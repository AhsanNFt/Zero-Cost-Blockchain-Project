import { Link } from "react-router";
import { useWallet } from "@/hooks/useWallet";
import Layout from "@/components/layout/Layout";
import { trpc } from "@/providers/trpc";
import { motion } from "framer-motion";
import {
  Award,
  Wallet,
  ShieldCheck,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2,
  Zap,
  Database,
  Image,
  Code2,
  Twitter,
  Github,
  Linkedin,
  Mail,
  Lock,
  Globe,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const { connect, isConnecting } = useWallet();
  const statsQuery = trpc.credential.getStats.useQuery();

  const stats = [
    { value: statsQuery.data?.totalIssued ?? 0, suffix: "+", label: "Credentials Issued" },
    { value: statsQuery.data?.totalIssuers ?? 0, suffix: "", label: "Verified Institutions" },
    { value: statsQuery.data?.totalVerified ?? 0, suffix: "", label: "Verifications" },
    { value: "100", suffix: "%", label: "Tamper-Proof" },
  ];

  const features = [
    {
      icon: Lock,
      title: "Non-Custodial Security",
      description: "Your credentials, your keys. Full ownership with blockchain-grade encryption.",
      gradient: "from-purple-500/20 to-violet-500/20",
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description: "Verify credentials in seconds, not weeks. No intermediaries required.",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Globe,
      title: "Global Recognition",
      description: "Credentials accepted worldwide. Portable across platforms and borders.",
      gradient: "from-violet-500/20 to-purple-500/20",
    },
    {
      icon: Sparkles,
      title: "Zero-Cost Deployment",
      description: "Built on free-tier infrastructure. No hidden fees or subscription costs.",
      gradient: "from-cyan-500/20 to-blue-500/20",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <Layout>
      {/* Grid Background */}
      <div className="grid-bg" />
      
      {/* Noise Texture */}
      <div className="noise" />

      {/* Animated Background Orbs */}
      <div className="animated-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Immersive Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6">
          <div className="max-w-7xl mx-auto w-full py-32">
            <motion.div
              className="text-center max-w-5xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Badge */}
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/80 mb-12 backdrop-blur-xl">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                BLOCKCHAIN-POWERED CREDENTIALS
              </motion.div>

              {/* Hero Heading - Premium Typography */}
              <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-7xl sm:text-8xl lg:text-9xl font-extralight text-white/30 leading-[0.9] tracking-tighter mb-4">
                  Secure.
                </h1>
                <h1 className="text-7xl sm:text-8xl lg:text-9xl font-extralight text-white leading-[0.9] tracking-tighter text-glow">
                  Verifiable.
                </h1>
              </motion.div>

              {/* Value Proposition */}
              <motion.p variants={itemVariants} className="text-xl text-white/50 max-w-2xl mx-auto mb-16 leading-relaxed font-light">
                The future of credential verification. Instantly trustworthy, incredibly secure, and as accessible as traditional banking.
              </motion.p>

              {/* High-Converting CTA */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4 mb-24">
                <button
                  onClick={connect}
                  disabled={isConnecting}
                  className="btn-primary flex items-center gap-3 px-10 py-5 rounded-full text-white font-medium text-lg disabled:opacity-50 shadow-2xl"
                >
                  {isConnecting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Wallet className="w-5 h-5" />
                  )}
                  {isConnecting ? "Connecting..." : "Get Early Access"}
                </button>
                <Link
                  to="/verify"
                  className="flex items-center gap-3 px-10 py-5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium text-lg transition-all backdrop-blur-xl"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Verify Credential
                </Link>
              </motion.div>

              {/* Stats - Minimal & Premium */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-12 max-w-5xl mx-auto">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    className="text-center group cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="text-6xl font-extralight gradient-text mb-3 group-hover:scale-110 transition-transform">
                      {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                      {stat.suffix}
                    </div>
                    <div className="text-xs text-white/40 font-light uppercase tracking-widest">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Bento Grid Features Section */}
        <section className="relative max-w-7xl mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl font-extralight text-white mb-6">
              Built for the future
            </h2>
            <p className="text-xl text-white/40 max-w-2xl mx-auto font-light">
              Complex blockchain technology, simplified for everyone
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className={`bg-white/5 border border-white/10 rounded-3xl p-10 relative overflow-hidden group cursor-pointer backdrop-blur-xl ${
                  i === 0 ? "md:col-span-2" : ""
                }`}
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-light text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-white/50 leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="relative max-w-7xl mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-16 backdrop-blur-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-5xl font-extralight text-white mb-6">
                  Why SkillChain?
                </h2>
                <p className="text-lg text-white/50 leading-relaxed font-light mb-8">
                  The $400B skills economy lacks a unified trust layer. We're changing that with blockchain-powered verification that's instant, secure, and accessible to everyone.
                </p>
                <div className="space-y-4">
                  {[
                    "Non-custodial security - You own your credentials",
                    "Instant verification - No waiting, no intermediaries",
                    "Global recognition - Accepted worldwide",
                    "Zero infrastructure cost - Built on free-tier APIs",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-400 shrink-0 mt-1" />
                      <span className="text-white/70 font-light">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Card */}
              <div className="space-y-6">
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <h4 className="text-sm font-medium text-red-400 uppercase tracking-wider">
                      Traditional Systems
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm text-white/40 font-light">
                    <li>• Weeks to verify credentials</li>
                    <li>• Centralized databases vulnerable to breaches</li>
                    <li>• Prone to forgery and fraud</li>
                    <li>• High verification costs</li>
                  </ul>
                </div>
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                    <h4 className="text-sm font-medium text-purple-400 uppercase tracking-wider">
                      SkillChain
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm text-white/70 font-light">
                    <li>• Instant verification by token ID or QR</li>
                    <li>• Decentralized and immutable on blockchain</li>
                    <li>• Cryptographically secure NFT credentials</li>
                    <li>• Zero infrastructure cost</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Premium Footer with Liquid Glass */}
        <motion.footer
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="liquid-glass w-full max-w-7xl mx-auto rounded-3xl p-10 md:p-16 text-white/70 mt-32 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-light text-white">SkillChain</span>
              </div>
              <p className="text-base leading-relaxed max-w-sm text-white/50 font-light">
                Blockchain-powered credential verification for the modern workforce. Transparent, secure, and accessible to all.
              </p>
            </div>

            {/* Links Section */}
            <div className="md:col-span-7 grid grid-cols-3 gap-10">
              <div>
                <h4 className="text-sm uppercase tracking-widest text-white font-medium mb-6">Platform</h4>
                <ul className="text-sm space-y-3 font-light">
                  <li><Link to="/issue" className="hover:text-white transition-colors">Issue Credentials</Link></li>
                  <li><Link to="/verify" className="hover:text-white transition-colors">Verify</Link></li>
                  <li><Link to="/explore" className="hover:text-white transition-colors">Explore</Link></li>
                  <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm uppercase tracking-widest text-white font-medium mb-6">Company</h4>
                <ul className="text-sm space-y-3 font-light">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm uppercase tracking-widest text-white font-medium mb-6">Legal</h4>
                <ul className="text-sm space-y-3 font-light">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs uppercase tracking-widest opacity-40 font-light">
              © 2026 SkillChain. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs uppercase tracking-widest opacity-40 font-light">Connect:</span>
              <div className="flex items-center gap-4">
                <a href="#" className="opacity-50 hover:opacity-100 transition-opacity hover:text-white">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="opacity-50 hover:opacity-100 transition-opacity hover:text-white">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="opacity-50 hover:opacity-100 transition-opacity hover:text-white">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="opacity-50 hover:opacity-100 transition-opacity hover:text-white">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </Layout>
  );
}
