"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SUPER_ADMIN_EMAIL = "admin@smartdelivery.com";
const SUPER_ADMIN_PASSWORD = "123456";
const SUPER_ADMIN_TOKEN = "hardcoded-super-admin-token";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("super_admin_token");
    if (token === SUPER_ADMIN_TOKEN) {
      router.replace("/super-admin/orders");
    }
  }, [router]);

  function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    // Simulate a slight delay for better UX
    setTimeout(() => {
      if (email !== SUPER_ADMIN_EMAIL || password !== SUPER_ADMIN_PASSWORD) {
        setError("Invalid credentials. Please verify your admin access.");
        setLoading(false);
        return;
      }

      window.localStorage.setItem("super_admin_token", SUPER_ADMIN_TOKEN);
      router.push("/super-admin/orders");
    }, 800);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]"></div>
      <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]"></div>
      
      <div className="relative w-full max-w-md p-6">
        {/* Branding */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/40">
            <span className="text-3xl font-black italic text-white">S</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Admin Pro</h1>
          <p className="mt-2 text-sm font-medium text-slate-400">Secure Gateway for Super Administrators</p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Admin Email</label>
              <input
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white outline-none transition-all focus:border-indigo-500 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20"
                type="email"
                placeholder="admin@smartdelivery.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Access Password</label>
              <input
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white outline-none transition-all focus:border-indigo-500 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 p-4 text-xs font-bold text-red-400 border border-red-500/20 animate-in fade-in slide-in-from-top-2">
                <span>⚠️</span>
                {error}
              </div>
            )}

            <button
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <span>Initialize Admin Session</span>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-white/5 pt-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              System Protected by SmartDelivery Guard
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
            <button 
                onClick={() => router.push('/')}
                className="text-xs font-bold text-slate-500 transition-colors hover:text-white"
            >
                ← Return to Public Site
            </button>
        </div>
      </div>
    </main>
  );
}
