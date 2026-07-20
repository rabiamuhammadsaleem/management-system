import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface LoginProps {
  onNavigateToRegister: () => void;
}

export default function Login({ onNavigateToRegister }: LoginProps) {
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email.trim() || !password.trim()) {
      setValidationError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen w-full flex items-center justify-center bg-[#050505] text-[#e5e5e5] px-4">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111111_1px,transparent_1px),linear-gradient(to_bottom,#111111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-[#0c0c0c] rounded-none border border-zinc-800 shadow-2xl overflow-hidden relative z-10 p-8 sm:p-10"
      >
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-none bg-zinc-900 border border-zinc-800 text-[#C5A059] mb-4 shadow-sm">
            <LogIn className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-serif font-normal text-zinc-100 tracking-wide italic sm:text-3xl">
            Sign In
          </h2>
          <p className="mt-2 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
            NEXUS HR ADMINISTRATIVE GATEWAY
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {(error || validationError) && (
            <div className="flex items-start space-x-2.5 p-3.5 rounded-none bg-rose-950/25 border border-rose-900 text-rose-400 text-xs font-semibold">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Email Address */}
            <div>
              <label htmlFor="login-email" className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Work Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nexus.com"
                  className="w-full rounded-none border border-zinc-800 bg-[#0f0f0f] py-2.5 pl-10 pr-4 text-sm font-medium text-zinc-200 placeholder-zinc-700 transition-colors focus:outline-hidden focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-none border border-zinc-800 bg-[#0f0f0f] py-2.5 pl-10 pr-4 text-sm font-medium text-zinc-200 placeholder-zinc-700 transition-colors focus:outline-hidden focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20"
                />
              </div>
            </div>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-none bg-[#C5A059] px-4 py-3 text-xs font-bold uppercase tracking-widest text-black shadow-lg hover:bg-[#d6b57a] focus:outline-hidden focus:ring-1 focus:ring-[#C5A059] transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Establish Secure Session"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
          <p className="text-xs text-zinc-500">
            Don't have an admin credential?{" "}
            <button
              id="btn-goto-register"
              onClick={onNavigateToRegister}
              className="font-bold text-[#C5A059] hover:text-[#d6b57a] transition-colors cursor-pointer ml-1"
            >
              Request Access
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
