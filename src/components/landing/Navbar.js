"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const json = await res.json();
        if (res.ok && json.success) {
          setUser(json.data);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }

      // Check super admin token
      const saToken = window.localStorage.getItem("super_admin_token");
      if (saToken === "hardcoded-super-admin-token") {
        setIsSuperAdmin(true);
      }
      
      setLoading(false);
    }
    checkAuth();
  }, []);

  const dashboardUrl = isSuperAdmin ? "/super-admin/packages" : "/dashboard";

  const navItems = ["Features", "Integrations", "Pricing", "Support"];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="text-xl md:text-2xl font-bold tracking-tight">
            Smart Growth<span className="md:inline hidden"> Manager</span><span className="font-light text-amber-500">|</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden space-x-8 md:flex">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 sm:flex">
              {!loading && (
                <>
                  {(user || isSuperAdmin) ? (
                    <a
                      href={dashboardUrl}
                      className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black"
                    >
                      Dashboard
                    </a>
                  ) : (
                    <>
                      <a href="/login" className="text-sm font-semibold text-slate-900">Log In</a>
                      <a
                        href="#pricing"
                        className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
                      >
                        Get Started
                      </a>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-100 bg-white md:hidden"
          >
            <div className="space-y-1 px-4 pt-2 pb-6">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block rounded-lg px-3 py-4 text-base font-semibold text-slate-900 hover:bg-slate-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-slate-100">
                {!loading && (
                  <>
                    {(user || isSuperAdmin) ? (
                      <a
                        href={dashboardUrl}
                        className="flex justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </a>
                    ) : (
                      <>
                        <a 
                          href="/login" 
                          className="flex justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Log In
                        </a>
                        <a
                          href="#pricing"
                          className="flex justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Get Started
                        </a>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
