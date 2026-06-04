import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { motion } from "framer-motion";
import { Chrome, Shield, Eye, EyeOff, Mail, Lock, User, CheckCircle2 } from "lucide-react";

function getOAuthUrl() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", googleClientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);

  return url.toString();
}

// Feature Item Component
function FeatureItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-purple-400" />
      </div>
      <span className="text-sm font-extralight text-white/60">{text}</span>
    </motion.div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      <div className="grid-bg"></div>
      <div className="noise"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Branding & Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-center space-y-12 lg:pr-12"
          >
            {/* Logo & Tagline */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-light text-white">SkillChain</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extralight text-white mb-4 leading-tight">
                Blockchain-Verified <br />
                <span className="gradient-text font-light">Credentials</span>
              </h1>
              <p className="text-base font-extralight text-white/50 leading-relaxed">
                Join the future of credential verification. Secure, transparent, and globally recognized.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <FeatureItem icon={Shield} text="Non-custodial security with blockchain verification" />
              <FeatureItem icon={CheckCircle2} text="Instant credential issuance and verification" />
              <FeatureItem icon={Lock} text="Immutable records stored on Ethereum" />
            </div>

            {/* Trust Badge */}
            <div className="liquid-glass rounded-2xl p-6">
              <p className="text-xs font-extralight text-white/40 mb-2">Trusted by</p>
              <div className="flex items-center gap-6">
                <div className="text-white/60 font-light text-sm">Universities</div>
                <div className="w-px h-4 bg-white/10"></div>
                <div className="text-white/60 font-light text-sm">Bootcamps</div>
                <div className="w-px h-4 bg-white/10"></div>
                <div className="text-white/60 font-light text-sm">Enterprises</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <div className="w-full max-w-md liquid-glass rounded-3xl p-8 lg:p-10">
              {/* Form Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-extralight text-white mb-2">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-sm font-extralight text-white/40">
                  {isSignUp
                    ? "Start your journey with blockchain credentials"
                    : "Sign in to access your credentials"}
                </p>
              </div>

              {/* Google OAuth Button */}
              <button
                onClick={() => {
                  window.location.href = getOAuthUrl();
                }}
                className="w-full flex items-center justify-center gap-3 h-12 rounded-full bg-white text-black font-light text-sm hover:bg-white/90 transition-all duration-300 mb-6"
              >
                <Chrome className="w-5 h-5" />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black px-4 text-xs font-extralight text-white/30 uppercase tracking-widest">
                    Or
                  </span>
                </div>
              </div>

              {/* Form */}
              <form className="space-y-5">
                {isSignUp && (
                  <div>
                    <label className="text-xs font-light text-white/60 block mb-2 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl h-12 pl-11 pr-4 text-white text-sm font-light placeholder:text-white/20 focus:border-purple-500/40 focus:bg-white/[0.04] outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-light text-white/60 block mb-2 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl h-12 pl-11 pr-4 text-white text-sm font-light placeholder:text-white/20 focus:border-purple-500/40 focus:bg-white/[0.04] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-light text-white/60 block mb-2 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl h-12 pl-11 pr-12 text-white text-sm font-light placeholder:text-white/20 focus:border-purple-500/40 focus:bg-white/[0.04] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {isSignUp && (
                    <p className="text-xs font-extralight text-white/30 mt-2">
                      Must be at least 8 characters
                    </p>
                  )}
                </div>

                {!isSignUp && (
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-white/10 bg-white/[0.02] text-purple-500 focus:ring-purple-500/40"
                      />
                      <span className="font-extralight text-white/40">Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="font-light text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-light text-sm hover:brightness-110 transition-all duration-300 mt-6"
                >
                  {isSignUp ? "Create Account" : "Sign In"}
                </button>
              </form>

              {/* Toggle Sign In/Sign Up */}
              <div className="mt-6 text-center">
                <p className="text-sm font-extralight text-white/40">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="font-light text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </div>

              {/* Terms */}
              {isSignUp && (
                <p className="text-xs font-extralight text-white/30 text-center mt-6 leading-relaxed">
                  By creating an account, you agree to our{" "}
                  <button className="text-white/50 hover:text-white/70 transition-colors">
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button className="text-white/50 hover:text-white/70 transition-colors">
                    Privacy Policy
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
