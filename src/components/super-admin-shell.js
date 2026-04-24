"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, LogOut, ShoppingBag, WalletCards } from "lucide-react";

const SUPER_ADMIN_TOKEN = "hardcoded-super-admin-token";

export default function SuperAdminShell({ title, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const token =
    typeof window === "undefined" ? null : window.localStorage.getItem("super_admin_token");
  const isAuthenticated = token === SUPER_ADMIN_TOKEN;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/super-admin");
    }
  }, [isAuthenticated, router]);

  function handleLogout() {
    window.localStorage.removeItem("super_admin_token");
    router.replace("/super-admin");
  }

  if (!isAuthenticated) {
    return <main className="min-h-screen p-8">Checking admin session...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full border-r bg-slate-900 p-6 text-white md:fixed md:h-screen md:w-[260px]">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <span className="text-xl font-bold italic">S</span>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Admin Pro</h2>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Control Center</p>
            </div>
          </div>

          <nav className="mt-10 grid gap-1">
            {[
              { name: "Packages", href: "/super-admin/packages", icon: Box },
              { name: "Subscriptions", href: "/super-admin/subscriptions", icon: WalletCards },
              { name: "Orders", href: "/super-admin/orders", icon: ShoppingBag },
            ].map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-10">
            <button
              className="group flex w-full items-center gap-3 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:border-slate-500 hover:bg-white/5 hover:text-white"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 md:ml-[260px]">
          <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-white/80 px-8 backdrop-blur-md">
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-slate-200"></div>
              <span className="text-sm font-medium text-slate-600">Super Admin</span>
            </div>
          </header>
          <div className="p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
