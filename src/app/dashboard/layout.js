"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me");
        const json = await response.json();
        
        if (!response.ok || !json?.success) {
          router.replace("/login");
          return;
        }
        
        setSessionUser(json?.data || null);
      } catch (err) {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 italic">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar sessionUser={sessionUser} onLogout={handleLogout} />
      
      <div className="pl-72 transition-all duration-300">
        <Navbar sessionUser={sessionUser} title="Dashboard" />
        
        <main className="min-h-[calc(100vh-80px)] p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
