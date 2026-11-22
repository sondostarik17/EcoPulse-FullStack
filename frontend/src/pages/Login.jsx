
import { useState } from "react";
import { loginUser, googleLogin } from "../services/api";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import "../all.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "mt-2.5 w-full rounded-xl border border-white/10 bg-[#090D0C] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

  // Redirect according to the role stored in MongoDB
  const redirectByRole = (account) => {
    if (!account?.id || !account?.role) {
      throw new Error("Invalid account information received.");
    }

    window.dispatchEvent(new Event("authChanged"));

    if (account.role === "admin") {
      // Open the separate Admin Dashboard
      window.location.replace("http://localhost:5174/");
      return;
    }

    if (account.role === "user") {
      const destination = location.state?.from?.pathname || "/";
      navigate(destination, { replace: true });
      return;
    }

    throw new Error("This account has an unsupported role.");
  };

  // Email and Password Login
  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(normalizedEmail, password);

      // The server sets the HttpOnly cookie.
      // No token or account data is saved in localStorage.
      if (!data?.success || !data?.user) {
        throw new Error(
          data?.message || "Unable to complete login."
        );
      }

      redirectByRole(data.user);
    } catch (err) {
      setError(err.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google Login - Regular Users
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");

    if (!credentialResponse?.credential) {
      setError("Google sign-in failed. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const data = await googleLogin(credentialResponse.credential);

      if (!data?.success || !data?.user) {
        throw new Error(
          data?.message || "Google sign-in failed."
        );
      }

      if (data.user.role !== "user") {
        throw new Error(
          "Google sign-in is available for user accounts only."
        );
      }

      redirectByRole(data.user);
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060908] px-4 py-8 text-white sm:px-6">

      {/* Background Effects */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-green-500/[0.08] blur-[110px]" />

      <div className="relative z-10 w-full max-w-6xl">

        {/* Back Link */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-emerald-400"
        >
          <ArrowLeft size={17} />
          Back to EcoPulse
        </Link>

        <div className="grid overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0B0F0D] shadow-2xl shadow-black/40 lg:grid-cols-[1fr_0.82fr]">

          {/* Login Section */}
          <section className="p-5 sm:p-8 lg:p-10 xl:p-12">

            {/* Logo */}
            <div className="mb-9 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-gray-950 shadow-lg shadow-emerald-500/15">
                <Leaf size={23} strokeWidth={2.5} />
              </div>

              <div>
                <p className="text-xl font-black tracking-tight">
                  Eco<span className="text-emerald-400">Pulse</span>
                </p>

                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[2.5px] text-gray-500">
                  Cleaner communities
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <ShieldCheck size={14} />
                Secure account access
              </span>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Welcome{" "}
                <span className="text-emerald-400">back.</span>
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                Sign in to continue your journey toward a cleaner community.
              </p>
            </div>

            {/* Registration Success */}
            {location.state?.registered && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] p-3 text-sm text-emerald-300">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>
                  Account created successfully. Please sign in.
                </span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <label className="block text-sm font-semibold text-gray-300">
                Email Address

                <span className="relative block">
                  <Mail
                    size={18}
                    className="absolute left-4 top-[26px] -translate-y-1/2 text-gray-500"
                  />

                  <input
                    required
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your email"
                    className={`${inputClass} pl-11`}
                  />
                </span>
              </label>

              {/* Password */}
              <label className="block text-sm font-semibold text-gray-300">
                Password

                <span className="relative block">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-[26px] -translate-y-1/2 text-gray-500"
                  />

                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    className={`${inputClass} pl-11 pr-11`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-[26px] -translate-y-1/2 text-gray-500 transition hover:text-emerald-400"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </span>
              </label>

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300"
                >
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-4 text-sm font-extrabold text-gray-950 shadow-lg shadow-emerald-500/10 transition hover:-translate-y-0.5 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-semibold text-gray-500">
                  OR CONTINUE WITH
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Google Login */}
              <div className="flex justify-center overflow-hidden rounded-xl bg-white">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    setError("Google sign-in failed. Please try again.")
                  }
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="320"
                />
              </div>

              {/* Register Link */}
              <div className="pt-3 text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-bold text-emerald-400 transition hover:text-emerald-300"
                >
                  Create Account
                </Link>
              </div>
            </form>

            {/* Security Note */}
            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-gray-500">
              <LockKeyhole size={14} className="text-emerald-400" />
              Your account is protected with secure authentication.
            </div>
          </section>

          {/* Decorative Panel */}
          <aside className="relative hidden flex-col justify-between overflow-hidden border-l border-white/[0.07] bg-[#0E1712] p-10 lg:flex xl:p-12">

            <div className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rounded-full border border-emerald-400/10" />
            <div className="pointer-events-none absolute -right-8 top-28 h-44 w-44 rounded-full border border-emerald-400/[0.08]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-500/[0.07] blur-3xl" />

            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <Leaf size={28} />
              </div>

              <h2 className="mt-8 max-w-sm text-3xl font-black leading-tight xl:text-4xl">
                A cleaner city
                <br />
                starts with
                <span className="text-emerald-400"> you.</span>
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-gray-400">
                Report dirty locations, follow cleanup progress, and become
                part of a cleaner community.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Report waste in your area",
                  "Track your cleanup requests",
                  "Support a cleaner community",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-emerald-400"
                    />
                    <span className="text-sm text-gray-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-12 rounded-2xl border border-white/[0.08] bg-black/20 p-5">
              <p className="text-sm font-bold text-white">
                One community, one goal.
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-400">
                Every report is a step toward a cleaner environment.
              </p>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} EcoPulse. Together for a cleaner
          environment.
        </p>
      </div>
    </main>
  );
}
