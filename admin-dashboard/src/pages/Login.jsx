
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  ClipboardList,
  Users,
  ChartNoAxesCombined,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

import { loginAdmin } from "../services/api";

export default function Login({ accessDenied = false }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await loginAdmin(email, password);

      // Notify App.jsx that authentication has changed
      window.dispatchEvent(new Event("authChanged"));

      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060908] px-4 py-8 text-white sm:px-6 lg:px-10">

      {/* Background Effects */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/[0.09] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-400/[0.07] blur-[120px]" />

      <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0B0F0D] shadow-2xl shadow-black/40 lg:grid-cols-2">

        {/* LEFT SIDE */}
        <section className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-12">

          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                <Leaf size={27} strokeWidth={2.2} />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Eco<span className="text-emerald-400">Pulse</span>
                </h1>

                <p className="mt-0.5 text-[10px] font-semibold tracking-[0.22em] text-gray-500">
                  CLEANER COMMUNITIES
                </p>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-1.5 text-xs font-semibold text-emerald-400">
              <ShieldCheck size={14} />
              Admin Workspace
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome <span className="text-emerald-400">Back.</span>
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-400">
              Sign in to your administrator account to manage reports,
              monitor activities, and keep the community organized.
            </p>
          </div>

          {/* Access Denied Message */}
          {accessDenied && (
            <div
              role="alert"
              className="mb-5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.08] p-4 text-sm leading-6 text-amber-400"
            >
              This account does not have administrator access.
              Please sign in using an admin account.
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Email Address
              </label>

              <div className="group relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition group-focus-within:text-emerald-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your admin email"
                  autoComplete="username"
                  required
                  className="h-14 w-full rounded-2xl border border-white/[0.09] bg-[#0E1712] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/[0.08]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Password
              </label>

              <div className="group relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition group-focus-within:text-emerald-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-14 w-full rounded-2xl border border-white/[0.09] bg-[#0E1712] pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/[0.08]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-emerald-400"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Error */}
            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 font-bold text-[#06100B] shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-400 hover:shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          {/* Back to User Website */}
          <a
            href="http://localhost:5175/"
            className="mt-7 flex items-center justify-center gap-2 text-sm text-gray-500 transition hover:text-emerald-400"
          >
            Back to EcoPulse Website
            <ExternalLink size={14} />
          </a>

          <p className="mt-8 text-center text-xs text-gray-600">
            © 2026 EcoPulse. Admin Workspace.
          </p>
        </section>

        {/* RIGHT SIDE */}
        <section className="relative hidden flex-col justify-between overflow-hidden border-l border-white/[0.06] bg-[#0E1712] p-10 lg:flex xl:p-12">

          <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-emerald-500/[0.10] blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-emerald-400/[0.06] blur-[90px]" />

          <div className="relative z-10">
            <div className="mb-12 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400">
              <ShieldCheck size={34} strokeWidth={1.7} />
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
              Administrator Portal
            </p>

            <h3 className="max-w-md text-3xl font-extrabold leading-tight xl:text-4xl">
              Manage Your
              <br />
              <span className="text-emerald-400">
                Community Impact.
              </span>
            </h3>

            <p className="mt-5 max-w-md text-sm leading-7 text-gray-400">
              A centralized workspace designed to help administrators
              manage environmental reports, users, and platform activities
              efficiently.
            </p>
          </div>

          {/* Features */}
          <div className="relative z-10 my-12 space-y-4">

            <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ClipboardList size={21} />
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-200">
                  Reports Management
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  Review and manage submitted reports.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Users size={21} />
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-200">
                  User Management
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  Keep track of registered community members.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ChartNoAxesCombined size={21} />
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-200">
                  Platform Analytics
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  Monitor platform performance and activity.
                </p>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="relative z-10 flex items-start gap-3 border-t border-white/[0.07] pt-6">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-emerald-400"
            />

            <p className="text-xs leading-6 text-gray-500">
              Secure administrator access. Only authorized admin accounts
              can enter this workspace.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
