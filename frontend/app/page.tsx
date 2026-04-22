"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { RegisterFormData, AuthResponse } from "@/types/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://intern-test-ez2k.onrender.com/api/v1/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const responseData = await response.json();

      if (!response.ok) {
        // Handle structured error response with validation errors
        if (responseData.errors && responseData.errors.length > 0) {
          const errorMessages = responseData.errors
            .map((err: any) => err.message)
            .join("; ");
          throw new Error(errorMessages);
        }
        throw new Error(responseData.message || "Registration failed");
      }

      // Extract data from the new structured response format
      const { token, user } = responseData.data;

      // Optionally store token if auto-login is desired
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputCls =
    "w-full bg-slate-800/80 border border-indigo-500/20 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all";

  const EyeOpen = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
  const EyeOff = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] rounded-full bg-indigo-500 opacity-20 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] rounded-full bg-violet-500 opacity-20 blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-6 bg-slate-900/80 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-10 shadow-2xl">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-100 tracking-tight">
            TaskFlow
          </span>
        </div>

        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
          Create account
        </h1>
        <p className="text-slate-400 text-sm mb-7">
          Join TaskFlow to get started
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm mb-5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Full Name
            </label>
            <div className="relative flex items-center">
              <svg
                className="absolute left-3 text-slate-500 pointer-events-none"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="reg-fullname"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
                autoComplete="name"
                className={inputCls}
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Email Address
            </label>
            <div className="relative flex items-center">
              <svg
                className="absolute left-3 text-slate-500 pointer-events-none"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="reg-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className={inputCls}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Password
            </label>
            <div className="relative flex items-center">
              <svg
                className="absolute left-3 text-slate-500 pointer-events-none"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
                className={`${inputCls} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>

            {/* Password Requirements */}
            {formData.password && (
              <div className="mt-2 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                <p className="text-xs font-semibold text-slate-400 mb-2">
                  Password Requirements:
                </p>
                <div className="space-y-1 text-xs">
                  <div
                    className={
                      formData.password.length >= 6
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }
                  >
                    <span>{formData.password.length >= 6 ? "✓" : "○"}</span> At
                    least 6 characters
                  </div>
                  <div
                    className={
                      /[A-Z]/.test(formData.password)
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }
                  >
                    <span>{/[A-Z]/.test(formData.password) ? "✓" : "○"}</span>{" "}
                    One uppercase letter (A-Z)
                  </div>
                  <div
                    className={
                      /[a-z]/.test(formData.password)
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }
                  >
                    <span>{/[a-z]/.test(formData.password) ? "✓" : "○"}</span>{" "}
                    One lowercase letter (a-z)
                  </div>
                  <div
                    className={
                      /\d/.test(formData.password)
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }
                  >
                    <span>{/\d/.test(formData.password) ? "✓" : "○"}</span> One
                    number (0-9)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <svg
                className="absolute left-3 text-slate-500 pointer-events-none"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                id="reg-confirm-password"
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
                autoComplete="new-password"
                className={`${inputCls} pr-11 ${
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                    : formData.confirmPassword &&
                        formData.password === formData.confirmPassword
                      ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20"
                      : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirm ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>
            {formData.confirmPassword &&
              formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-400 mt-0.5">
                  Passwords do not match
                </p>
              )}
            {formData.confirmPassword &&
              formData.password === formData.confirmPassword && (
                <p className="text-xs text-emerald-400 mt-0.5">
                  ✓ Passwords match
                </p>
              )}
          </div>

          {/* Role selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Register As
            </label>
            <div className="flex gap-3">
              {(["user", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  id={`role-${r}`}
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    formData.role === r
                      ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                      : "bg-slate-800/80 border-indigo-500/15 text-slate-500 hover:border-indigo-500/40 hover:text-slate-300"
                  }`}
                >
                  {r === "user" ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  )}
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="mt-1 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Creating account…
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <a
            href="/login"
            id="goto-login"
            className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
